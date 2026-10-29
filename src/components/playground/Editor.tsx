import * as monaco from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import TsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export type EditorHandle = {
  setValue: (code: string) => void;
};

type Props = {
  defaultValue: string;
  onChange: (code: string) => void;
  onRun: () => void;
};

self.MonacoEnvironment = {
  getWorker(_workerId, label) {
    return label === "typescript" || label === "javascript" ? new TsWorker() : new EditorWorker();
  },
};

// Type definitions of the SDK version the playground runs, so the editor
// offers completions and type errors for Smelter components.
const RUNTIME_ROOT = "/packages/playground-runtime";
const typeFiles = {
  ...import.meta.glob<string>(
    "/packages/playground-runtime/node_modules/@swmansion/smelter/esm/**/*.d.ts",
    { query: "?raw", import: "default" }
  ),
  ...import.meta.glob<string>(
    "/packages/playground-runtime/node_modules/@swmansion/smelter-web-client/dist/index.d.ts",
    { query: "?raw", import: "default" }
  ),
  ...import.meta.glob<string>(
    "/packages/playground-runtime/node_modules/@types/react/{index,global,jsx-runtime}.d.ts",
    { query: "?raw", import: "default" }
  ),
};

const PACKAGE_ENTRY_SHIMS: Record<string, string> = {
  "node_modules/@swmansion/smelter/index.d.ts": `export * from "./esm/index";`,
  "node_modules/@swmansion/smelter-web-client/index.d.ts": `export * from "./dist/index";\nexport { default } from "./dist/index";`,
};

let monacoConfigured: Promise<void> | undefined;

function configureMonaco(): Promise<void> {
  monacoConfigured ??= (async () => {
    const ts = monaco.languages.typescript;
    ts.typescriptDefaults.setCompilerOptions({
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      jsx: ts.JsxEmit.ReactJSX,
      strict: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      skipLibCheck: true,
    });
    await Promise.all(
      Object.entries(typeFiles).map(async ([path, load]) => {
        const virtualPath = path.slice(RUNTIME_ROOT.length + 1);
        ts.typescriptDefaults.addExtraLib(await load(), `file:///${virtualPath}`);
      })
    );
    for (const [path, content] of Object.entries(PACKAGE_ENTRY_SHIMS)) {
      ts.typescriptDefaults.addExtraLib(content, `file:///${path}`);
    }
    monaco.editor.defineTheme("smelter", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#161127" },
    });
  })();
  return monacoConfigured;
}

const Editor = forwardRef<EditorHandle, Props>(function Editor(
  { defaultValue, onChange, onRun },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const callbacks = useRef({ onChange, onRun });
  callbacks.current = { onChange, onRun };

  useImperativeHandle(ref, () => ({
    setValue: (code) => editorRef.current?.setValue(code),
  }));

  // biome-ignore lint/correctness/useExhaustiveDependencies: the editor is created once, `defaultValue` is only the initial content
  useEffect(() => {
    let disposed = false;
    let editor: monaco.editor.IStandaloneCodeEditor | undefined;
    void configureMonaco().then(() => {
      if (disposed || !containerRef.current) {
        return;
      }
      const uri = monaco.Uri.parse("file:///App.tsx");
      const model =
        monaco.editor.getModel(uri) ?? monaco.editor.createModel(defaultValue, "typescript", uri);
      model.setValue(defaultValue);
      editor = monaco.editor.create(containerRef.current, {
        model,
        theme: "smelter",
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        tabSize: 2,
      });
      editor.onDidChangeModelContent(() => callbacks.current.onChange(model.getValue()));
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
        callbacks.current.onRun()
      );
      editorRef.current = editor;
    });
    return () => {
      disposed = true;
      editor?.dispose();
      editorRef.current = undefined;
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
});

export default Editor;
