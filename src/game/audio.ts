// Lightweight retro audio using Web Audio API
// Generated tones avoid needing audio file assets

type SoundType = 'move' | 'win' | 'draw';

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function beep(freq: number, duration: number, type: OscillatorType = 'square', gain = 0.15) {
  const ctx = getContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio errors
  }
}

function playMoveSound() {
  beep(440, 0.08, 'square', 0.12);
}

function playWinSound() {
  const ctx = getContext();
  if (!ctx) return;
  // Short ascending fanfare
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => beep(freq, 0.15, 'square', 0.15), i * 100);
  });
}

function playDrawSound() {
  beep(300, 0.15, 'sawtooth', 0.1);
  setTimeout(() => beep(250, 0.2, 'sawtooth', 0.08), 150);
}

export function playSound(type: SoundType, enabled: boolean): void {
  if (!enabled) return;
  switch (type) {
    case 'move': playMoveSound(); break;
    case 'win': playWinSound(); break;
    case 'draw': playDrawSound(); break;
  }
}
