// Web Audio API Synthesizer for 100% Offline Ambient Sound Engine
// Rich, soothing offline tracks: Indian Bamboo Flute, Relaxing Lo-Fi Chords, Zen 432Hz, Soft Rain, and Ocean

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.activeNodes = {};
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Indian Bamboo Flute Melodic Synthesizer (Pentatonic Ragic Notes)
  playFlute() {
    this.initCtx();
    this.stopAll();

    // Pentatonic scale frequency notes (E4, G4, A4, B4, D5)
    const notes = [329.63, 392.00, 440.00, 493.88, 587.33];
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.activeNodes['flute']) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Flute timbre: Sine wave + mild triangle blend
      osc.type = 'sine';
      const freq = notes[noteIdx % notes.length];
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Breath vibrato effect
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.value = 5; // 5Hz natural vibrato
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.value = 3;
      vibrato.connect(osc.frequency);
      vibrato.start();

      // Soft envelope for graceful flute breath (Attack & Release)
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.5); // Soft attack
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.2); // Soft breath release

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 3.3);

      noteIdx++;
    };

    playNextNote();
    const interval = setInterval(playNextNote, 3400);

    this.activeNodes['flute'] = { interval };
  }

  // 2. Chill Lo-Fi Chillhop Harmonic Chords & Vinyl Crackle
  playLofi() {
    this.initCtx();
    this.stopAll();

    // Lo-fi Vinyl Warm Crackle
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015; // Soft crackle
    }

    const crackle = this.ctx.createBufferSource();
    crackle.buffer = buffer;
    crackle.loop = true;
    const crackleGain = this.ctx.createGain();
    crackleGain.gain.value = 0.08;
    crackle.connect(crackleGain);
    crackleGain.connect(this.ctx.destination);
    crackle.start();

    // Lo-Fi Seventh Chords (Cmaj7 -> Am7 -> Dm7 -> G7)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 349.23], // G7
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.activeNodes['lofi']) return;
      const currentChord = chords[chordIdx % chords.length];

      currentChord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'triangle'; // Warm retro synth chord note
        osc.frequency.value = freq;

        filter.type = 'lowpass';
        filter.frequency.value = 650; // Warm lo-fi filter cutoff

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
    };

    playChord();
    const chordInterval = setInterval(playChord, 4200);

    this.activeNodes['lofi'] = { crackle, chordInterval };
  }

  // 3. Deep 432Hz Meditation Healing Drone
  playMeditation() {
    this.initCtx();
    this.stopAll();

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
    this.activeNodes['meditation'] = { osc1, osc2, gain };
  }

  // 4. Soft Rain
  playRain() {
    this.initCtx();
    this.stopAll();

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
    this.activeNodes['rain'] = { noise, gain };
  }

  stop(type) {
    if (this.activeNodes[type]) {
      try {
        const node = this.activeNodes[type];
        if (node.interval) clearInterval(node.interval);
        if (node.chordInterval) clearInterval(node.chordInterval);
        if (node.crackle) { node.crackle.stop(); node.crackle.disconnect(); }
        if (node.noise) { node.noise.stop(); node.noise.disconnect(); }
        if (node.osc1) { node.osc1.stop(); node.osc1.disconnect(); }
        if (node.osc2) { node.osc2.stop(); node.osc2.disconnect(); }
        if (node.gain) node.gain.disconnect();
      } catch (e) {}
      delete this.activeNodes[type];
    }
  }

  stopAll() {
    Object.keys(this.activeNodes).forEach((k) => this.stop(k));
  }
}

export const audioEngine = new AmbientAudioEngine();
