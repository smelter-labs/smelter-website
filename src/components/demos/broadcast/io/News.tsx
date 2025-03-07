import { Text, View } from "@swmansion/smelter"
import { useEffect, useState } from "react";

export type NewsProps = { messages: string[], messageDurationMs: number };

export default function News({ messages, messageDurationMs }: NewsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) {
      return
    }
    if (index >= messages.length) {
      setIndex(0)
    }
    const timeout = setTimeout(() => {
      setIndex(index + 1)

    }, messageDurationMs)

    return () => {
      clearTimeout(timeout);
    }
  }, [messages, index])

  const currentMessage = messages[index % messages.length];
  const nextMessage = messages[(index + 1) % messages.length];

  return (
    <View style={{ padding: 8, backgroundColor: 'white' }}>
      <NewsText msg={currentMessage} index={index} current />
      {nextMessage && <NewsText msg={nextMessage} index={(index + 1)} />}
    </View>
  )
}

function NewsText(props: { msg: string, index: number, current?: boolean }) {
  return (
    <View
      id={String(props.index)}
      style={{ left: 0, top: props.current ? 0 : 80 }}
      transition={{ durationMs: 500, easingFunction: { functionName: 'cubic_bezier', points: [0.33, 1, 0.68, 1] } }}
    >
      <Text style={{ color: 'black', fontSize: 50 }}>{props.msg}</Text>
    </View>
  )
}
