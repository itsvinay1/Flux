// Web Audio API Synthesizer for 100% Offline Ambient Sound Engine
// Rich, soothing offline tracks: Indian Bamboo Flute, Relaxing Lo-Fi Chords, Zen 432Hz, Soft Rain

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = {};
  }

  initCtx() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('[AudioEngine] Context init notice:', e);
    }
  }

  // 1. Indian Bamboo Flute Melodic Synthesizer
  playFlute() {
    try {
      this.initCtx();
      this.stopAll();
      if (!this.ctx) return;

      const notes = [329.63, 392.00, 440.00, 493.88, 587.33];
      let noteIdx = 0;

      const playNextNote = () => {
        if (!this.activeNodes['flute'] || !this.ctx || this.ctx.state === 'closed') return;
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          const freq = notes[noteIdx % notes.length];
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          const vibrato = this.ctx.createOscillator();
          vibrato.frequency.value = 5;
          const vibratoGain = this.ctx.createGain();
          vibratoGain.gain.value = 3;
          vibrato.connect(osc.frequency);
          vibrato.start();

          gain.gain.setValueAtTime(0, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.5);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 3.3);

          noteIdx++;
        } catch (err) {
          console.warn('[AudioEngine] Flute note notice:', err);
        }
      };

      this.activeNodes['flute'] = { active: true };
      playNextNote();
      const interval = setInterval(playNextNote, 3400);
      this.activeNodes['flute'].interval = interval;
    } catch (e) {
      console.warn('[AudioEngine] playFlute error:', e);
    }
  }

  // 2. Chill Lo-Fi Chillhop Harmonic Chords
  playLofi() {
    try {
      this.initCtx();
      this.stopAll();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.015;
      }

      const crackle = this.ctx.createBufferSource();
      crackle.buffer = buffer;
      crackle.loop = true;
      const crackleGain = this.ctx.createGain();
      crackleGain.gain.value = 0.08;
      crackle.connect(crackleGain);
      crackleGain.connect(this.ctx.destination);
      crackle.start();

      const chords = [
        [261.63, 329.63, 392.00, 493.88],
        [220.00, 261.63, 329.63, 392.00],
        [293.66, 349.23, 440.00, 523.25],
        [196.00, 246.94, 293.66, 349.23],
      ];
      let chordIdx = 0;

      const playChord = () => {
        if (!this.activeNodes['lofi'] || !this.ctx || this.ctx.state === 'closed') return;
        try {
          const currentChord = chords[chordIdx % chords.length];
          currentChord.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.value = freq;

            filter.type = 'lowpass';
            filter.frequency.value = 650;

            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 4.0);
          });
          chordIdx++;
        } catch (err) {
          console.warn('[AudioEngine] Lofi chord notice:', err);
        }
      };

      this.activeNodes['lofi'] = { crackle, active: true };
      playChord();
      const chordInterval = setInterval(playChord, 4200);
      this.activeNodes['lofi'].chordInterval = chordInterval;
    } catch (e) {
      console.warn('[AudioEngine] playLofi error:', e);
    }
  }

  // 3. Deep 432Hz Meditation Healing Drone
  playMeditation() {
    try {
      this.initCtx();
      this.stopAll();
      if (!this.ctx) return;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();

      osc1.type = 'sine';
      osc1.frequency.value = 432;

      osc2.type = 'sine';
      osc2.frequency.value = 216;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.08;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      this.activeNodes['meditation'] = { osc1, osc2, gain, active: true };
    } catch (e) {
      console.warn('[AudioEngine] playMeditation error:', e);
    }
  }

  // 4. Soft Rain
  playRain() {
    try {
      this.initCtx();
      this.stopAll();
      if (!this.ctx) return;

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.12;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.activeNodes['rain'] = { noise, gain, active: true };
    } catch (e) {
      console.warn('[AudioEngine] playRain error:', e);
    }
  }

  stop(type) {
    if (this.activeNodes[type]) {
      try {
        const node = this.activeNodes[type];
        if (node.interval) clearInterval(node.interval);
        if (node.chordInterval) clearInterval(node.chordInterval);
        if (node.crackle) { try { node.crackle.stop(); node.crackle.disconnect(); } catch (e) {} }
        if (node.noise) { try { node.noise.stop(); node.noise.disconnect(); } catch (e) {} }
        if (node.osc1) { try { node.osc1.stop(); node.osc1.disconnect(); } catch (e) {} }
        if (node.osc2) { try { node.osc2.stop(); node.osc2.disconnect(); } catch (e) {} }
        if (node.gain) { try { node.gain.disconnect(); } catch (e) {} }
      } catch (e) {}
      delete this.activeNodes[type];
    }
  }

  stopAll() {
    try {
      Object.keys(this.activeNodes).forEach((k) => this.stop(k));
    } catch (e) {}
  }
}

export const audioEngine = new AmbientAudioEngine();
