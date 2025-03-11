import Smelter from "@swmansion/smelter-web-wasm";
import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
import { useEffect, useState } from "react";
import StreamerMp4 from "../../../assets/streamer_640x360_full.mp4";
import Output from "./io/Output";
import UserSettingsSection from "./settings/UsersSettingsSection";

setWasmBundleUrl("/smelter.wasm");

export default function SmelterSection() {
  const smelter = useSmelter();

  useEffect(() => {
    if (!smelter) {
      return;
    }

    void smelter?.registerInput("streamer", { url: StreamerMp4, type: "mp4" });

    const intervalStreamer = setInterval(async () => {
      await smelter?.unregisterInput("streamer").catch(() => {});
      await smelter?.registerInput("streamer", { url: StreamerMp4, type: "mp4" });
    }, 7000);

    return () => {
      clearInterval(intervalStreamer);
    };
  }, [smelter]);

  return (
    <div className="flex flex-col">
      <div className="flex w-full shrink justify-center gap-6 sm:flex-row">
        <div className="flex flex-3">
          <div className="flex w-full flex-col">
            {smelter && <Output smelter={smelter} />}
            <div className="flex flex-1" />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          {smelter && <UserSettingsSection smelter={smelter} />}
        </div>
      </div>
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
        await promise.catch(() => {});
        await smelter.terminate();
      })();
    };
  }, []);
  return smelter;
}
