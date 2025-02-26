import { InputStream, Mp4, Rescaler, View } from "@swmansion/smelter";
import type Smelter from "@swmansion/smelter-web-wasm";
import { type Ref, forwardRef, useCallback, useRef } from "react";

import SmelterCanvas from "../SmelterCanvas";
import { INPUT_SIZE } from "./Stream";

type CameraProps = {
  smelter: Smelter;
};
function Camera({ smelter }: CameraProps, ref: Ref<Smelter>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const onCanvasCreate = useCallback(async (canvasRef: HTMLCanvasElement | null) => {
    if (ref && "current" in ref) {
      (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = canvasRef;
    }
    await smelter.registerInput("camera", { type: "camera" });
  }, []);

  return (
    <div>
      <SmelterCanvas
        id="camera"
        onCanvasCreate={onCanvasCreate}
        smelter={smelter}
        width={INPUT_SIZE.width}
        height={INPUT_SIZE.height}>
        <Rescaler
          style={{
            borderRadius: 24,
            borderColor: "white",
            borderWidth: 1,
            rescaleMode: "fill",
          }}>
          <InputStream inputId="camera" />
        </Rescaler>
      </SmelterCanvas>
    </div>
  );
}

export default forwardRef<Smelter, CameraProps>(Camera);
