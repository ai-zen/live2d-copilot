// ============================================================
// Chat Tool Plugin
// ============================================================

export interface ChatToolProfile {
  version: 1;
  title: string;
  description: string;
  preview: string;
  /** OpenAI Function Calling schema */
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ChatToolProfileEx extends ChatToolProfile {
  _itemId: bigint;
  _dir: string;
  _index: string;
}
