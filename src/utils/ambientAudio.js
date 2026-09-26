// FLUX Web Audio API Synthesizer - Ambient & Meditation Audio Engine

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = {};
    this.masterGain = null;
    this.volume = 0.8;
  }

  initCtx() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.value = this.volume;
          this.masterGain.connect(this.ctx.destination);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('[AudioEngine] Context init notice:', e);
    }
  }

  setMasterVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  // 1. Tanpura Meditation Drone (136.1 Hz Om Root + Pa Harmonic Drone)
  playTanpuraMeditation() {
    try {
      this.initCtx();
      this.stopAll();
      if (!this.ctx) return;

      const sa = 136.1; // Sacred Om Frequency (C#2)
      const pa = 204.15; // Fifth (G#2)
      const saHigh = 272.2; // High Octave (C#3)

      const freqs = [pa, saHigh, saHigh, sa];
      const gains = [];
      const oscs = [];

      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = f;

        // Subtle LFO modulation for authentic Tanpura string plucking cycle
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 0.25 + idx * 0.08; // Slow 4-second cycling phase
        lfoGain.gain.value = 0.03;
        lfo.connect(gain.gain);
        lfo.start();

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start();

        oscs.push(osc);
        gains.push(gain);
      });

      this.activeNodes['meditation_tanpura'] = { oscs, gains, active: true };
    } catch (e) {
      console.warn('[AudioEngine] Tanpura meditation error:', e);
    }
  }

  // 2. Study Brown Noise + Soft Ambient Pad (Focus Masking)
  playStudyBrownNoise() {
    try {
      this.initCtx();
      this.stopAll();
      if (!this.ctx) return;

      // Generate 5-second loop of Brown Noise
      const bufferSize = this.ctx.sampleRate * 5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Soft warm gain normalization
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Low-pass filter for smooth deep study rumble
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      const gain = this.ctx.createGain();
      gain.gain.value = 0.18;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      noise.start();

      // Soft 432Hz ambient chord pad under Brown Noise
      const chordOsc1 = this.ctx.createOscillator();
      const chordOsc2 = this.ctx.createOscillator();
      chordOsc1.type = 'sine';
      chordOsc1.frequency.value = 216;
      chordOsc2.type = 'sine';
      chordOsc2.frequency.value = 432;

      const chordGain = this.ctx.createGain();
      chordGain.gain.value = 0.03;

      chordOsc1.connect(chordGain);
      chordOsc2.connect(chordGain);
      chordGain.connect(this.masterGain || this.ctx.destination);
      chordOsc1.start();
      chordOsc2.start();

      this.activeNodes['study_brown'] = { noise, gain, chordOsc1, chordOsc2, active: true };
    } catch (e) {
      console.warn('[AudioEngine] Study Brown Noise error:', e);
    }
  }

  // 3. Indian Bamboo Flute Melodic Synthesizer
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
          gain.connect(this.masterGain || this.ctx.destination);

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

  // 4. Relaxing Lo-Fi Chords
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
      crackleGain.connect(this.masterGain || this.ctx.destination);
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
            gain.connect(this.masterGain || this.ctx.destination);

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

  // 5. Soft Rain
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
      gain.connect(this.masterGain || this.ctx.destination);

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
        if (node.oscs) { node.oscs.forEach((o) => { try { o.stop(); o.disconnect(); } catch (e) {} }); }
        if (node.gains) { node.gains.forEach((g) => { try { g.disconnect(); } catch (e) {} }); }
        if (node.crackle) { try { node.crackle.stop(); node.crackle.disconnect(); } catch (e) {} }
        if (node.noise) { try { node.noise.stop(); node.noise.disconnect(); } catch (e) {} }
        if (node.chordOsc1) { try { node.chordOsc1.stop(); node.chordOsc1.disconnect(); } catch (e) {} }
        if (node.chordOsc2) { try { node.chordOsc2.stop(); node.chordOsc2.disconnect(); } catch (e) {} }
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
