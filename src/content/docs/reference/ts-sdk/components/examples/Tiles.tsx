import LiveCompositor from '@live-compositor/node';
import { useInputStreams, InputStream, Tiles, Rescaler, View } from 'live-compositor';
import { downloadAllAssets, ffplayStartPlayerAsync, sleep } from './utils';
import path from 'path';

function ExampleApp() {
  const inputs = useInputStreams();

  return (
    <Tiles transition={{ durationMs: 200 }}>
      {Object.values(inputs).map(input =>
        input?.videoState === 'playing' ? (
          <View>
            <Rescaler>
              <InputStream inputId={input.inputId} />
            </Rescaler>
          </View>
        ) : (
          'Fallback'
        )
      )}
    </Tiles>
  );
}

async function run() {
  await downloadAllAssets();
  const compositor = new LiveCompositor();
  await compositor.init();

  void ffplayStartPlayerAsync('127.0.0.1', 8001);
  await sleep(2000);

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

  await sleep(5000);
  await compositor.registerInput('input_2', {
    type: 'mp4',
    serverPath: path.join(__dirname, '../.assets/ElephantsDream.mp4'),
  });

  await sleep(5000);
  await compositor.registerInput('input_3', {
    type: 'mp4',
    serverPath: path.join(__dirname, '../.assets/BigBuckBunny.mp4'),
  });
}

void run();
