import type Smelter from "@swmansion/smelter-web-wasm";
import type React from "react";
import { create } from "zustand";
import { COLORS } from "../../../../styles/colors";
import Edit from "../../../assets/demos/edit.svg";
import { useStreamStore } from "./LayoutsSection";

type LabelStore = {
  labelTextContent: string;
  labelColor: string;
  backgroundColor: string;
  setLabelTextContent: (content: string) => void;
  setLabelColor: (color: string) => void;
};

export const useLabelStore = create<LabelStore>((set) => ({
  labelTextContent: "",
  labelColor: COLORS.red40,
  backgroundColor: COLORS.black100,
  setLabelTextContent: (content) => set({ labelTextContent: content }),
  setLabelColor: (color) => set({ labelColor: color }),
}));

export default function StreamForm({ smelter }: { smelter?: Smelter }) {
  const { currentLayout, isCameraActive, setIsCameraActive } = useStreamStore();
  const { labelTextContent, labelColor, backgroundColor, setLabelTextContent, setLabelColor } =
    useLabelStore();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelTextContent(event.target.value);
  };

  const handleTextColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLabelColor(event.target.value);
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      console.log("test 1");
      await smelter?.unregisterInput("streamer");
    } else {
      console.log("test 2");
      await smelter?.registerInput("streamer", { type: "camera" });
    }
    setIsCameraActive(!isCameraActive);
  };

  if (!smelter) return;
  return (
    <div className="mt-4">
      <label className="flex cursor-pointer select-none items-center">
        <input
          type="checkbox"
          className="hidden"
          id="toggleSwitch"
          checked={isCameraActive}
          onChange={toggleCamera}
        />
        <span className="relative">
          <span
            className={`block h-8 w-14 rounded-full bg-gray-300 shadow-inner ${isCameraActive ? "bg-switchActive" : ""}`}
          />
          <span
            className={`absolute inset-y-0 left-0 mt-1 ml-1 block h-6 w-6 rounded-full bg-white shadow transition-transform duration-300 ease-in-out focus-within:shadow-outline ${
              isCameraActive ? "translate-x-6 transform" : ""
            }`}
          />
        </span>
        <p className="ml-2 text-demos-inputLabel">
          {isCameraActive ? "Camera active" : "Camera inactive"}
        </p>
      </label>
      <div>
        {true && (
          <p className="mt-2 text-demos-subheader">
            Camera access has been denied. Modify your browser settings to enable the toggle.
          </p>
        )}
      </div>
      {currentLayout === "layout-message" && (
        <div className="flex gap-x-4 space-y-4 py-4">
          <input
            type="text"
            value={labelTextContent}
            onChange={handleChange}
            placeholder="Enter stream message..."
            className="w-[60%] rounded-md border p-4 shadow-sm focus:outline-none"
            style={{ color: labelColor, backgroundColor: backgroundColor }}
          />

          <div className="group relative flex flex-col items-center">
            <input
              type="color"
              id="textColor"
              value={labelColor}
              onChange={handleTextColorChange}
              className="h-10 w-20 cursor-pointer rounded-md border border-demos-border"
            />
            <img
              alt="edit"
              src={Edit.src}
              className="pointer-events-none absolute mt-2 cursor-pointer opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
