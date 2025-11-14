export declare global {
  interface Window {
    clarity: (command: string, value?: boolean) => void;
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
    };
  }

  declare const grecaptcha: any;

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
