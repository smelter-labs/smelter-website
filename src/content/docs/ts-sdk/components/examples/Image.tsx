import Smelter from "@swmansion/smelter-node";
import { Image, View } from "@swmansion/smelter";

function ExampleApp() {
	return (
		<View style={{ direction: "column", backgroundColor: "rgb(255,255,255)" }}>
			<Image imageId="test_image" />
		</View>
	);
}

async function run() {
	const smelter = new Smelter();
	await smelter.init();

	await smelter.registerImage("test_image", {
		assetType: "svg",
		url: "https://compositor.live/img/logo.svg",
		resolution: {
			width: 960,
			height: 540,
		},
	});

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
	await smelter.start();
}

void run();
