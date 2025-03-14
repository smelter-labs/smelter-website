import type Smelter from "@swmansion/smelter-web-wasm";

import { Image, InputStream, Rescaler, Tiles, View } from "@swmansion/smelter";
import { COLORS } from "../../../../../styles/colors";
import SmelterVideo from "../../SmelterVideo";
import { useUserSettingsStore } from "../settings/UsersSettingsSection";

export const OUTPUT_SIZE = { width: 1270 * 1.5, height: 720 * 1.5 };

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

  const usersCountFactor = 1 + Math.floor((usersCount - 1) / 4) * 0.25;

  const mutedStyle = {
    width: 64 / usersCountFactor,
    height: 64 / usersCountFactor,
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
          <View key={`${_item}`} style={{ ...OUTPUT_SIZE }}>
            <Rescaler
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
              <Rescaler style={{ top: 12, right: 12, ...mutedStyle }}>
                <Image imageId="muted" />
              </Rescaler>
            )}
          </View>
        ))}
      </Tiles>
    </View>
  );
}
