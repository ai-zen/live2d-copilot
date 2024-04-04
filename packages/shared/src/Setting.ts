export interface Setting {
  lang: string;
  alwaysOnTop: boolean;
  currentChatClient: "OpenAI" | "AzureOpenAI" | "ChatGPT" | "AIZen";
  chatClientConfigs: {
    OpenAI?: {
      url: string;
      headers: string;
      requestData: Record<string, any>;
    };
    AzureOpenAI?: {
      url: string;
      headers: string;
      requestData: Record<string, any>;
    };
    ChatGPT?: {
      url: string;
      headers: "";
      requestData: Record<string, any>;
    };
    AIZen?: {
      url: string;
      headers: "";
      requestData: Record<string, any>;
    };
  };
}
