export class RealtimeAudioRecorder {
  constructor() {
    this.isRecording = false;
    this.stream = null;
    this.audioContext = null;
    this.workletNode = null;
    this.onTranscription = null;
  }

  async startRealTimeRecording(onAudioDataReceived) {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    try {
      this.onAudioDataReceived = onAudioDataReceived;
      
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      if (!this.stream) {
        throw new Error('Unable to access microphone');
      }

      // Create audio context for real-time processing
      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(this.stream);
      
      // Load audio worklet for processing
      await this.audioContext.audioWorklet.addModule('/audio-processor.js');
      this.workletNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      
      // Handle processed audio data
      this.workletNode.port.onmessage = (event) => {
        if (this.isRecording && event.data.audioData) {
          // Notify about transcription
          if (this.onAudioDataReceived) {
            this.onAudioDataReceived(event.data.audioData);
          }
        }
      };
      
      // Connect audio processing chain
      source.connect(this.workletNode);
      this.workletNode.connect(this.audioContext.destination);
      
      this.isRecording = true;
      
    } catch (error) {
      this.cleanup();
      throw new Error(`Failed to start real-time recording: ${error.message}`);
    }
  }

  stopRealTimeRecording() {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;
    this.cleanup();
  }

  cleanup() {
    // Stop audio worklet
    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    // Stop media stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

  }

  // Check if currently recording
  get isActive() {
    return this.isRecording;
  }
}