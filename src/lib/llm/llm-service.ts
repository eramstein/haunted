import ollama, { type Message, type Tool, type ToolCall } from 'ollama';
import { Mistral } from '@mistralai/mistralai';
import { LLM_API_MODEL, LLM_MODEL } from './config';

const mistralApiKey = import.meta.env.VITE_MISTRAL_API_KEY;

const mistralClient = new Mistral({ apiKey: mistralApiKey });

export interface ChatOptions {
  temperature?: number;
  repeat_penalty?: number;
  top_k?: number;
  top_p?: number;
}

export interface ChatRequest {
  messages: Message[];
  tools?: Tool[];
  options?: ChatOptions;
  stream?: boolean;
  responseFormat?: {
    type: string;
  };
}

export interface ChatResponse {
  message: {
    content: string;
    tool_calls?: ToolCall[];
  };
}

export interface MistralChatResponse {
  choices: {
    message: {
      content: string;
      toolCalls?: ToolCall[];
    };
  }[];
}

export interface MistralStreamChunk {
  data: {
    choices: {
      delta: {
        content: string;
      };
    }[];
  };
}

export interface LLMService {
  chat(
    request: ChatRequest & { stream: true }
  ): Promise<AsyncIterable<ChatResponse | MistralStreamChunk>>;
  chat(request: ChatRequest & { stream?: false }): Promise<ChatResponse | MistralChatResponse>;
  getMessage(response: ChatResponse | MistralChatResponse): string;
  getStreamChunk(response: ChatResponse | MistralStreamChunk): string;
  getTools(response: ChatResponse | MistralChatResponse): ToolCall[];
  getToolArguments(response: { [id: string]: any } | string): Record<string, any>;
}

export class OllamaService implements LLMService {
  async chat(request: ChatRequest & { stream: true }): Promise<AsyncIterable<ChatResponse>>;
  async chat(request: ChatRequest & { stream?: false }): Promise<ChatResponse>;
  async chat(request: ChatRequest): Promise<ChatResponse | AsyncIterable<ChatResponse>> {
    if (request.stream) {
      return ollama.chat({
        model: LLM_MODEL,
        messages: request.messages,
        tools: request.tools,
        stream: true,
        options: {
          temperature: request.options?.temperature,
          repeat_penalty: request.options?.repeat_penalty,
          top_k: request.options?.top_k,
          top_p: request.options?.top_p,
        },
      }) as Promise<AsyncIterable<ChatResponse>>;
    }

    return ollama.chat({
      model: LLM_MODEL,
      messages: request.messages,
      tools: request.tools,
      stream: false,
      options: {
        temperature: request.options?.temperature,
        repeat_penalty: request.options?.repeat_penalty,
        top_k: request.options?.top_k,
        top_p: request.options?.top_p,
      },
    }) as Promise<ChatResponse>;
  }
  getMessage(chunk: any): string {
    return chunk.message.content;
  }
  getStreamChunk(chunk: any): string {
    return chunk.message.content;
  }
  getTools(response: ChatResponse): ToolCall[] {
    return response.message.tool_calls || [];
  }
  getToolArguments(response: ToolCall): Record<string, any> {
    return response;
  }
}

export class MistralService implements LLMService {
  async chat(request: ChatRequest & { stream: true }): Promise<AsyncIterable<MistralStreamChunk>>;
  async chat(request: ChatRequest & { stream?: false }): Promise<MistralChatResponse>;
  async chat(
    request: ChatRequest
  ): Promise<MistralChatResponse | AsyncIterable<MistralStreamChunk>> {
    if (request.stream) {
      return mistralClient.chat.stream({
        model: LLM_API_MODEL,
        messages: request.messages,
        tools: request.tools,
        stream: true,
        responseFormat: request.responseFormat,
        options: {
          temperature: request.options?.temperature,
          repeat_penalty: request.options?.repeat_penalty,
          top_k: request.options?.top_k,
          top_p: request.options?.top_p,
        },
      }) as Promise<AsyncIterable<MistralStreamChunk>>;
    }
    return mistralClient.chat.complete({
      model: LLM_API_MODEL,
      messages: request.messages,
      tools: request.tools,
      toolChoice: request.tools ? 'any' : 'none',
      stream: false,
      responseFormat: request.responseFormat,
      options: {
        temperature: request.options?.temperature,
        repeat_penalty: request.options?.repeat_penalty,
        top_k: request.options?.top_k,
        top_p: request.options?.top_p,
      },
    }) as Promise<MistralChatResponse>;
  }
  getMessage(chunk: MistralChatResponse): string {
    return chunk.choices[0].message.content;
  }
  getStreamChunk(chunk: MistralStreamChunk): string {
    return chunk.data.choices[0].delta.content;
  }
  getTools(response: MistralChatResponse): ToolCall[] {
    return response.choices[0].message.toolCalls || [];
  }
  getToolArguments(response: string): Record<string, any> {
    return JSON.parse(response);
  }
}

// Singleton instance
export const llmService: LLMService = new MistralService();
//export const llmService: LLMService = new OllamaService();
