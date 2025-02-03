import path from "node:path";
import { InputStream, Rescaler, View } from "@swmansion/smelter";
import Smelter from "@swmansion/smelter-node";
import { downloadAllAssets, gstReceiveTcpStream } from "./utils";

function ExampleApp() {
  return (
    <View>
      <Rescaler>
        <InputStream inputId="test_input" />
      </Rescaler>
    </View>
  );
}

async function run() {
  await downloadAllAssets();
  const smelter = new Smelter();
  await smelter.init();

  await smelter.registerOutput("output_1", {
    type: "rtp_stream",
    port: 8001,
    transportProtocol: "tcp_server",
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
    audio: {
      encoder: {
        type: "opus",
        channels: "stereo",
      },
    },
  });

  void gstReceiveTcpStream("127.0.0.1", 8001);

  await smelter.registerInput("test_input", {
    type: "mp4",
    serverPath: path.join(__dirname, "../.assets/BigBuckBunny.mp4"),
  });

  await smelter.start();
}
void run();
