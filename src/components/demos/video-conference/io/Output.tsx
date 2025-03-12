import type Smelter from "@swmansion/smelter-web-wasm";

import { Image, InputStream, Rescaler, Tiles, View } from "@swmansion/smelter";
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
        width={OUTPUT_SIZE.width + 3}
        height={OUTPUT_SIZE.height + 3}>
        <OutputContent />
      </SmelterVideo>
    </div>
  );
}

function OutputContent() {
  const { usersCount, isCameraActive, usersMuted } = useUserSettingsStore();
  const viewStyle =
    usersCount === 1
      ? {
          borderWidth: 0,
        }
      : {
          borderWidth: 1.5,
        };

  const tilesStyle =
    usersCount === 1
      ? {
          margin: 0,
        }
      : {
          margin: 12,
        };

  return (
    <View
      style={{
        borderRadius: 12,
        borderColor: COLORS.white100,
        ...viewStyle,
      }}>
      <Tiles
        transition={{ durationMs: 200 }}
        style={{
          horizontalAlign: "center",
          verticalAlign: "center",
          width: OUTPUT_SIZE.width,
          height: OUTPUT_SIZE.height,
          ...tilesStyle,
        }}>
        {Array.from({ length: usersCount }, (_item, index) => (
          <View>
            <Rescaler
              // biome-ignore lint/suspicious/noArrayIndexKey: ignore
              key={index}
              style={{
                borderRadius: 12,
                borderColor: COLORS.white100,
                borderWidth: 1.5,
                rescaleMode: "fill",
              }}>
              {isCameraActive ? (
                <InputStream id={`camera${index}`} inputId="camera" />
              ) : (
                <InputStream id={`camera${index}`} inputId={`participant${(index % 3) + 1}`} />
              )}
            </Rescaler>
            {usersMuted[index] && (
              <View style={{ height: 100, width: 100, top: 0, right: 0 }}>
                <Image source="/images/voice-off.svg" />
              </View>
            )}
          </View>
        ))}
      </Tiles>
    </View>
  );
}
