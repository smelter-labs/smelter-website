import LiveCompositor from '@live-compositor/node';
import { InputStream, Tiles, Rescaler, View } from 'live-compositor';
import { downloadAllAssets, gstReceiveTcpStream } from './utils';
import path from 'path';

function ExampleApp() {
  return (
    <Tiles transition={{ durationMs: 200 }}>
      <View>
        <Rescaler>
          <InputStream inputId="test_input" />
        </Rescaler>
      </View>
    </Tiles>
  );
}

async function run() {
  await downloadAllAssets();
  const compositor = new LiveCompositor();
  await compositor.init();

  await compositor.registerOutput('output_1', {
    type: 'rtp_stream',
    port: 8001,
    transportProtocol: 'tcp_server',
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
    audio: {
      encoder: {
        type: 'opus',
        channels: 'stereo',
      },
    },
  });

  void gstReceiveTcpStream('127.0.0.1', 8001);

  await compositor.registerInput('test_input', {
    type: 'mp4',
    serverPath: path.join(__dirname, '../.assets/BigBuckBunny.mp4'),
  });

  await compositor.start();
}
void run();
