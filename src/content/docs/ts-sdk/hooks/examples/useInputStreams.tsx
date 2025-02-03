import { InputStream, Rescaler, Text, Tiles, View, useInputStreams } from "@swmansion/smelter";
import Smelter from "@swmansion/smelter-node";

function InputTile({ inputId }: { inputId: string }) {
  return (
    <View>
      <Rescaler>
        <InputStream inputId={inputId} />
      </Rescaler>
      <View style={{ bottom: 10, left: 10, height: 50 }}>
        <Text
          style={{
            fontSize: 40,
            color: "#FF0000",
            lineHeight: 50,
            backgroundColor: "#FFFFFF88",
          }}>
          Input ID: {inputId}
        </Text>
      </View>
    </View>
  );
}

function ExampleApp() {
  const inputs = useInputStreams();

  return (
    <Tiles transition={{ durationMs: 200 }}>
      {Object.values(inputs).map((input) =>
        !input.videoState ? (
          <Text key={input.inputId} style={{ fontSize: 40 }}>
            Waiting for stream {input.inputId} to connect
          </Text>
        ) : input.videoState === "playing" ? (
          <InputTile key={input.inputId} inputId={input.inputId} />
        ) : input.videoState === "finished" ? (
          <Text key={input.inputId} style={{ fontSize: 40 }}>
            Stream {input.inputId} finished
          </Text>
        ) : (
          "Fallback"
        )
      )}
    </Tiles>
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

  await smelter.registerInput("input_1", {
    type: "mp4",
    serverPath: "./inputExample1.mp4",
  });

  await smelter.registerInput("input_2", {
    type: "mp4",
    serverPath: "./inputExample2.mp4",
  });

  await smelter.start();
}
void run();
