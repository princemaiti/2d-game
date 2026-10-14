export class AudioManager {
  constructor() {
    this.enabled = true;
    this.soundCtx = null;
    this.music = null;
  }

  ensureContext() {
    if (!this.soundCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.soundCtx = new AudioCtx();
      }
    }
    if (this.soundCtx && this.soundCtx.state === 'suspended') {
      this.soundCtx.resume();
    }
  }

  playTone(freq = 220, duration = 0.12, type = 'sine', gain = 0.03) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.soundCtx) return;

    const osc = this.soundCtx.createOscillator();
    const gainNode = this.soundCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gainNode.gain.value = gain;
    osc.connect(gainNode);
    gainNode.connect(this.soundCtx.destination);
    osc.start();
    osc.stop(this.soundCtx.currentTime + duration);
  }

  playUiClick() {
    this.playTone(420, 0.08, 'triangle', 0.04);
  }

  playHit() {
    this.playTone(120, 0.15, 'square', 0.04);
  }

  playQuestComplete() {
    this.playTone(660, 0.18, 'triangle', 0.05);
    setTimeout(() => this.playTone(880, 0.2, 'triangle', 0.05), 90);
  }
}
