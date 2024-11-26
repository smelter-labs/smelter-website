import LiveCompositor from '@live-compositor/node';
import { View, Image } from 'live-compositor';

function ExampleApp() {
  return (
    <View style={{ direction: 'column', backgroundColor: 'rgb(255,255,255)' }}>
      <Image imageId="test_image" />
    </View>
  );
}

async function run() {
  const compositor = new LiveCompositor();
  await compositor.init();

  await compositor.registerImage('test_image', {
    assetType: 'svg',
    url: 'https://compositor.live/img/logo.svg',
    resolution: {
      width: 960,
      height: 540,
    },
  });

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
}

void run();
