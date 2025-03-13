import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
import { useEffect } from "react";
import BroadcastMp4 from "../../../assets/broadcast.mp4";
import Edit from "../../../assets/demos/edit.svg";
import { useSmelter } from "../smelter-utils/useSmelter";
import { useChyronStore } from "./io/Chyron";
import Output from "./io/Output";

setWasmBundleUrl("/smelter.wasm");

export default function SmelterSection() {
  const smelter = useSmelter();

  const {
    chyronContent,
    labelColor,
    backgroundColor,
    setChyronContent,
    setLabelColor,
    setBackgroundColor,
  } = useChyronStore();

  useEffect(() => {
    if (!smelter) {
      return;
    }

    void smelter?.registerInput("broadcast", { url: BroadcastMp4, type: "mp4" });

    const intervalBroadcast = setInterval(async () => {
      await smelter?.unregisterInput("broadcast").catch(() => {});
      await smelter?.registerInput("broadcast", { url: BroadcastMp4, type: "mp4" });
    }, 20000);

    return () => {
      clearInterval(intervalBroadcast);
    };
  }, [smelter]);

  return (
    <div className="flex flex-col">
      <div className="flex w-full shrink flex-col justify-center gap-6 sm:flex-row">
        <div className="flex flex-3">
          <div className="flex w-full flex-col">
            {smelter && <Output smelter={smelter} />}
            <div className="flex flex-1" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <textarea
            value={chyronContent}
            onChange={(e) => setChyronContent(e.target.value)}
            placeholder="Enter a chyron content"
            className="h-1/2 rounded-md border bg-demos-background p-4 text-demos-text shadow-sm focus:outline-none"
          />
          <div className="flex flex-row items-center gap-2">
            <div className="group relative flex flex-col items-center">
              <input
                type="color"
                id="backgroundColor"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="h-10 w-20 cursor-pointer rounded-md border border-demos-border"
              />
              <img
                alt="edit"
                src={Edit.src}
                className="pointer-events-none absolute mt-2 cursor-pointer opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>
            <p className="text-demos-text">Background color</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="group relative flex flex-col items-center">
              <input
                type="color"
                id="labelColor"
                value={labelColor}
                onChange={(e) => setLabelColor(e.target.value)}
                className="h-10 w-20 cursor-pointer rounded-md border border-demos-border"
              />
              <img
                alt="edit"
                src={Edit.src}
                className="pointer-events-none absolute mt-2 cursor-pointer opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            </div>
            <p className="text-demos-text">Text color</p>
          </div>
        </div>
      </div>
    </div>
  );
}
