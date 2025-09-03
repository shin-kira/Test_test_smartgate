const freq = 19963.9;         // Target frequency (Hz)
    const startDuration = 0.2;    // 200 ms start signal
    const bitDuration = 0.2;      // 200 ms per bit
    const pattern = [1, 0, 1, 0]; // Unlock code pattern (1010)

async function sendSignal() {
      // Create AudioContext (Safari on iOS needs user gesture)
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

      // Helper: Play a tone for a duration
      async function playTone(duration) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        gain.gain.setValueAtTime(1, audioCtx.currentTime);

        osc.start();
        await new Promise(r => setTimeout(r, duration * 1000));
        osc.stop();
      }

      // Helper: Silence for a duration
      async function playSilence(duration) {
        await new Promise(r => setTimeout(r, duration * 1000));
      }

      console.log("🔊 Sending start tone...");
      await playTone(startDuration);

      console.log("🔊 Sending code pattern...");
      for (let bit of pattern) {
        if (bit === 1) {
          console.log("Bit 1 → Play tone");
          await playTone(bitDuration);
        } else {
          console.log("Bit 0 → Silence");
          await playSilence(bitDuration);
        }
      }

      console.log("✅ Signal sent!");
}
