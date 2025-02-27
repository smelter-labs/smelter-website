import { InputStream, Mp4, Rescaler, Text, View, useInputStreams } from "@swmansion/smelter";
import { useEffect } from "react";
import CommercialMp4 from "../../../../assets/demos/game.mp4";
import CameraContent from "./CameraContent";
import { OUTPUT_SIZE } from "./Output";
import { useLabelStore } from "./TextInput";

export default function OutputConent() {
  const { labelTextContent, backgroundColor, labelColor } = useLabelStore();

  const inputs = useInputStreams();

  useEffect(() => {
    console.log("INPUTS ", JSON.stringify(inputs));
  }, [inputs]);

  return (
    <View
      style={{
        borderRadius: 16,
        borderColor: "white",
        borderWidth: 1.5,
      }}>
      <Rescaler>
        <Mp4 source={new URL(CommercialMp4, import.meta.url).toString()} />
      </Rescaler>
      {/* <Rescaler
        style={{
          top: 12,
          left: 12,
          width: OUTPUT_SIZE.width / 4,
          height: OUTPUT_SIZE.height / 3,
          borderRadius: 12,
          borderColor: "white",
          borderWidth: 1.5,
          rescaleMode: "fill",
        }}> */}
        <CameraContent />
      {/* </Rescaler> */}
      <View style={{ top: 0, left: OUTPUT_SIZE.width / 2, paddingTop: 16, paddingRight: 20 }}>
        <Text
          style={{
            fontSize: 18,
            color: labelColor,
            backgroundColor: backgroundColor,
            fontWeight: "bold",
            wrap: "word",
            maxWidth: OUTPUT_SIZE.width / 2,
            maxHeight: OUTPUT_SIZE.height,
          }}>
          {labelTextContent}
        </Text>
      </View>
    </View>
  );
}
