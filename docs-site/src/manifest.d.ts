declare module '*/manifest.json' {
  export interface ParamDoc { name: string; type: string; description: string; optional: boolean }
  export interface VerbDoc {
    name: 'getteth' | 'postith' | 'puttest' | 'deleteth';
    themedSummary: string;
    nativeSummary: string;
    params: ParamDoc[];
    examples: string[];
  }
  export interface TomeInitField { themed: string; type: string; description: string; optional: boolean }
  export interface ConfigField { name: string; type: string; description: string; optional: boolean }
  export interface MemberDoc { name: string; type: string; description: string }
  export interface ErrorDoc { name: string; description: string; members: MemberDoc[] }
  export interface Manifest {
    verbs: VerbDoc[];
    tomeInit: TomeInitField[];
    config: ConfigField[];
    tidings: { description: string; members: MemberDoc[]; methods: MemberDoc[] };
    errors: ErrorDoc[];
    factory: { name: string; themedSummary: string; nativeSummary: string; examples: string[] };
  }
  const m: Manifest;
  export default m;
}
