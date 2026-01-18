// Fix: Removed triple-slash reference to 'vite/client' which was causing "Cannot find type definition file" errors.
// The required ImportMeta and ImportMetaEnv interfaces are defined locally below to ensure support for Vite's import.meta.env.

interface ImportMetaEnv {
  readonly VITE_SHEET_ID: string;
  readonly VITE_SHEET_GID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Fix: Augmented the NodeJS namespace to define the structure of process.env.
// This is the correct way to provide types for process.env when Node.js types are present in the environment.
// It avoids the "Cannot redeclare block-scoped variable 'process'" error by extending the existing global declaration.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
