import { ConversationManager } from './conversation_manager.js';
import axios from 'axios';

const DEFAULT_AJENT_API_URL = 'https://spinal.onrender.com/';


export class Audio {

  constructor(xApiToken, apiUrl) {
    this._stop = null;
    this.apiToken = xApiToken;
    this.apiUrl = apiUrl || DEFAULT_AJENT_API_URL;
    this._transcribeAudio = this.transcribeAudio.bind(this);
  }

  async startRecording(callback = null) {
    const timeLimit = 60000;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!stream) {
      throw new Error('Unable to access microphone');
    }
    let mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      stream.getTracks().forEach(track => track.stop());
      if (callback) {
        callback(audioBlob);
      }
    });    

    mediaRecorder.start();

    let stopMediaRecording = () => {
      if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };

    setTimeout(() => {
      stopMediaRecording();
    }, timeLimit);
  
    this._stop = () => {
        stopMediaRecording();
    };
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

  stopAndSend() {
    if (this._stop) {
      this._stop();
    }
  }

}