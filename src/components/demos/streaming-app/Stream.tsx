import { InputStream, Rescaler, View } from "@swmansion/smelter";
import type Smelter from "@swmansion/smelter-web-wasm";
import { type Ref, forwardRef, useCallback } from "react";
import { COLORS } from "../../../../styles/colors";
import CommercialMp4 from "../../../assets/game.mp4";
import SmelterCanvas from "../compose-video/SmelterCanvas";

export const INPUT_SIZE = { width: 1920, height: 1080 };

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

      await smelter?.registerInput("stream", { url: CommercialMp4, type: "mp4" });
    },
    [smelter]
  );

  if (!smelter) {
    return <div className="bg-demos-background" style={{...INPUT_SIZE}} />;
  }

  return (
    <div className="flex justify-center gap-x-4">
      <SmelterCanvas id="stream" smelter={smelter} {...INPUT_SIZE} onCanvasCreate={onCanvasCreate}>
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
      </SmelterCanvas>
      <div className="bg-red-900 flex flex-1">
        
      </div>
    </div>
  );
}

export default forwardRef<Smelter, StreamProps>(Stream);
