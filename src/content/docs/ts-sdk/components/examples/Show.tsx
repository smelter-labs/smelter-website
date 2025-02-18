import { InputStream, Show, Tiles } from "@swmansion/smelter";
import { OfflineSmelter } from "@swmansion/smelter-node";

function ExampleApp() {
  return (
    <Tiles>
      <Show delayMs={2000}>
        <InputStream inputId="input_1" />
      </Show>
      <Show timeRangeMs={{ start: 5000, end: 8000 }}>
        <InputStream inputId="input_2" />
      </Show>
    </Tiles>
  );
}

async function run() {
  const smelter = new OfflineSmelter();
  await smelter.init();

  await smelter.registerInput("input_1", {
    type: "mp4",
    serverPath: "./inputExample1.mp4",
    required: true,
  });

  await smelter.registerInput("input_2", {
    type: "mp4",
    serverPath: "./inputExample2.mp4",
    required: true,
  });

  await smelter.render(
    <ExampleApp />,
    {
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
    },
    10000
  );
}
void run();
