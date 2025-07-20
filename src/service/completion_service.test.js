import { CompletionService } from './completion_service';

jest.mock('axios');

describe('CompletionService', () => {
  let api;
  let mockHttpClient;
  const baseUrl = 'http://example.com';
  const xApiToken = 'test-token';

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn()
    };
    api = new CompletionService(baseUrl, xApiToken, mockHttpClient);
  });

  it('should send a message successfully', async () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const expectedResponse = { data: { message: {content: 'Response'} } };
    
    mockHttpClient.post.mockResolvedValue(expectedResponse);

    const result = await api.sendMessage(messages);

    expect(mockHttpClient.post).toHaveBeenCalledWith('/message', { messages });
    expect(result.content).toBe('Response');
  });

  it('should include tools in payload when provided', async () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const tools = [{ name: 'tool1' }];
    const expectedResponse = { data: { message: {content: 'Response'}  } };
    
    mockHttpClient.post.mockResolvedValue(expectedResponse);

    await api.sendMessage(messages, tools);

    expect(mockHttpClient.post).toHaveBeenCalledWith('/message', { messages, tools });
  });

  it('should handle errors', async () => {
    const messages = [{ role: 'user', content: 'Hello' }];
    const error = new Error('Network error');
    
    mockHttpClient.post.mockRejectedValue(error);

    await expect(api.sendMessage(messages)).rejects.toThrow('Failed to send message: Network error');
  });

});