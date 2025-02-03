import { InputStream, Rescaler } from "@swmansion/smelter";
import Smelter from "@swmansion/smelter-node";

function ExampleApp() {
  return (
    <Rescaler style={{ rescaleMode: "fit" }}>
      <InputStream inputId="test_input" />
    </Rescaler>
  );
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
        preset: "ultrafast",
      },
      resolution: {
        width: 1920,
        height: 1080,
      },
    },
    audio: {
      encoder: {
        type: "aac",
        channels: "stereo",
      },
    },
  });

  await smelter.registerInput("example_input", {
    type: "mp4",
    serverPath: "./inputExample.mp4",
  });

  await smelter.start();
}
void run();
