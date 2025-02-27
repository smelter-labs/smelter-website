import { InputStream, Mp4, Rescaler, View } from "@swmansion/smelter";
import type Smelter from "@swmansion/smelter-web-wasm";
import { type Ref, forwardRef, useCallback, useEffect, useRef, useState } from "react";

import { create } from "zustand";
import SmelterCanvas from "../SmelterCanvas";
import { INPUT_SIZE } from "./Stream";

type CameraStore = {
  cameraInputsCount: number;
  setCameraInputsCount: (counter: number) => void;
};

export const useCameraStore = create<CameraStore>((set) => ({
  cameraInputsCount: 0,
  setCameraInputsCount: (counter) => set({ cameraInputsCount: counter }),
}));

type CameraProps = {
  smelter?: Smelter;
};

function Camera({ smelter }: CameraProps, ref: Ref<Smelter>) {
  const [isCameraReady, setIsCameraReady] = useState(false);
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

  const handleCameraPermissionRequest = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: "camera" });

      // If the permission is already granted
      if (permissionStatus.state === "granted") {
        setIsCameraReady(true);
        setCameraInputsCount(1)
        await smelter?.registerInput("camera-input", { type: "camera" });
      } else if (permissionStatus.state === "prompt") {
        // This will trigger the browser's permission request pop-up
        setIsCameraReady(true);
        setCameraInputsCount(1)
        await smelter?.registerInput("camera-input", { type: "camera" });
      } else {
        alert(
          "Camera access is denied. Please enable camera permissions in your browser settings."
        );
      }
    } catch (error) {
      console.error("Error accessing the camera: ", error);
    }
  };

  if (!smelter) {
    return <div className="bg-demos-background" style={{ ...INPUT_SIZE }} />;
  }

  return (
    <div className="bg-demos-background relative">
      {isCameraReady ? (
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
      ) : (
        <div style={{ ...INPUT_SIZE }} className="flex items-center justify-center rounded-2xl border border-demos-border border-solid">
          <button
            type="button"
            className="rounded bg-demos-button px-4 py-2 text-demos-buttonText shadow"
            onClick={handleCameraPermissionRequest}>
            Toggle camera
          </button>
        </div>
      )}
      <div className="-right-12 absolute top-0 mb-4 flex flex-col items-center justify-center">
        <button
          type="button"
          className="rounded bg-demos-button px-4 py-2 text-demos-buttonText shadow"
          onClick={handleIncrease}>
          +
        </button>
        <span className="py-2 text-white">{cameraInputsCount}</span>
        <button
          type="button"
          className="rounded bg-demos-button px-4 py-2 text-demos-buttonText shadow"
          onClick={handleDecrease}>
          -
        </button>
      </div>
    </div>
  );
}

export default forwardRef<Smelter, CameraProps>(Camera);
