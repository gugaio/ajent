import { CompletionService } from './completion_service';

jest.mock('axios');

describe('CompletionService', () => {
  let completionService;
  let mockHttpClient;
  const baseUrl = 'http://example.com';
  const xApiToken = 'test-token';

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn()
    };
    completionService = new CompletionService(baseUrl, xApiToken, mockHttpClient);
  });

  it('should send a message successfully', async () => {
    const messages = [{ role: 'user', content: 'Hello' }];

    mockHttpClient.post.mockResolvedValue({ data: { message: {content: 'Response'} } });

    const result = await completionService.sendMessage(messages);

    expect(mockHttpClient.post).toHaveBeenCalledWith('/message', { messages });
    expect(result.content).toBe('Response');
  });

  it('should include tools in payload when provided', async () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const tools = [{ name: 'tool1' }];

    mockHttpClient.post.mockResolvedValue({ data: { message: {content: 'Response'}  } });

    await completionService.sendMessage(messages, tools);

    expect(mockHttpClient.post).toHaveBeenCalledWith('/message', { messages, tools });
  });

  it('should initialize with x-api-token in headers', () => {
    const axios = require('axios');
    completionService = new CompletionService(baseUrl, xApiToken);

    expect(axios.create).toHaveBeenCalledWith({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'x-api-token': xApiToken
      }
    });
  });

  it('should handle errors', async () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    
    mockHttpClient.post.mockRejectedValue(new Error('Network error'));

    await expect(completionService.sendMessage(messages)).rejects.toThrow('Failed to send message: Network error');
    
  });

});