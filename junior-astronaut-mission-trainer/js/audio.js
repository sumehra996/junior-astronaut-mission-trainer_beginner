audio.js
/**
 * Junior Astronaut Mission Trainer - Procedural Web Audio Engine
 * Pure Web Audio API synthesized sound effects: no external files required!
 */
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.3;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2, pitchDecay = true) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      if (pitchDecay) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq * 0.5), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(gainVal * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio might be blocked by browser policy until gesture
    }
  }

  playClick() {
    this.playTone(650, 'sine', 0.08, 0.18, false);
  }

  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch(e) {}
  }

  playSuccess() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.22, 0.22, false);
      }, idx * 110);
    });
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const melody = [
      { f: 523.25, d: 0.15, t: 0 },
      { f: 659.25, d: 0.15, t: 150 },
      { f: 783.99, d: 0.15, t: 300 },
      { f: 1046.50, d: 0.45, t: 450 },
      { f: 880.00, d: 0.15, t: 750 },
      { f: 1046.50, d: 0.7, t: 900 }
    ];
    melody.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, 'triangle', n.d, 0.28, false);
      }, n.t);
    });
  }

  playError() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.playTone(220, 'sawtooth', 0.25, 0.2, true);
    setTimeout(() => {
      this.playTone(180, 'sawtooth', 0.3, 0.22, true);
    }, 140);
  }

  playCountdown(count) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const freq = count === 1 ? 880 : 587.33; // High pitch for 1, chime for 3 & 2
    this.playTone(freq, 'sine', 0.25, 0.25, false);
  }

  playLaunch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Noise buffer for rocket thrust rumble
      const bufferSize = this.ctx.sampleRate * 2.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(700, this.ctx.currentTime + 2.0);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05 * this.volume, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4 * this.volume, this.ctx.currentTime + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      noise.stop(this.ctx.currentTime + 2.5);

      // Low frequency rumble oscillator
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(140, this.ctx.currentTime + 2.0);
      oscGain.gain.setValueAtTime(0.3 * this.volume, this.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 2.5);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
    } catch (e) {}
  }

  playZap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch(e) {}
  }

  playWater() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.playTone(800 + Math.random() * 400, 'sine', 0.08, 0.15, true);
      }, i * 60);
    }
  }

  playAlarm() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    this.playTone(880, 'square', 0.12, 0.15, false);
    setTimeout(() => {
      this.playTone(660, 'square', 0.12, 0.15, false);
    }, 130);
  }

  playRobotSpeech() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const pitches = [520, 680, 840, 720];
    const p = pitches[Math.floor(Math.random() * pitches.length)];
    this.playTone(p, 'sine', 0.06, 0.12, false);
  }
}

// Global Sound Instance
window.sounds = new SoundEngine();
