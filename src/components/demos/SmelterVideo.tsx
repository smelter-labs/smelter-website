import type Smelter from "@swmansion/smelter-web-wasm";
import type React from "react";
import { useCallback } from "react";

type VideoProps = React.DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

type SmelterVideoProps = {
  id: string;
  onVideoCreated?: () => Promise<void>;
  smelter: Smelter;
  children: React.ReactElement;
} & VideoProps;

export default function SmelterVideo(props: SmelterVideoProps) {
  const { onVideoCreated, children, smelter, ...videoProps } = props;

  const initializeVideo = async (video: HTMLVideoElement) => {
    if (onVideoCreated) {
      await onVideoCreated();
    }
    const { stream } = await smelter.registerOutput(`${props.id}-output`, children, {
      type: "stream",
      video: {
        resolution: {
          width: Number(videoProps.width ?? video.width),
          height: Number(videoProps.height ?? video.height),
        },
      },
      audio: false,
    });
    if (stream) {
      video.srcObject = stream;
      await video.play();
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const videoRef = useCallback(
    (video: HTMLVideoElement | null) => {
      if (!video) return;
      initializeVideo(video);
    },
    [onVideoCreated, videoProps.width, videoProps.height, smelter, props.id]
  );

  return <video ref={videoRef} className="rounded-md" muted controls  autoPlay {...videoProps} />;
}
