import { InputStream, Mp4, Rescaler, View } from "@swmansion/smelter";
import type Smelter from "@swmansion/smelter-web-wasm";
import { type Ref, forwardRef, useCallback, useEffect, useRef } from "react";
import CommercialMp4 from "../../../../assets/demos/game.mp4";
import SmelterCanvas from "../SmelterCanvas";

export const INPUT_SIZE = { width: 320, height: 180 };

type StreamProps = {
  smelter: Smelter;
};

function Stream({ smelter }: StreamProps, ref: Ref<Smelter>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const onCanvasCreate = useCallback(async (canvasRef: HTMLCanvasElement | null) => {
    if (ref && "current" in ref) {
      (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = canvasRef;
    }

    smelter.registerInput("stream", { url: CommercialMp4, type: "mp4" });
  }, []);

  return (
    <div>
      <SmelterCanvas
        id="stream"
        smelter={smelter}
        onCanvasCreate={onCanvasCreate}
        width={INPUT_SIZE.width}
        height={INPUT_SIZE.height}>
        <Rescaler
          style={{
            borderRadius: 24,
            borderColor: "white",
            borderWidth: 1,
          }}>
          <InputStream inputId="stream" />
        </Rescaler>
      </SmelterCanvas>
    </div>
  );
}

export default forwardRef<Smelter, StreamProps>(Stream);
