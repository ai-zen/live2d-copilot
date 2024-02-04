/**
 * Chat Abstraction Layer
 */
export namespace ChatAL {
  export enum Role {
    Unknown = "unknown",
    System = "system",
    User = "user",
    Assistant = "assistant",
  }

  export enum MessageStatus {
    Unknown = "unknown",
    Pending = "pending",
    Completed = "completed",
    Failed = "failed",
    Writing = "writing",
  }

  export enum FinishReason {
    Unknown = "unknown",
    Stop = "stop",
    Length = "length",
    ContentFilter = "content_filter",
  }

  export interface FunctionCall {
    arguments?: string;
    name?: string;
  }

  export interface ToolCall {
    index?: number;
    id?: number;
    type?: string;
    function?: FunctionCall;
  }

  export interface Message {
    content: string;
    tool_calls?: ToolCall[];
    role: Role;
    status?: MessageStatus;
    finish_reason?: FinishReason;
  }
}
