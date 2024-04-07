import { ChatAL } from "@ai-zen/chats-core";

export interface ChatToolProfileV1 extends ChatAL.ToolDefine {
  version: 1;
  title: string;
  description: string;
  preview: string;
}

export interface ChatToolProfileEx extends ChatToolProfileV1 {
  _itemId: bigint;
  _dir: string;
  _index: string;
}
