// Fixed: Removed the reference to 'vite/client' which was failing to resolve in the environment.
// Manual augmentation of the ImportMeta interface ensures type safety for VITE_ environment variables.
interface ImportMetaEnv {
  readonly VITE_SHEET_ID: string;
  readonly VITE_SHEET_GID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
