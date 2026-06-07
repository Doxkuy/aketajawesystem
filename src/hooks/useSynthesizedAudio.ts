import { useState, useEffect, useRef } from 'react';

// Singletons to share audio state across component mounts
let globalAudioCtx: AudioContext | null = null;
let globalIsMuted = true;
let forestHumNode: OscillatorNode | null = null;
let forestHumGain: GainNode | null = null;

export const useSynthesizedAudio = () => {
  const [isMuted, setIsMuted] = useState(globalIsMuted);
  const audioCtxRef = useRef<AudioContext | null>(globalAudioCtx);

  const initAudio = () => {
    if (audioCtxRef.current) return audioCtxRef.current;
    
    // Create AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();
    globalAudioCtx = ctx;
    audioCtxRef.current = ctx;
    return ctx;
  };

  const startBackgroundHum = () => {
    const ctx = initAudio();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (forestHumNode) return; // Already running

    // 1. Deep Jungle Cyber Hum (Resonant low frequency)
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, ctx.currentTime);
    filter.Q.setValueAtTime(5, ctx.currentTime);

    gain.gain.setValueAtTime(globalIsMuted ? 0 : 0.05, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    forestHumNode = osc;
    forestHumGain = gain;

    // 2. Cyber-Cricket Chirper (Random clicks/chirps in background)
    const playCricketChirp = () => {
      if (globalIsMuted || !globalAudioCtx || globalAudioCtx.state === 'suspended') return;
      
      const now = globalAudioCtx.currentTime;
      const chirpOsc = globalAudioCtx.createOscillator();
      const chirpGain = globalAudioCtx.createGain();

      chirpOsc.type = 'sine';
      // Fast sweeping frequency for a digital insect sound
      chirpOsc.frequency.setValueAtTime(1800, now);
      chirpOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.05);
      chirpOsc.frequency.exponentialRampToValueAtTime(1400, now + 0.1);

      chirpGain.gain.setValueAtTime(0, now);
      chirpGain.gain.linearRampToValueAtTime(0.015, now + 0.02);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      chirpOsc.connect(chirpGain);
      chirpGain.connect(globalAudioCtx.destination);

      chirpOsc.start(now);
      chirpOsc.stop(now + 0.15);
    };

    // Chirp periodically
    window.setInterval(() => {
      if (Math.random() > 0.4) {
        // Fast burst of 3-4 chirps
        let delay = 0;
        for (let i = 0; i < 3; i++) {
          setTimeout(playCricketChirp, delay);
          delay += 120;
        }
      }
    }, 4000);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    globalIsMuted = nextMuted;
    setIsMuted(nextMuted);

    const ctx = initAudio();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }

    if (forestHumGain && ctx) {
      forestHumGain.gain.setTargetAtTime(nextMuted ? 0 : 0.05, ctx.currentTime, 0.1);
    }

    // Play a click to acknowledge change
    if (!nextMuted) {
      setTimeout(() => playClick(), 50);
    }
  };

  const playHover = () => {
    if (globalIsMuted) return;
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Clean high frequency slide
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  };

  const playClick = () => {
    if (globalIsMuted) return;
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Cyber double click pulse
    const playPulse = (timeOffset: number, freq: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + timeOffset);

      gain.gain.setValueAtTime(0.02, now + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + duration);

      // Low pass filter to make the square wave sound "cyber-subtle"
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now + timeOffset);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + duration + 0.01);
    };

    playPulse(0, 600, 0.04);
    playPulse(0.05, 900, 0.06);
  };

  const playSuccess = () => {
    if (globalIsMuted) return;
    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);
      
      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.02, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.01);
    };

    // High tech chord: C5 -> E5 -> G5 -> C6 rapidly
    playTone(523.25, 0, 0.15);     // C5
    playTone(659.25, 0.04, 0.15);  // E5
    playTone(783.99, 0.08, 0.15);  // G5
    playTone(1046.50, 0.12, 0.25); // C6
  };

  useEffect(() => {
    // Automatically try to start hum on component mounts if audio context exists
    if (globalAudioCtx && !globalIsMuted) {
      startBackgroundHum();
    }
    
    // Set up auto-start triggers on any user interaction (to bypass browser block)
    const handleInteraction = () => {
      if (!globalIsMuted) {
        startBackgroundHum();
      }
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      removeListeners();
    };
  }, [isMuted]);

  return {
    isMuted,
    toggleMute,
    playHover,
    playClick,
    playSuccess,
    startBackgroundHum
  };
};
