import { InputStream, Mp4, Rescaler, View } from "@swmansion/smelter";
import type Smelter from "@swmansion/smelter-web-wasm";
import { type Ref, forwardRef, useCallback, useRef } from "react";

import { create } from "zustand";
import SmelterCanvas from "../SmelterCanvas";
import { INPUT_SIZE } from "./Stream";

type CameraStore = {
  cameraInputsCount: number;
  setCameraInputsCount: (counter: number) => void;
};

export const useCameraStore = create<CameraStore>((set) => ({
  cameraInputsCount: 1,
  setCameraInputsCount: (counter) => set({ cameraInputsCount: counter }),
}));

type CameraProps = {
  smelter?: Smelter;
};

function Camera({ smelter }: CameraProps, ref: Ref<Smelter>) {
  const { cameraInputsCount, setCameraInputsCount } = useCameraStore();
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const onCanvasCreate = useCallback(
    async (canvasRef: HTMLCanvasElement | null) => {
      if (ref && "current" in ref) {
        (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = canvasRef;
      }
      await smelter?.registerInput("camera", { type: "camera" });
    },
    [smelter]
  );

  const handleIncrease = () => {
    setCameraInputsCount(cameraInputsCount + 1);
  };

  const handleDecrease = () => {
    setCameraInputsCount(Math.max(0, cameraInputsCount - 1));
  };

  if (!smelter) {
    return <div className="bg-demos-background" style={{ ...INPUT_SIZE }} />;
  }

  return (
    <div className="bg-demos-background relative">
      <SmelterCanvas
        id="camera"
        onCanvasCreate={onCanvasCreate}
        smelter={smelter}
        width={INPUT_SIZE.width}
        height={INPUT_SIZE.height}>
        <Rescaler
          style={{
            borderRadius: 16,
            borderColor: "white",
            borderWidth: 1.5,
            rescaleMode: "fill",
          }}>
          <InputStream inputId="camera" />
        </Rescaler>
      </SmelterCanvas>
      <div className="flex flex-col items-center justify-center mb-4 absolute top-0 -right-12">
        <button
          type="button"
          className="px-4 py-2 bg-demos-button text-demos-buttonText rounded shadow"
          onClick={handleIncrease}>
          +
        </button>
        <span className="text-white py-2">{cameraInputsCount}</span>
        <button
          type="button"
          className="px-4 py-2 bg-demos-button text-demos-buttonText rounded shadow"
          onClick={handleDecrease}>
          -
        </button>
      </div>
    </div>
  );
}

export default forwardRef<Smelter, CameraProps>(Camera);
