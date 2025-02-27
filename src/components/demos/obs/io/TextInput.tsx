import type React from "react";
import { create } from "zustand";
import { COLORS } from "../../../../../styles/colors";
import Edit from "../../../../assets/demos/edit.svg";

type LabelStore = {
  labelTextContent: string;
  labelColor: string;
  backgroundColor: string;
  setLabelTextContent: (content: string) => void;
  setLabelColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
};

export const useLabelStore = create<LabelStore>((set) => ({
  labelTextContent: "User john123 donated 30$",
  labelColor: COLORS.red40, // Default to black
  backgroundColor: COLORS.black100, // Default to white
  setLabelTextContent: (content) => set({ labelTextContent: content }),
  setLabelColor: (color) => set({ labelColor: color }),
  setBackgroundColor: (color) => set({ backgroundColor: color }),
}));

export default function TextInputWithColorPickers() {
  const {
    labelTextContent,
    labelColor,
    backgroundColor,
    setLabelTextContent,
    setLabelColor,
    setBackgroundColor,
  } = useLabelStore();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelTextContent(event.target.value);
  };

  const handleTextColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelColor(event.target.value);
  };

  const handleBackgroundColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(event.target.value);
  };

  return (
    <div className="p-4 space-y-4">
      <input
        type="text"
        value={labelTextContent}
        onChange={handleChange}
        placeholder="Enter text here..."
        className="p-2 border rounded-md shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ color: labelColor, backgroundColor: backgroundColor }}
      />
      <div className="flex gap-4 items-center">
        <div className="flex flex-col items-center relative group">
          <input
            type="color"
            id="textColor"
            value={labelColor}
            onChange={handleTextColorChange}
            className="w-20 h-10 border border-white rounded-md cursor-pointer"
          />
          <img
            alt="edit"
            src={Edit.src}
            className="absolute mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer pointer-events-none"
          />
        </div>
        <div className="flex flex-col items-center relative group">
          <input
            type="color"
            id="backgroundColor"
            value={backgroundColor}
            onChange={handleBackgroundColorChange}
            className="w-20 h-10 border border-white rounded-md cursor-pointer"
          />
          <img
            alt="edit"
            src={Edit.src}
            className="absolute mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer pointer-events-none"
          />
        </div>
      </div>
      <style>{`
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
        }
      `}</style>
    </div>
  );
}
