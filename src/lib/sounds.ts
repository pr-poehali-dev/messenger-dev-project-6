// Web Audio API sound generator
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  const W = window as Window & { webkitAudioContext?: typeof AudioContext };
  if (!audioCtx) audioCtx = new (window.AudioContext || W.webkitAudioContext!)();
  return audioCtx;
}

// Short notification "ping" — two-tone melodic
export function playNotificationSound() {
  try {
    const ctx = getCtx();
    const notes = [880, 1100];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } catch { /* ignore */ }
}

// Incoming call ringtone — repeating pattern
let ringInterval: ReturnType<typeof setInterval> | null = null;

function playRingOnce() {
  try {
    const ctx = getCtx();
    const freqs = [700, 900, 700, 0, 700, 900, 700];
    const dur = 0.1;
    freqs.forEach((freq, i) => {
      if (!freq) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * dur;
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur - 0.01);
      osc.start(t);
      osc.stop(t + dur);
    });
  } catch { /* ignore */ }
}

export function startRingtone() {
  stopRingtone();
  playRingOnce();
  ringInterval = setInterval(playRingOnce, 2200);
}

export function stopRingtone() {
  if (ringInterval) { clearInterval(ringInterval); ringInterval = null; }
}

// Call connected beep
export function playConnectSound() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch { /* ignore */ }
}

// Star send sound — sparkle
export function playStarSound() {
  try {
    const ctx = getCtx();
    const freqs = [1200, 1500, 1800, 2100, 1800];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.07;
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.12);
    });
  } catch { /* ignore */ }
}

// Message sent "whoosh"
export function playMessageSound() {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch { /* ignore */ }
}