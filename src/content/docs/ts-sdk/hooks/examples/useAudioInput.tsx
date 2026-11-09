import { View, useAudioInput } from "@swmansion/smelter";
import Smelter from "@swmansion/smelter-node";

function ExampleApp() {
  useAudioInput("input_1", { volume: 0.5 });

  return <View />;
}

async function run() {
  const smelter = new Smelter();
  await smelter.init();

  await smelter.registerOutput("output", <ExampleApp />, {
    type: "mp4",
    serverPath: "./output.mp4",
    video: {
      encoder: {
        type: "ffmpeg_h264",
        ffmpegOptions: { preset: "ultrafast" },
      },
      resolution: {
        width: 1920,
        height: 1080,
      },
    },
    audio: {
      channels: "stereo",
      encoder: {
        type: "aac",
      },
    },
  });

  await smelter.registerInput("input_1", {
    type: "mp4",
    serverPath: "./inputExample.mp4",
  });

  await smelter.start();
}
void run();
