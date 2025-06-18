import axios from 'axios';
import {EventSource} from 'eventsource';

export class CompletionService {
  constructor(baseUrl, xApiToken, httpClient = null) {
    this.baseUrl = baseUrl;
    this.xApiToken = xApiToken;
    this.client = httpClient || axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': xApiToken
      }
    });
  }

  async sendMessage(messages, tools) {
    try {
      const payload = {
        messages
      };
      if (tools && tools.length > 0) {
        payload.tools = tools;
      }
      const response = await this.client.post('/message', payload);
      return response.data.message;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async sendAudioMessage(audioBlob, messages, tools) {
    try {
      const audioClient = axios.create({
        baseURL: this.baseUrl,
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-token': this.xApiToken
        }
      });
      
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('messages', messages);
      if (tools && tools.length > 0) {
        formData.append('tools', tools);
      }

      const response = await audioClient.post('/audio_message', formData, {});
      const textResponseHeader = response.headers['x-text-response'];
      const textResponse = textResponseHeader ? JSON.parse(textResponseHeader) : null;

      return {
        audioBlob: response.data,  // The audio blob response
        textResponse: textResponse, // The JSON text response
        audioUrl: "localhost:3000" // Convenience URL for playing the audio
      };
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  async streamMessage(messages, tools, {
    onContent = () => {},
    onToolCall = () => {},
    onFinish = () => {},
    onError = () => {}
  } = {}) {
    try {
      const payload = { messages };
      if (tools && tools.length > 0) {
        payload.tools = tools;
      }

      const response = await fetch(`${this.baseUrl}/message/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': this.xApiToken
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('HTTP error:', response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';
      const toolCalls = new Map();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;

          const jsonStr = line.replace('data: ', '');
          try {
            const data = JSON.parse(jsonStr);

            if (data.error) {
              onError(new Error(data.error));
              return;
            }

            switch (data.type) {
              case 'content':
                fullContent += data.content;
                onContent(data.content);
                break;

              case 'tool_call':
                const toolCall = data.tool_call;
                toolCalls.set(toolCall.id, toolCall);
                onToolCall(toolCall, Array.from(toolCalls.values()));
                break;

              case 'finish':
                onFinish({
                  content: data.final_content || fullContent,
                  toolCalls: data.final_tool_calls || Array.from(toolCalls.values()),
                  finishReason: data.finish_reason
                });
                return;
            }
          } catch (error) {
            console.error('Failed to parse:', jsonStr);
            onError(new Error(`Failed to parse stream data: ${error.message}`));
          }
        }
      }
    } catch (error) {
      onError(new Error(`Stream connection error: ${error.message}`));
    }

    return {
      close: () => {} // Fetch API automatically handles connection cleanup
    };
  }


}