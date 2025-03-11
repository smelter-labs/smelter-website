import type Smelter from "@swmansion/smelter-web-wasm";

import SmelterVideo from "../SmelterVideo";
import { useStreamStore } from "./LayoutsSection";
import WhipStream from "./SmelterWhip";
import StreamContent from "./StreamContent";

export const INPUT_SIZE = { width: 1920, height: 1080 } as const;

export default function Output({ smelter }: { smelter?: Smelter }) {
  const { twitchKey } = useStreamStore();

  console.log("TWITCH KEY ", twitchKey);
  if (!smelter) return null;

  if (twitchKey)
    return (
      <WhipStream
        width={1280}
        smelter={smelter}
        height={720}
        endpointUrl="https://g.webrtc.live-video.net:4443/v2/offer"
        bearerToken={twitchKey}>
        <StreamContent />
      </WhipStream>
    );

  return (
    <SmelterVideo smelter={smelter} id="output" width={INPUT_SIZE.width} height={INPUT_SIZE.height}>
      <StreamContent />
    </SmelterVideo>
  );
}
