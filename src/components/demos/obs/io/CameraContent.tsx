import { InputStream, Rescaler, Tiles, View } from "@swmansion/smelter";

import { useCameraStore } from "./Camera";

export default function CameraContent() {
  const { cameraInputsCount } = useCameraStore();

  return (
    <View style={{top: 0, left:0}}>

    <Tiles transition={{ durationMs: 200 }}>
      {Array.from({ length: cameraInputsCount }, (_, index) => (
        <Rescaler
        key={index}
        style={{
          borderRadius: 16,
          borderColor: "white",
          borderWidth: 1.5,
          rescaleMode: "fill",
        }}>
          <InputStream id={`camera${index}`} inputId="camera" />
        </Rescaler>
      ))}
    </Tiles>
      </View>
  );
}
