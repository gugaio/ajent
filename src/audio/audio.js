import { AudioRecorder } from './audio_recorder.js';
import { SpeechToTextService } from './speech_to_text_service.js';
import {RealtimeAudioRecorder} from  './realtime_audio_recorder.js';
import { GeminiSpeechToTextService } from './speech_to_text_service_gemini.js';

export class Audio {
  constructor(xApiToken, apiUrl) {
    this._audioRecorder = new AudioRecorder();
    this._realtimeAudioRecorder = new RealtimeAudioRecorder();
    this._speechToTextService = new SpeechToTextService(xApiToken, apiUrl);
    this._transcribeAudio = this.transcribeAudio.bind(this);
    this._geminiSpeechToTextService = new GeminiSpeechToTextService(xApiToken);
  }

  async connect(onTranscription) {
    return this._geminiSpeechToTextService.connect(onTranscription);
  }

  async startRealTimeRecording(onAudioDataReceived) {
    return await this._realtimeAudioRecorder.startRealTimeRecording(onAudioDataReceived);
  }

  async transcribeAudioWithGemini(audioBlob) {
    return await this._geminiSpeechToTextService.sendAudioData(audioBlob);
  }

  async startRecording(callback = null) {
    return await this._audioRecorder.startRecording(callback);
  }

  async transcribeAudio(audioBlob) {
    return await this._speechToTextService.transcribeAudio(audioBlob);
  }

  stopAndSend() {
    this._audioRecorder.stopAndSend();
  }
}