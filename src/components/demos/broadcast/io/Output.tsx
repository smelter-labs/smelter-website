import type Smelter from "@swmansion/smelter-web-wasm";

import { Image, InputStream, Rescaler, View } from "@swmansion/smelter";
import { useMemo } from "react";
import { COLORS } from "../../../../../styles/colors";
import SmelterLogo from "../../../../assets/navigation/smelter-logo.svg";
import SmelterVideo from "../../SmelterVideo";
import Chyron, { useChyronStore } from "./Chyron";

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
  const { chyronContent, backgroundColor } = useChyronStore();

  const messages = useMemo(() => {
    return chyronContent.split(/\r?\n|\r/);
  }, [chyronContent]);

  return (
    <View
      style={{
        borderRadius: 16,
        borderColor: COLORS.white100,
        borderWidth: 1.5,
      }}>
      <Rescaler style={{ rescaleMode: "fill" }}>
        <InputStream inputId="broadcast" />
      </Rescaler>
      <Rescaler style={{ top: 12, left: 12, width: 100, height: 100 }}>
        <Image imageId="smelter"  />
      </Rescaler>
      <View
        style={{
          bottom: 0,
          left: 0,
          height: 48,
          paddingHorizontal: 24,
          backgroundColor: backgroundColor,
        }}>
        <Chyron messages={messages} messageDurationMs={4000} />
      </View>
    </View>
  );
}
