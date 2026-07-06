/**
 * Edge-TTS 语音合成。
 * 只做一件事：text → AudioBuffer。
 * 不关心播放、不关心队列。
 */
const WSS_URL = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
const TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";

function nowISO(): string {
  const d = new Date();
  return d.getUTCFullYear().toString() +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    String(d.getUTCDate()).padStart(2, "0") + "T" +
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0") +
    String(d.getUTCSeconds()).padStart(2, "0") + "Z";
}

function buildSSML(text: string, voiceName: string): string {
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  return `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>\r\n      <voice name='${voiceName}'>\r\n        <prosody pitch='+0Hz' rate='+0%' volume='+0%'>\r\n          ${escaped}\r\n        </prosody>\r\n      </voice>\r\n    </speak>`;
}

async function generateAuthToken(): Promise<string> {
  const ticks = Math.floor(Date.now() / 1000) + 11644473600;
  const rounded = ticks - (ticks % 300);
  const windowsTicks = rounded * 10_000_000;
  const data = new TextEncoder().encode(`${windowsTicks}${TRUSTED_CLIENT_TOKEN}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

/** 合成一段文字，返回 AudioBuffer */
export async function synthesize(text: string, voiceName: string): Promise<AudioBuffer> {
  const secMsGec = await generateAuthToken();
  const reqId = crypto.randomUUID().replace(/-/g, "").toUpperCase();
  const url = `${WSS_URL}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=1-130.0.2849.68&ConnectionId=${reqId}`;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    const audioChunks: Uint8Array[] = [];
    const AUDIO_DELIMITER = "Path:audio\r\n";

    ws.onopen = () => {
      const ts = nowISO();
      ws.send(`X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":false,"wordBoundaryEnabled":true},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}`);
      ws.send(`X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}\r\nPath:ssml\r\n\r\n${buildSSML(text, voiceName)}`);
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        if (event.data.includes("Path:turn.end")) ws.close();
      } else {
        const data = new Uint8Array(event.data);
        const idx = data.findIndex((_, i, arr) => i + AUDIO_DELIMITER.length <= arr.length && AUDIO_DELIMITER.split("").every((c, j) => arr[i + j] === c.charCodeAt(0)));
        if (idx >= 0) audioChunks.push(data.slice(idx + AUDIO_DELIMITER.length));
      }
    };

    ws.onclose = () => {
      const totalLen = audioChunks.reduce((s, c) => s + c.length, 0);
      if (totalLen === 0) return reject(new Error("no audio"));
      const total = new Uint8Array(totalLen);
      let off = 0;
      for (const c of audioChunks) { total.set(c, off); off += c.length; }
      const ctx = new AudioContext();
      ctx.decodeAudioData(total.buffer.slice(total.byteOffset, total.byteOffset + total.byteLength), (buf) => { ctx.close(); resolve(buf); }, reject);
    };

    ws.onerror = () => { ws.close(); reject(new Error("ws error")); };
  });
}

export interface TTSVoice {
  Name: string;
  ShortName: string;
  Gender: string;
  Locale: string;
  FriendlyName: string;
}

let cachedVoices: TTSVoice[] | null = null;

/** 获取 Edge-TTS 可用语音列表（从本地 JSON，带缓存） */
export async function listVoices(): Promise<TTSVoice[]> {
  if (cachedVoices) return cachedVoices;
  const res = await fetch("/voices.json");
  if (!res.ok) throw new Error(`listVoices failed: ${res.status}`);
  cachedVoices = await res.json();
  return cachedVoices!;
}
