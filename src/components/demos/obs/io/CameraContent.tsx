import { InputStream, Rescaler, Tiles, View } from "@swmansion/smelter";

import { useCameraStore } from "./Camera";
import { OUTPUT_SIZE } from "./Output";

export default function CameraContent() {
  const { cameraInputsCount } = useCameraStore();

  return (
    <View style={{left: 0, top: 0, paddingVertical: 8, paddingLeft: 8, width: OUTPUT_SIZE.width / 3 }}>
      <Tiles
        transition={{ durationMs: 200 }}
        style={{ margin: 4, horizontalAlign: "left", verticalAlign: "top" }}>
        {Array.from({ length: cameraInputsCount, }, (item, index) => (
          <Rescaler
            key={item?.toString()}
            style={{
              borderRadius: 12,
              borderColor: "white",
              borderWidth: 1.5,
              rescaleMode: "fill",
            }}>
            <InputStream id={`camera${index}`} inputId="camera-input" />
          </Rescaler>
        ))}
      </Tiles>
    </View>
  );
}
