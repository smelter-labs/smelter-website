import Smelter from "@swmansion/smelter-web-wasm";
import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
import { useEffect, useState } from "react";
import StreamerMp4 from "../../../assets/demos/streamer_640x360_full.mp4";
import Participant1 from "../../../assets/demos/video-conference/conference-participant1.mp4";
import Participant2 from "../../../assets/demos/video-conference/conference-participant2.mp4";
import Participant3 from "../../../assets/demos/video-conference/conference-participant3.mp4";

import Output from "./io/Output";
import UserSettingsSection from "./settings/UsersSettingsSection";

setWasmBundleUrl("/smelter.wasm");

const CONFERENCE_PARTICIPANTS = [
  {
    id: "participant1",
    uri: Participant1,
  },
  {
    id: "participant2",
    uri: Participant2,
  },
  {
    id: "participant3",
    uri: Participant3,
  },
];

export default function SmelterSection() {
  const smelter = useSmelter();

  useEffect(() => {
    if (!smelter) {
      return;
    }

    CONFERENCE_PARTICIPANTS.map((participant) => {
      void smelter?.registerInput(participant.id, {
        url: participant.uri,
        type: "mp4",
      });
    });

    const intervalParticipants = setInterval(async () => {
      CONFERENCE_PARTICIPANTS.map(async (participant) => {
        await smelter?.unregisterInput(participant.id).catch(() => {});
        await smelter?.registerInput(participant.id, {
          url: participant.uri,
          type: "mp4",
        });
      });
    }, 10000);

    return () => {
      clearInterval(intervalParticipants);
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
