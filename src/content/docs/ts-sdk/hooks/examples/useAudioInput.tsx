import LiveCompositor from '@live-compositor/node';
import { InputStream, Rescaler, View, useAudioInput } from 'live-compositor';
import { downloadAllAssets, ffplayStartPlayerAsync } from './utils';
import path from 'path';

function ExampleApp() {
  useAudioInput('input_1', { volume: 0.5 });

  return (
    <View>
      <Rescaler>
        <InputStream inputId="input_1" />
      </Rescaler>
    </View>
  );
}

async function run() {
  await downloadAllAssets();
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
}
void run();
