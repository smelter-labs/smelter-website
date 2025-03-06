import type Smelter from "@swmansion/smelter-web-wasm";
import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";

import CommercialMp4 from "../../../assets/game.mp4";
import StreamerMp4 from "../../../assets/streamer.mp4";
import LayoutsSection from "./LayoutsSection";
import WhipStream from "./SmelterWhip";
import StreamContent from "./StreamContent";
import StreamContent2 from "./StreamContentTest";
import StreamForm from "./StreamForm";

setWasmBundleUrl("/smelter.wasm");

export const INPUT_SIZE = { width: 1920, height: 1080 } as const;

export default function StreamSection() {
  const onSmelterCreated = async (smelter: Smelter) => {
    await smelter?.registerInput("stream", { url: CommercialMp4, type: "mp4" });
    await smelter?.registerInput("streamer", { type: "camera" });
  };

  return (
    <>
      <div className="flex w-full justify-center gap-x-6">
        <div className="flex flex-3.5">
          <div className="flex w-full flex-col">
            <WhipStream
              width={1280}
              height={720}
              onSmelterCreated={onSmelterCreated}>
              <StreamContent />
            </WhipStream>
            <StreamForm />
          </div>
        </div>
        <LayoutsSection />
      </div>
    </>
  );
}
