import Smelter from "@swmansion/smelter-web-wasm";
import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
import { useEffect, useState } from "react";
import Output from "./io/Output";

setWasmBundleUrl("/smelter.wasm");

export default function SmelterSection() {
  const smelter = useSmelter();

  return (
    <div className="relative flex items-center">
      {smelter && <Output smelter={smelter} />}
    </div>
  );
}

function useSmelter(): Smelter | undefined {
  const [smelter, setSmelter] = useState<Smelter>();
  useEffect(() => {
    const smelter = new Smelter();

    let cancel = false;
    const promise = (async () => {
      await smelter.init();
      await smelter.start();
      if (!cancel) {
        setSmelter(smelter);
      }
    })();

    return () => {
      cancel = true;
      void (async () => {
        await promise.catch(() => { });
        await smelter.terminate();
      })();
    };
  }, []);
  return smelter;
}
