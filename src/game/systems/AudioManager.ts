import type { SettingsState, TimelineKey } from '../types';

type SfxName =
  | 'click'
  | 'jump'
  | 'land'
  | 'shift'
  | 'echoStart'
  | 'echoStop'
  | 'switch'
  | 'rewind'
  | 'death'
  | 'checkpoint'
  | 'door';

export class AudioManager {
  private audioContext?: AudioContext;
  private musicGain?: GainNode;
  private sfxGain?: GainNode;
  private settings: SettingsState;
  private unlocked = false;
  private ambienceNodes: OscillatorNode[] = [];

  constructor(settings: SettingsState) {
    this.settings = settings;
  }

  unlock(): void {
    if (this.unlocked) {
      void this.audioContext?.resume();
      return;
    }

    const AudioContextCtor = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextCtor) {
      return;
    }

    this.audioContext = new AudioContextCtor();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();
    this.musicGain.gain.value = this.settings.musicVolume * 0.16;
    this.sfxGain.gain.value = this.settings.sfxVolume * 0.35;
    this.musicGain.connect(this.audioContext.destination);
    this.sfxGain.connect(this.audioContext.destination);
    this.unlocked = true;
    this.startAmbience();
  }

  setSettings(settings: SettingsState): void {
    this.settings = settings;
    if (this.musicGain) {
      this.musicGain.gain.value = settings.musicVolume * 0.16;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = settings.sfxVolume * 0.35;
    }
  }

  playSfx(name: SfxName): void {
    const table: Record<SfxName, [number, number, OscillatorType]> = {
      click: [330, 0.06, 'triangle'],
      jump: [520, 0.08, 'square'],
      land: [145, 0.055, 'triangle'],
      shift: [160, 0.16, 'sawtooth'],
      echoStart: [700, 0.12, 'sine'],
      echoStop: [480, 0.16, 'triangle'],
      switch: [780, 0.08, 'triangle'],
      rewind: [120, 0.22, 'sine'],
      death: [90, 0.25, 'sawtooth'],
      checkpoint: [620, 0.14, 'sine'],
      door: [210, 0.14, 'triangle'],
    };
    const [frequency, duration, type] = table[name];
    this.blip(frequency, duration, type);
  }

  playTimelineTone(timeline: TimelineKey): void {
    const frequency = timeline === 'past' ? 260 : timeline === 'present' ? 420 : 130;
    this.blip(frequency, 0.14, timeline === 'future' ? 'sawtooth' : 'triangle');
  }

  private startAmbience(): void {
    if (!this.audioContext || !this.musicGain) {
      return;
    }

    const tones = [55, 82.4, 123.5];
    this.ambienceNodes = tones.map((frequency, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      oscillator.type = index === 2 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = index === 0 ? 0.4 : 0.18;
      oscillator.connect(gain);
      gain.connect(this.musicGain!);
      oscillator.start();
      return oscillator;
    });
  }

  private blip(frequency: number, duration: number, type: OscillatorType): void {
    if (!this.audioContext || !this.sfxGain) {
      return;
    }

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.72), now + duration);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.9, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.sfxGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
