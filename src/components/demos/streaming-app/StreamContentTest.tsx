import { InputStream, Rescaler, Text, View } from "@swmansion/smelter";
import { COLORS } from "../../../../styles/colors";
import { useStreamStore } from "./LayoutsSection";
import { useLabelStore } from "./StreamForm";
import { INPUT_SIZE } from "./StreamSection";
import Chat from "./chat/Chat";

export default function StreamContent2() {
  const { currentLayout } = useStreamStore();
  const { labelColor, labelTextContent } = useLabelStore();

  return (
    <View>
      <Rescaler
        style={{
          borderRadius: 16,
          borderColor: COLORS.white100,
          borderWidth: 1.5,
          rescaleMode: "fit",
        }}>
        <InputStream inputId="stream" />
      </Rescaler>

      <Rescaler
        id="streamer"
        transition={{ durationMs: 500 }}
        style={{
          left: 32,
          top: 32,
          width: INPUT_SIZE.width / 3,
          height: INPUT_SIZE.height / 3,
          borderRadius: 12,
          borderColor: COLORS.white100,
          borderWidth: 1.5,
          rescaleMode: "fill",
        }}>
        <InputStream inputId="streamer" />
      </Rescaler>

      {currentLayout === "layout-chat" && <Chat width={680} height={640} />}

      {currentLayout === "layout-message" && (
        <View
          style={{
            top: 0,
            width: INPUT_SIZE.width / 2,
            right: 0,
            paddingTop: 16,
            paddingRight: 20,
          }}>
          <View />
          <Text
            style={{
              fontSize: 64,
              lineHeight: 68,
              fontWeight: "bold",
              wrap: "word",
              maxWidth: INPUT_SIZE.width / 2,
              maxHeight: INPUT_SIZE.height,
              color: labelColor,
            }}>
            {labelTextContent}
          </Text>
        </View>
      )}
    </View>
  );
}
