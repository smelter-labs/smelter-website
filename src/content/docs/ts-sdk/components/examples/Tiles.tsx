import path from "node:path";
import { InputStream, Rescaler, Tiles, View, useInputStreams } from "@swmansion/smelter";
import Smelter from "@swmansion/smelter-node";
import { downloadAllAssets, ffplayStartPlayerAsync, sleep } from "./utils";

function ExampleApp() {
  const inputs = useInputStreams();

  return (
    <Tiles transition={{ durationMs: 200 }}>
      {Object.values(inputs).map((input) =>
        input?.videoState === "playing" ? (
          <View>
            <Rescaler>
              <InputStream inputId={input.inputId} />
            </Rescaler>
          </View>
        ) : (
          "Fallback"
        )
      )}
    </Tiles>
  );
}

async function run() {
  await downloadAllAssets();
  const smelter = new Smelter();
  await smelter.init();

  void ffplayStartPlayerAsync("127.0.0.1", 8001);
  await sleep(2000);

  await smelter.registerOutput("output_1", {
    type: "rtp_stream",
    port: 8001,
    ip: "127.0.0.1",
    transportProtocol: "udp",
    video: {
      encoder: {
        type: "ffmpeg_h264",
        preset: "ultrafast",
      },
      resolution: {
        width: 1920,
        height: 1080,
      },
      root: <ExampleApp />,
    },
  });
  await smelter.start();

  await smelter.registerInput("input_1", {
    type: "mp4",
    serverPath: path.join(__dirname, "../.assets/BigBuckBunny.mp4"),
  });

  await sleep(5000);
  await smelter.registerInput("input_2", {
    type: "mp4",
    serverPath: path.join(__dirname, "../.assets/ElephantsDream.mp4"),
  });

  await sleep(5000);
  await smelter.registerInput("input_3", {
    type: "mp4",
    serverPath: path.join(__dirname, "../.assets/BigBuckBunny.mp4"),
  });
}

void run();
