export declare global {
  interface Window {
    clarity: (command: string, value?: boolean) => void;
  }

  declare const grecaptcha: any;

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
