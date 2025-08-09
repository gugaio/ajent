export class AudioRecorder {
  constructor() {
    this._stop = null;
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

  stopAndSend() {
    if (this._stop) {
      this._stop();
    }
  }
}