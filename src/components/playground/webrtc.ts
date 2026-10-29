// Minimal WHEP (playback) and WHIP (publishing) clients. ICE candidates are
// gathered up front instead of trickled, which is fine for a local setup.

export type WebRtcSession = {
  pc: RTCPeerConnection;
  close: () => void;
};

export async function startWhepPlayback(
  url: string,
  onStream: (stream: MediaStream) => void
): Promise<WebRtcSession> {
  const pc = new RTCPeerConnection();
  pc.addTransceiver("video", { direction: "recvonly" });
  pc.addTransceiver("audio", { direction: "recvonly" });

  const stream = new MediaStream();
  pc.ontrack = (event) => {
    stream.addTrack(event.track);
    onStream(stream);
  };

  const location = await negotiate(pc, url);
  return { pc, close: () => closeSession(pc, url, location) };
}

export async function startWhipPublishing(
  url: string,
  bearerToken: string,
  stream: MediaStream
): Promise<WebRtcSession> {
  const pc = new RTCPeerConnection();
  for (const track of stream.getTracks()) {
    const transceiver = pc.addTransceiver(track, { direction: "sendonly" });
    if (track.kind === "video") {
      preferH264(transceiver);
    }
  }
  const location = await negotiate(pc, url, bearerToken);
  return { pc, close: () => closeSession(pc, url, location, bearerToken) };
}

// The demo server is configured to decode only H.264 from WHIP inputs.
function preferH264(transceiver: RTCRtpTransceiver) {
  const codecs = RTCRtpReceiver.getCapabilities("video")?.codecs ?? [];
  const h264 = codecs.filter((codec) => codec.mimeType.toLowerCase() === "video/h264");
  if (h264.length > 0 && "setCodecPreferences" in transceiver) {
    transceiver.setCodecPreferences(h264);
  }
}

async function negotiate(
  pc: RTCPeerConnection,
  url: string,
  bearerToken?: string
): Promise<string | null> {
  await pc.setLocalDescription(await pc.createOffer());
  await waitForIceGathering(pc);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/sdp",
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
    },
    body: pc.localDescription?.sdp,
  });
  if (!response.ok) {
    pc.close();
    throw new Error(`WebRTC negotiation failed (${response.status}): ${await response.text()}`);
  }
  await pc.setRemoteDescription({ type: "answer", sdp: await response.text() });
  return response.headers.get("Location");
}

function waitForIceGathering(pc: RTCPeerConnection, timeoutMs = 2000): Promise<void> {
  if (pc.iceGatheringState === "complete") {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timeout = setTimeout(done, timeoutMs);
    function done() {
      clearTimeout(timeout);
      pc.removeEventListener("icegatheringstatechange", onChange);
      resolve();
    }
    function onChange() {
      if (pc.iceGatheringState === "complete") {
        done();
      }
    }
    pc.addEventListener("icegatheringstatechange", onChange);
  });
}

function closeSession(
  pc: RTCPeerConnection,
  url: string,
  location: string | null,
  bearerToken?: string
) {
  pc.close();
  if (location) {
    void fetch(new URL(location, url), {
      method: "DELETE",
      headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
    }).catch(() => {});
  }
}
