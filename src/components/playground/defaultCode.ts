export const DEFAULT_CODE = `import { InputStream, Text, Tiles, View, useInputStreams } from "@swmansion/smelter";
import type Smelter from "@swmansion/smelter-web-client";

// Runs before the first render. Changing it restarts the whole session,
// changes limited to components are applied without restarting the stream.
//
// MP4 inputs can only use files available on the demo server, see the list
// below the preview. Sharing camera/screen with the buttons below the preview
// adds "camera"/"screen" inputs.
export async function setup(smelter: Smelter) {
  await smelter.registerInput("ship", {
    type: "mp4",
    serverPath: "space_ship_1.mp4",
    loop: true,
  });
  await smelter.registerInput("room", {
    type: "mp4",
    serverPath: "cyber_room_bg.mp4",
    loop: true,
  });
}

export default function App() {
  const inputs = useInputStreams();
  return (
    <View style={{ backgroundColor: "#161127", direction: "column" }}>
      <Tiles style={{ padding: 20 }} transition={{ durationMs: 300 }}>
        {Object.values(inputs).map((input) => (
          <InputStream key={input.inputId} inputId={input.inputId} />
        ))}
      </Tiles>
      <View style={{ height: 100, padding: 20 }}>
        <Text style={{ fontSize: 48, color: "#F24664" }}>Hello from Smelter</Text>
      </View>
    </View>
  );
}
`;
