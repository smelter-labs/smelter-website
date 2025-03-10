import type Smelter from "@swmansion/smelter-web-wasm";
import { type DetailedHTMLProps, type ReactElement, useCallback, useEffect, useState } from "react";

type VideoProps = DetailedHTMLProps<
  React.VideoHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

type WhipStreamProps = VideoProps & {
  endpointUrl: string
  bearerToken?: string
  onSmelterStarted?: (smelter: Smelter) => Promise<void> | void;
  children: ReactElement,
  smelter: Smelter,
};

type SmelterState = { smelter: Smelter, initPromise: Promise<void> }

/** 
  * Helper component that starts smelter with single WHIP output.
  * Preview of the stream is displayed in a `<video />` tag.
  */
export default function WhipStream(props: WhipStreamProps) {
  const { endpointUrl, bearerToken, children, smelter, onSmelterStarted, ...videoProps } = props;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const videoRef = useCallback((videoElement: HTMLVideoElement | null) => {
    if (!videoElement) {
      return
    }

    (async () => {
      const { stream } = await smelter.registerOutput('output',
        children,
        {
          type: 'whip',
          endpointUrl,
          bearerToken,
          video: {
            resolution: { width: 1920, height: 1080 },
          },
          audio: true,
        }
      );
      if (!stream) {
        throw new Error('Missing stream from register output.')
      }

      if (onSmelterStarted) {
        await onSmelterStarted(smelter)
      }

      videoElement.srcObject = stream;
      await videoElement.play();
    })();
  }, [endpointUrl, bearerToken, onSmelterStarted])

  return (
    <video ref={videoRef} {...videoProps} />
  )
}
