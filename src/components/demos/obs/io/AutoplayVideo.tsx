import { InputStream, Rescaler, View } from "@swmansion/smelter";
import type Smelter from "@swmansion/smelter-web-wasm";
import { type Ref, forwardRef, useCallback } from "react";
import { COLORS } from "../../../../../styles/colors";
import CommercialMp4 from "../../../../assets/demos/game.mp4";
import SmelterCanvas from "../SmelterCanvas";

export const INPUT_SIZE = { width: 320, height: 180 };

type StreamProps = {
  smelter?: Smelter;
};

function Stream({ smelter }: StreamProps, ref: Ref<Smelter>) {
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const onCanvasCreate = useCallback(
    async (canvasRef: HTMLCanvasElement | null) => {
      if (ref && "current" in ref) {
        (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = canvasRef;
      }

      smelter?.registerInput("stream", { url: CommercialMp4, type: "mp4" });
    },
    [smelter]
  );

  if (!smelter) {
    return <div className="bg-demos-background" style={{ ...INPUT_SIZE }} />;
  }

  return (

        <View style={{ backgroundColor: COLORS.black100 }}>
          <Rescaler
            style={{
              borderRadius: 16,
              borderColor: COLORS.white100,
              borderWidth: 1.5,
            }}>
            <InputStream inputId="stream" />
          </Rescaler>
        </View>

  );
}

export default forwardRef<Smelter, StreamProps>(Stream);
