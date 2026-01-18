// Fixed: Removed the reference to 'vite/client' as the type definition file was not found.
// Local interface definitions for ImportMetaEnv and ImportMeta are used instead to support environment variables.

interface ImportMetaEnv {
  readonly VITE_SHEET_ID: string;
  readonly VITE_SHEET_GID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
