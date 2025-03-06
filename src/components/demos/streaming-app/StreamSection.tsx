import type Smelter from "@swmansion/smelter-web-wasm";
import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
import { useState } from "react";

import { create } from "zustand";
import layout1 from "../../../assets/demos/streaming-app/layout1.svg";
import layout2 from "../../../assets/demos/streaming-app/layout2.svg";
import layout3 from "../../../assets/demos/streaming-app/layout3.svg";
import layout4 from "../../../assets/demos/streaming-app/layout4.svg";
import CommercialMp4 from "../../../assets/game.mp4";
import StreamerMp4 from "../../../assets/streamer.mp4";
import WhipStream from "./SmelterWhip";
import StreamContent from "./StreamContent";
import StreamForm from "./StreamForm";

setWasmBundleUrl("/smelter.wasm");

export const INPUT_SIZE = { width: 1920, height: 1080 } as const;

export const LAYOUTS = [
  { id: "layout-streamer", image: layout1 },
  { id: "layout-chat", image: layout2 },
  { id: "layout-message", image: layout3 },
  { id: "layout-camera", image: layout4 },
] as const;

export type LayoutVariant = (typeof LAYOUTS)[number]["id"] | null;

type StreamStore = {
  currentLayout: LayoutVariant;
  setCurrentLayout: (layout: LayoutVariant) => void;
};

export const useStreamStore = create<StreamStore>((set) => ({
  currentLayout: LAYOUTS[0].id,
  setCurrentLayout: (layout: LayoutVariant) => set({ currentLayout: layout }),
}));

export default function StreamSection() {
  const { currentLayout, setCurrentLayout } = useStreamStore();

  const onSmelterCreated = async (smelter: Smelter) => {
    await smelter?.registerInput("stream", { url: CommercialMp4, type: "mp4" });
    await smelter?.registerInput("streamer", { url: StreamerMp4, type: "mp4" });
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
            <StreamForm currentLayout={currentLayout} />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-y-4">
          {LAYOUTS.map((layout, index) => (
            <button
              type="button"
              key={layout.id}
              className="aspect-video"
              onClick={() => {
                setCurrentLayout(layout.id);
              }}>
              <img
                src={layout.image.src}
                alt={layout.id}
                style={{ opacity: currentLayout === layout.id ? "1" : "0.30" }}
                className={
                  "aspect-video w-full rounded-lg border border-solid transition-opacity duration-300"
                }
              />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
