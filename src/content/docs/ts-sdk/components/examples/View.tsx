import { View } from "@swmansion/smelter";
import Smelter from "@swmansion/smelter-node";
import { ffplayStartPlayerAsync } from "./utils";

function ExampleApp() {
  return (
    <View>
      <View style={{ direction: "column", backgroundColor: "#FFFFFF" }}>
        <View style={{ backgroundColor: "#FF0000" }} />
        <View style={{ backgroundColor: "#0000FF" }} />
      </View>
      <View style={{ backgroundColor: "#00FF00" }} />
    </View>
  );
}

async function run() {
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
}

void run();
