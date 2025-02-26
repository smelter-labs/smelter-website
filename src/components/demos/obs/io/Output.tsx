import { useInputStreams } from "@swmansion/smelter";
import type Smelter from "@swmansion/smelter-web-wasm";
import { type Ref, forwardRef, useCallback, useEffect, useRef } from "react";
import SmelterCanvas from "../SmelterCanvas";
import OutputConent from "./OutputContent";

export const OUTPUT_SIZE = { width: 480, height: 270 };

type OutputProps = {
  smelter: Smelter;
};

function Output({ smelter }: OutputProps, ref: Ref<Smelter>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const onCanvasCreate = useCallback(async (canvasRef: HTMLCanvasElement | null) => {
    if (ref && "current" in ref) {
      (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = canvasRef;
    }
  }, []);

  return (
    <div>
      <SmelterCanvas
        smelter={smelter}
        id="output"
        onCanvasCreate={onCanvasCreate}
        width={OUTPUT_SIZE.width}
        height={OUTPUT_SIZE.height}>
        <OutputConent />
      </SmelterCanvas>
    </div>
  );
}

export default forwardRef<Smelter, OutputProps>(Output);
