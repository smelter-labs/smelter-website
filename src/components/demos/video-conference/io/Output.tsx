import type Smelter from "@swmansion/smelter-web-wasm";

import { InputStream, Rescaler, Tiles, View } from "@swmansion/smelter";
import { COLORS } from "../../../../../styles/colors";
import SmelterVideo from "../../SmelterVideo";
import { useUserSettingsStore } from "../settings/UsersSettingsSection";

export const OUTPUT_SIZE = { width: 1270, height: 720 };

type OutputProps = {
  smelter: Smelter;
};

export default function Output({ smelter }: OutputProps) {
  return (
    <div className="flex flex-col gap-y-4">
      <SmelterVideo
        smelter={smelter}
        id="output"
        width={OUTPUT_SIZE.width}
        height={OUTPUT_SIZE.height}>
        <OutputContent />
      </SmelterVideo>
    </div>
  );
}

function OutputContent() {
  const {usersCount, isCameraActive} = useUserSettingsStore()
  return (
    <View
      style={{
        borderRadius: 16,
        borderColor: COLORS.white100,
        borderWidth: 1.5,
      }}>
                <Tiles
        transition={{ durationMs: 200 }}
        style={{ margin: 4, horizontalAlign: "left", verticalAlign: "top" }}>
        {Array.from({ length: usersCount }, (_item, index) => (
          <Rescaler
            // biome-ignore lint/suspicious/noArrayIndexKey: ignore
            key={index}
            style={{
              borderRadius: 12,
              borderColor: COLORS.white100,
              borderWidth: 1.5,
              rescaleMode: "fill",
            }}>
            {isCameraActive ? <InputStream id={`camera${index}`} inputId="camera" /> : <InputStream id={`camera${index}`} inputId="streamer" />}
          </Rescaler>
        ))}
      </Tiles>

    </View>
  );
}
