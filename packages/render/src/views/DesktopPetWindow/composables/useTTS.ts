import { AsyncQueue } from "@ai-zen/async-queue";

interface Voice {
  text: string;
  audio?: HTMLAudioElement;
}

export function useTTS(options: { onVoice?(voice: Voice): void }) {
  const inputQueue = new AsyncQueue<string>();

  async function run() {
    for await (const text of inputQueue) {
      const { data } = await fetch(
        "https://api.ai-zen.cn/azure/getSpeechToken",
        {
          method: "GET",
          mode: "cors",
        }
      ).then((res) => res.json());

      const blob = await fetch(
        "https://eastasia.tts.speech.microsoft.com/cognitiveservices/v1",
        {
          headers: {
            authorization: `Bearer ${data}`,
            "content-type": "application/ssml+xml",
            "x-microsoft-outputformat": "riff-24khz-16bit-mono-pcm",
          },
          body: `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang=\"zh-CN\"><voice name='zh-CN-XiaoyiNeural' xml:lang='zh-CN'><mstts:express-as style='chat'>${text}</mstts:express-as></voice></speak>`,
          method: "POST",
          mode: "cors",
        }
      ).then((res) => res.blob());

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onload = () => URL.revokeObjectURL(url);

      options.onVoice?.({ audio, text });
    }
  }

  run();

  return {
    inputQueue,
  };
}
