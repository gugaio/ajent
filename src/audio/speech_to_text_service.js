import axios from 'axios';
import { config } from '../config.js';

export class SpeechToTextService {
  constructor(xApiToken, apiUrl) {
    this.apiToken = xApiToken;
    this.apiUrl = apiUrl || config.DEFAULT_AJENT_API_URL;
  }

  async transcribeAudio(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob);
        
        // Create a client with multipart/form-data content type
        const audioClient = axios.create({
          baseURL: this.apiUrl,
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-token': this.apiToken
          }
        });
        
        // Send the request
        const response = await audioClient.post('/stt', formData, {});
        
        // Get the text response from headers
        const content = response.data;
        
        return content;
      } catch (error) {
        throw new Error(`Failed to send audio message: ${error.message}`);
      }
  }
}