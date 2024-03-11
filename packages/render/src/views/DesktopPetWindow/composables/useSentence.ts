import { AsyncQueue } from "@ai-zen/async-queue";

export interface Sentence {
  style?: string;
  text: string;
}

export function useSentence(options: {
  onSentence?(sentence: Sentence): void;
}) {
  // The `null` indicates that the request has ended,
  // and even if no punctuation marks are matched,
  // the sentence will be output.
  const inputQueue = new AsyncQueue<string | null>();

  let buffer = "";

  function flush() {
    let text = buffer.trim();

    if (text.length) {
      options.onSentence?.({ style: undefined, text });
    }

    buffer = "";
  }

  async function run() {
    for await (const text of inputQueue) {
      if (text) {
        for (const char of text.split("")) {
          buffer += char;

          const keywords = ["。", "！", "？", ". "];
          const matched = keywords.find((keyword) => buffer.endsWith(keyword));

          if (matched) flush();
        }
      } else {
        flush();
      }
    }
  }

  run();

  return {
    inputQueue,
    flush,
  };
}
