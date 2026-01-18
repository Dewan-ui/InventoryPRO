/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEET_ID: string;
  readonly VITE_SHEET_GID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend the NodeJS namespace to define the structure of process.env
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

// Fix: Use 'var' instead of 'const' for the global 'process' declaration to avoid 
// "Cannot redeclare block-scoped variable" errors when conflicting with other global types.
declare var process: {
  env: NodeJS.ProcessEnv;
};
