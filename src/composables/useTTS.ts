import { AsyncQueue } from "@ai-zen/async-queue";
import { synthesize } from "../utils/tts";
import type { Clip } from "./useSpeaker";

/**
 * TTS 串行合成队列。
 * 按入队顺序逐个合成，避免并发导致的乱序。
 * push(null) 标记对话结束 → onEnd 回调。
 */
export function useTTS(options: {
  onVoice?: (clip: Clip) => void;
  onEnd?: () => void;
}) {
  const inputQueue = new AsyncQueue<string | null>();

  (async () => {
    for await (const text of inputQueue) {
      if (text === null) {
        options.onEnd?.();
        continue;
      }
      const audioBuffer = await synthesize(text);
      options.onVoice?.({ text, buffer: audioBuffer });
    }
  })();

  return { inputQueue };
}
