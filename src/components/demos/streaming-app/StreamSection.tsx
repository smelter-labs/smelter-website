import Smelter from "@swmansion/smelter-web-wasm";
import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
import { useEffect, useRef, useState } from "react";
import Stream from "./Stream";

setWasmBundleUrl("/smelter.wasm");

export default function StreamSection() {
  const [smelter, setSmelter] = useState<Smelter>();
  const smelterInputRef = useRef<Smelter | null>(null);

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
        <div className="flex grow flex-col">
           {smelter && <Stream smelter={smelter} ref={smelterInputRef} />}
        </div>
    </div>
  );
}
