import Smelter from "@swmansion/smelter-node";
import { View, WebView } from "@swmansion/smelter";
import { ffplayStartPlayerAsync } from "./utils";

function ExampleApp() {
  return (
    <View>
      <WebView instanceId="web_renderer1" />
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

  await smelter.registerWebRenderer("web_renderer1", {
    url: "https://compositor.live",
    resolution: {
      width: 1920,
      height: 1080,
    },
    embeddingMethod: "chromium_embedding",
  });
  await smelter.start();
}

void run();
