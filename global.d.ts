export declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      /** Present when the Enterprise script (enterprise.js) is the one loaded. */
      enterprise?: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }

  declare const grecaptcha: any;

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
