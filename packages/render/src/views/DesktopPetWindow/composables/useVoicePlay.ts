import { AsyncQueue } from "@ai-zen/async-queue";

interface Voice {
  text: string;
  audio?: HTMLAudioElement;
}

export function useVoicePlay(options: {
  onPlay?(voice: Voice): void;
  onPlayed?(voice: Voice): void;
}) {
  const inputQueue = new AsyncQueue<Voice>();

  async function run() {
    for await (const voice of inputQueue) {
      if (!voice.audio) continue;

      await new Promise((resolve, reject) => {
        voice.audio!.onended = resolve;
        voice.audio!.onerror = reject;
        // voice.audio!.onloadedmetadata = () => options.onPlay?.(voice);
        voice
          .audio!.play()
          .then(() => options.onPlay?.(voice))
          .catch(reject);
      });

      options.onPlayed?.(voice);
    }
  }

  run();

  return {
    inputQueue,
  };
}
