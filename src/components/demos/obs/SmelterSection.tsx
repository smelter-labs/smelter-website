import Smelter from "@swmansion/smelter-web-wasm";
import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
import { useCallback, useEffect, useRef, useState } from "react";
import { create } from "zustand";
import Arrow from "../../../assets/demos/arrow.svg";
import Arrows from "../../../assets/demos/arrows.svg";
import SmelterLogo from "../../../assets/navigation/smelter-logo-small.svg";
import Camera from "./io/Camera";
import Output from "./io/Output";
import Stream from "./io/Stream";
import TextInput from "./io/TextInput";

setWasmBundleUrl("/smelter.wasm");

export default function SmelterSection() {
  const [smelter, setSmelter] = useState<Smelter>();
  const smelterCameraRef = useRef<Smelter | null>(null);
  const smelterInputRef = useRef<Smelter | null>(null);
  const smelterOutputRef = useRef<Smelter | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const registerSmelter = async () => {
      const smelter = new Smelter({});
      await smelter.init();
      setSmelter(smelter);
      await smelter.start();
    };

    registerSmelter();

    return () => {
      if (smelter) {
        void smelter.terminate();
      }
    };
  }, []);

  return (
    <div className="relative flex items-center">
      <div className="flex flex-col gap-y-4">
        <Camera ref={smelterCameraRef} smelter={smelter} />
        <Stream ref={smelterInputRef} smelter={smelter} />
        <TextInput />
      </div>
      <img alt="arrows" src={Arrows.src} className="-ml-12 -z-10 h-56" />
      <img alt="smelter" src={SmelterLogo.src} className="-z-10 ml-16 h-24" />
      <img alt="arrow" src={Arrow.src} className="-z-10 mr-4 ml-6 w-28" />
      {smelter && <Output ref={smelterOutputRef} smelter={smelter} />}
    </div>
  );
}
