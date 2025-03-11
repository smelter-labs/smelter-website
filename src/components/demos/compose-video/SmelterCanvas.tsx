import type Smelter from "@swmansion/smelter-web-wasm";
import type React from "react";
import { useCallback } from "react";

type CanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
>;

type SmelterCanvasProps = {
  id: string;
  onCanvasCreated?: () => Promise<void>;
  smelter: Smelter;
  children: React.ReactElement;
} & CanvasProps;

export default function SmelterCanvas(props: SmelterCanvasProps) {
  const { onCanvasCreated, children, smelter, ...canvasProps } = props;

  const initializeCanvas = async (canvas: HTMLCanvasElement) => {
    if (onCanvasCreated) {
      await onCanvasCreated();
    }
    await smelter.registerOutput(`${props.id}-output`, children, {
      type: "canvas",
      video: {
        canvas: canvas,
        resolution: {
          width: Number(canvasProps.width ?? canvas.width),
          height: Number(canvasProps.height ?? canvas.height),
        },
      },
      audio: false,
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return;
      initializeCanvas(canvas);
    },
    [onCanvasCreated, canvasProps.width, canvasProps.height, smelter, props.id]
  );

  // biome-ignore lint/style/useSelfClosingElements: <explanation>
  return <canvas ref={canvasRef} {...canvasProps}></canvas>;
}
