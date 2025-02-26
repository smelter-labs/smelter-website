import { create } from "zustand";
import { COLORS } from "../../../../../styles/colors";

type LabelStore = {
  labelTextContent: string;
  labelColor: string;
  setLabelTextContent: (content: string) => void;
  setLabelColor: (color: string) => void;
};

export const useLabelStore = create<LabelStore>((set) => ({
  labelTextContent: "",
  labelColor: COLORS.red40,
  setLabelTextContent: (content: string) => set({ labelTextContent: content }),
  setLabelColor: (color: string) => set({ labelColor: color }),
}));

export default function TextInput() {
  const { labelTextContent, setLabelTextContent } = useLabelStore();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelTextContent(event.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={labelTextContent}
        onChange={handleChange}
        placeholder="Enter text here..."
      />
    </div>
  );
}
