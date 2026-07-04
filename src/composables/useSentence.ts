import { AsyncQueue } from "@ai-zen/async-queue";

/**
 * 流式文本 → 分句。
 *
 * 队列模式（参考老项目）：
 *   push(chunk)   - 接收增量文本
 *   push(null)    - 标记流结束，触发 flush + onEnd
 */
export function useSentence(options: {
  onSentence: (text: string) => void;
  onEnd?: () => void;
}) {
  const SENTENCE_BREAK = /[。！？.!?\n]/;
  const inputQueue = new AsyncQueue<string | null>();
  let buffer = "";

  function flush() {
    const text = buffer.trim();
    buffer = "";
    if (text) {
      options.onSentence(text);
    }
  }

  (async () => {
    for await (const text of inputQueue) {
      if (text === null) {
        // null = 流结束，强制输出剩余缓冲区
        flush();
        options.onEnd?.();
      } else {
        for (const char of text) {
          buffer += char;
          if (SENTENCE_BREAK.test(char)) {
            flush();
          }
        }
      }
    }
  })();

  return { inputQueue };
}
