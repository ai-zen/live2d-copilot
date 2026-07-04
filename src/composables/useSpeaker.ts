import { reactive } from "vue";
import { AsyncQueue } from "@ai-zen/async-queue";

export interface Clip {
  text: string;
  buffer: AudioBuffer;
}

/**
 * 音频播放器：串行播放 + 字幕同步。
 *
 * push(clip) 入队播放，push(null) 标记对话结束并清理状态。
 * 用法（老项目模式）：
 *   onSentence → synthesize → speakerQueue.push({ text, buffer })
 *   对话结束后 → speakerQueue.push(null)
 */
export function useSpeaker() {
  const inputQueue = new AsyncQueue<Clip | null>();
  const state = reactive({
    subtitle: "",
    isSpeaking: false,
  });

  (async () => {
    let ctx: AudioContext | null = null;
    for await (const clip of inputQueue) {
      if (clip === null) {
        // null = 对话结束标记，清理状态
        state.subtitle = "";
        state.isSpeaking = false;
        continue;
      }

      if (!ctx) ctx = new AudioContext();
      state.isSpeaking = true;
      state.subtitle = clip.text;
      const source = ctx.createBufferSource();
      source.buffer = clip.buffer;
      source.connect(ctx.destination);
      await new Promise<void>((r) => { source.onended = () => r(); source.start(); });
    }
  })();

  return { inputQueue, state };
}
