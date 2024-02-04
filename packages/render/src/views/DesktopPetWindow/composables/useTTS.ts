import { AsyncQueue } from "@ai-zen/async-queue";

interface Voice {
  text: string;
  audio?: HTMLAudioElement;
}

export function useTTS() {
  const inputQueue = new AsyncQueue<string>();
  const outputQueue = new AsyncQueue<Voice>();

  async function run() {
    for await (const text of inputQueue) {
      // TODO: TTS
      outputQueue.push({ audio: undefined, text });
    }

    outputQueue.done();
  }

  run();

  return {
    inputQueue,
    outputQueue,
  };
}
