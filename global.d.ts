export declare global {
    interface Window {
      clarity: (command:string, value?: boolean) => void;
    }
  }