
// Removed problematic reference to fix "Cannot find type definition file for 'vite/client'"
// Manual type declarations for Vite environment variables are provided below.

interface ImportMetaEnv {
  readonly VITE_SHEET_ID: string;
  readonly VITE_SHEET_GID: string;
  readonly VITE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}
