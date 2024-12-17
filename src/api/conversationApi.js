import axios from 'axios';

export class ConversationApi {
  constructor(baseUrl, xApiToken) {
    this.client = axios.create({
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
}
