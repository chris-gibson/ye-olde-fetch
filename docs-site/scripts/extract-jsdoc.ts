/**
 * Walks the library's src/*.ts files with ts-morph, extracts every exported
 * declaration's JSDoc, and emits docs-site/src/manifest.json — the single
 * source of truth that the interactive docs site renders from.
 *
 * Runs as `prebuild` and `predev` so the dev server picks up doc changes.
 */
import { Project, JSDoc, JSDocTag, Node } from 'ts-morph';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..');
const libSrc = join(repoRoot, 'src');
const outPath = join(__dirname, '..', 'src', 'manifest.json');

interface ParamDoc {
  name: string;
  type: string;
  description: string;
  optional: boolean;
}

interface MemberDoc {
  name: string;
  type: string;
  description: string;
}

interface VerbDoc {
  name: string;
  themedSummary: string;
  nativeSummary: string;
  params: ParamDoc[];
  examples: string[];
}

interface TomeInitField {
  themed: string;
  type: string;
  description: string;
  optional: boolean;
}

interface ConfigField {
  name: string;
  type: string;
  description: string;
  optional: boolean;
}

interface Manifest {
  verbs: VerbDoc[];
  tomeInit: TomeInitField[];
  config: ConfigField[];
  tidings: { description: string; members: MemberDoc[]; methods: MemberDoc[] };
  errors: { name: string; description: string; members: MemberDoc[] }[];
  factory: { name: string; themedSummary: string; nativeSummary: string; examples: string[] };
}

function splitDescription(doc: JSDoc): { themed: string; native: string } {
  const lines = doc.getDescription().trim().split(/\n\s*\n/);
  const themed = (lines[0] || '').replace(/\n/g, ' ').trim();
  const native = (lines[1] || '').replace(/\n/g, ' ').trim();
  return { themed, native };
}

function getExamples(doc: JSDoc): string[] {
  return doc
    .getTags()
    .filter((t: JSDocTag) => t.getTagName() === 'example')
    .map((t) => t.getCommentText() || '')
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractVerbs(project: Project): VerbDoc[] {
  const file = project.getSourceFileOrThrow(join(libSrc, 'verbs.ts'));
  const verbs: VerbDoc[] = [];
  for (const fn of file.getFunctions()) {
    if (!fn.isExported()) continue;
    const docs = fn.getJsDocs();
    const doc = docs[docs.length - 1];
    if (!doc) continue;
    const { themed, native } = splitDescription(doc);
    const paramTags = doc.getTags().filter((t) => t.getTagName() === 'param');
    const params: ParamDoc[] = fn.getParameters().map((p) => {
      const name = p.getName();
      const tag = paramTags.find((t) => {
        const txt = t.getText();
        return new RegExp(`@param\\s+\\S*\\s*${name}\\b`).test(txt) || txt.includes(`@param ${name}`);
      });
      return {
        name,
        type: p.getType().getText(p),
        description: (tag?.getCommentText() || '').trim(),
        optional: p.isOptional(),
      };
    });
    verbs.push({
      name: fn.getName() ?? '(anonymous)',
      themedSummary: themed,
      nativeSummary: native,
      params,
      examples: getExamples(doc),
    });
  }
  return verbs;
}

function extractInterface(project: Project, file: string, name: string): { description: string; fields: { name: string; type: string; description: string; optional: boolean }[] } {
  const src = project.getSourceFileOrThrow(join(libSrc, file));
  const iface = src.getInterfaceOrThrow(name);
  const ifaceDocs = iface.getJsDocs();
  const ifaceDoc = ifaceDocs[ifaceDocs.length - 1]?.getDescription().trim() ?? '';
  const fields = iface.getProperties().map((prop) => {
    const docs = prop.getJsDocs();
    const doc = docs[docs.length - 1];
    return {
      name: prop.getName(),
      type: prop.getType().getText(prop),
      description: (doc?.getDescription() ?? '').trim(),
      optional: prop.hasQuestionToken(),
    };
  });
  return { description: ifaceDoc, fields };
}

function extractTidings(project: Project): Manifest['tidings'] {
  const src = project.getSourceFileOrThrow(join(libSrc, 'tidings.ts'));
  const cls = src.getClassOrThrow('Tidings');
  const docs = cls.getJsDocs();
  const description = (docs[docs.length - 1]?.getDescription() ?? '').trim();
  const members = cls.getProperties().map((p) => {
    const d = p.getJsDocs();
    return {
      name: p.getName(),
      type: p.getType().getText(p),
      description: (d[d.length - 1]?.getDescription() ?? '').trim(),
    };
  });
  const methods = cls.getMethods().map((m) => {
    const d = m.getJsDocs();
    return {
      name: m.getName(),
      type: m.getType().getText(m),
      description: (d[d.length - 1]?.getDescription() ?? '').trim(),
    };
  });
  return { description, members, methods };
}

function extractErrors(project: Project): Manifest['errors'] {
  const src = project.getSourceFileOrThrow(join(libSrc, 'errors.ts'));
  return src.getClasses().filter((c) => c.isExported()).map((cls) => {
    const docs = cls.getJsDocs();
    const description = (docs[docs.length - 1]?.getDescription() ?? '').trim();
    const members = cls.getProperties().map((p) => {
      const d = p.getJsDocs();
      return {
        name: p.getName(),
        type: p.getType().getText(p),
        description: (d[d.length - 1]?.getDescription() ?? '').trim(),
      };
    });
    return { name: cls.getName() ?? '(anonymous)', description, members };
  });
}

function extractFactory(project: Project): Manifest['factory'] {
  const src = project.getSourceFileOrThrow(join(libSrc, 'factory.ts'));
  const fn = src.getFunctionOrThrow('createYeOldeFetch');
  const docs = fn.getJsDocs();
  const doc = docs[docs.length - 1];
  if (!doc) return { name: 'createYeOldeFetch', themedSummary: '', nativeSummary: '', examples: [] };
  const { themed, native } = splitDescription(doc);
  return {
    name: 'createYeOldeFetch',
    themedSummary: themed,
    nativeSummary: native,
    examples: getExamples(doc),
  };
}

function build(): Manifest {
  const project = new Project({
    tsConfigFilePath: join(repoRoot, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: false,
  });

  const tomeInit = extractInterface(project, 'types.ts', 'TomeInit');
  const config = extractInterface(project, 'types.ts', 'YeOldeConfig');

  return {
    verbs: extractVerbs(project),
    tomeInit: tomeInit.fields.map((f) => ({ themed: f.name, type: f.type, description: f.description, optional: f.optional })),
    config: config.fields,
    tidings: extractTidings(project),
    errors: extractErrors(project),
    factory: extractFactory(project),
  };
}

const manifest = build();
writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`Wrote manifest with ${manifest.verbs.length} verbs, ${manifest.tomeInit.length} options, ${manifest.errors.length} error class(es) → ${outPath}`);
