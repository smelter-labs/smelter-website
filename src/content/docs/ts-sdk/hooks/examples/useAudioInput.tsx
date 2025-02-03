import path from "node:path";
import Smelter from "@swmansion/smelter-node";
import { InputStream, Rescaler, View, useAudioInput } from "@swmansion/smelter";
import { downloadAllAssets, ffplayStartPlayerAsync } from "./utils";

function ExampleApp() {
  useAudioInput("input_1", { volume: 0.5 });

  return (
    <View>
      <Rescaler>
        <InputStream inputId="input_1" />
      </Rescaler>
    </View>
  );
}

async function run() {
  await downloadAllAssets();
  const smelter = new Smelter();
  await smelter.init();

  void ffplayStartPlayerAsync("127.0.0.1", 8001);

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
}
void run();
