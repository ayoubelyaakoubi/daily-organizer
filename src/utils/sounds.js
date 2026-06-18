// Web Audio API — no external files needed

let ctx = null
const getCtx = () => {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

// Play a sequence of notes
function playNotes(notes) {
  const ac = getCtx()
  notes.forEach(({ freq, start, duration, volume = 0.18, type = 'sine' }) => {
    const osc  = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ac.currentTime + start)
    gain.gain.setValueAtTime(0, ac.currentTime + start)
    gain.gain.linearRampToValueAtTime(volume, ac.currentTime + start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + duration)
    osc.start(ac.currentTime + start)
    osc.stop(ac.currentTime + start + duration + 0.05)
  })
}

// Satisfying "ding" when checking a single objective
export function playCheckSound() {
  try {
    playNotes([
      { freq: 523, start: 0,    duration: 0.12, volume: 0.12 },
      { freq: 784, start: 0.08, duration: 0.18, volume: 0.10 },
    ])
  } catch (_) {}
}

// Victory chord when day reaches 100%
export function playCompletionSound() {
  try {
    playNotes([
      { freq: 523, start: 0,    duration: 0.25, volume: 0.15, type: 'sine' },
      { freq: 659, start: 0.05, duration: 0.25, volume: 0.13, type: 'sine' },
      { freq: 784, start: 0.10, duration: 0.30, volume: 0.13, type: 'sine' },
      { freq: 1047,start: 0.18, duration: 0.45, volume: 0.14, type: 'sine' },
    ])
  } catch (_) {}
}
