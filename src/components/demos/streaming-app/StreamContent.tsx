import { InputStream, Rescaler, View } from "@swmansion/smelter";
import { COLORS } from "../../../../styles/colors";
import { OUTPUT_SIZE } from "./Stream";


export default function StreamContent() {
  return (
    <View
      style={{
        borderRadius: 16,
        borderColor: COLORS.white100,
        borderWidth: 1.5,
      }}>
      <Rescaler>
        <InputStream id="stream" inputId="stream" />
      </Rescaler>
      <View
        style={{
          top: 0,
          width: OUTPUT_SIZE.width / 2,
          right: 0,
          paddingTop: 16,
          paddingRight: 20,
        }}>
        <View />
      </View>
    </View>
  );
}
