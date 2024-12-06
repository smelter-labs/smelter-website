import LiveCompositor from '@live-compositor/node';
import { useInputStreams, Text, InputStream, Tiles, Rescaler, View } from 'live-compositor';
import { ffplayStartPlayerAsync } from './utils';
import path from 'path';

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
            color: '#FF0000',
            lineHeight: 50,
            backgroundColor: '#FFFFFF88',
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
      {Object.values(inputs).map(input =>
        !input.videoState ? (
          <Text key={input.inputId} style={{ fontSize: 40 }}>
            Waiting for stream {input.inputId} to connect
          </Text>
        ) : input.videoState === 'playing' ? (
          <InputTile key={input.inputId} inputId={input.inputId} />
        ) : input.videoState === 'finished' ? (
          <Text key={input.inputId} style={{ fontSize: 40 }}>
            Stream {input.inputId} finished
          </Text>
        ) : (
          'Fallback'
        )
      )}
    </Tiles>
  );
}

async function run() {
  const compositor = new LiveCompositor();
  await compositor.init();

  void ffplayStartPlayerAsync('127.0.0.1', 8001);

  await compositor.registerOutput('output_1', {
    type: 'rtp_stream',
    port: 8001,
    ip: '127.0.0.1',
    transportProtocol: 'udp',
    video: {
      encoder: {
        type: 'ffmpeg_h264',
        preset: 'ultrafast',
      },
      resolution: {
        width: 1920,
        height: 1080,
      },
      root: <ExampleApp />,
    },
  });
  await compositor.start();

  await compositor.registerInput('input_1', {
    type: 'mp4',
    serverPath: path.join(__dirname, '../.assets/BigBuckBunny.mp4'),
  });

  await compositor.registerInput('input_2', {
    type: 'mp4',
    serverPath: path.join(__dirname, '../.assets/ElephantsDream.mp4'),
  });
}
void run();
