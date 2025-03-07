import type Smelter from "@swmansion/smelter-web-wasm";

import { InputStream, Rescaler, Text, View } from "@swmansion/smelter";
import { COLORS } from "../../../../../styles/colors";
import SmelterVideo from "../SmelterVideo";
import { create } from "zustand";
import News from "./News";

export const OUTPUT_SIZE = { width: 1270, height: 720 };

type OutputProps = {
  smelter: Smelter;
};

export default function Output({ smelter }: OutputProps) {
  return (
    <div className="flex flex-col gap-y-4">
      <SmelterVideo
        smelter={smelter}
        id="output"
        width={OUTPUT_SIZE.width}
        height={OUTPUT_SIZE.height}>
        <OutputContent />
      </SmelterVideo>
      <h3 className="text-demos-subheader">Composed live stream or video</h3>
    </div>
  );
}

type LabelStore = {
  messages: string[];
  labelColor: string;
  backgroundColor: string;
  addMessage: (content: string) => void;
  setLabelColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
};



export const useLabelStore = create<LabelStore>((set) => ({
  messages: [
    "First message",
    "second message",
    "Short",
    "Long message asldfj slkdfjs lasdjf lskdfj asdf",
    "User john127 donated 30$",
  ],
  labelColor: COLORS.red40,
  backgroundColor: COLORS.black100,
  addMessage: (content) => set((state) => ({ messages: [...state.messages, content] })),
  setLabelColor: (color) => set({ labelColor: color }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
}));

function OutputContent() {
  const { messages, backgroundColor, labelColor } = useLabelStore();

  return (
    <View
      style={{
        borderRadius: 16,
        borderColor: COLORS.white100,
        borderWidth: 1.5,
      }}>
      <View
        style={{
          bottom: 0,
          left: 0,
          height: 80,
          paddingTop: 16,
          paddingRight: 20,
          backgroundColor: 'white'
        }}>
        <News messages={messages} messageDurationMs={5000} />
      </View>
    </View>
  );
}
