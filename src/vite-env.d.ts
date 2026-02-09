/// <reference types="vite/client" />
/** Injected by ViteJS define plugin */
declare const APP_VERSION: string;

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
