import { GoogleGenAI, Modality } from '@google/genai';

export class GeminiSpeechToTextService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({apiKey:apiKey});
    this.session = null;
    this.isConnected = false;
    this.audioContext = null;
    this.workletNode = null;
    this.connect = this.connect.bind(this);
  }

  async connect(onTranscription) {
    this.onTranscription = onTranscription;
    try {
      const model = "gemini-2.5-flash-preview-native-audio-dialog";
      const config = {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "You are a speech-to-text service. Convert the audio input to text and respond only with the transcribed text."
      };

      const self = this;
      this.session = await this.ai.live.connect({
        model: model,
        config: config,
        callbacks: {
          onopen: function() {
            self.isConnected = true;
            console.debug('Gemini Live connection opened');
          },
          onmessage: function(message) {
            if (message.text && self.onTranscription) {
              self.onTranscription(message.text);
            }
          },
          onerror: function(error) {
            console.error('Gemini Live error:', error);
          },
          onclose: function(event) {
            self.isConnected = false;
            console.debug('Gemini Live connection closed:', event.reason, event.code);
          }
        }
      });

    } catch (error) {
      throw new Error(`Failed to connect to Gemini API: ${error.message}`);
    }
  }

  sendAudioData(audioData) {
    if (this.session && this.isConnected) {
      // Convert Float32Array to 16-bit PCM
      const int16Array = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        int16Array[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
      }
      
      // Convert to base64
      const uint8Array = new Uint8Array(int16Array.buffer);
      const base64Audio = btoa(String.fromCharCode.apply(null, uint8Array));
      
      // Send audio data using the correct API method
      this.session.sendRealtimeInput({
        audio: {
          data: base64Audio,
          mimeType: "audio/pcm;rate=16000"
        }
      });
    }
  }

  stopListening() {
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  disconnect() {
    this.stopListening();
    
    if (this.session && this.isConnected) {
      this.session.disconnect();
      this.session = null;
      this.isConnected = false;
    }
  }


}