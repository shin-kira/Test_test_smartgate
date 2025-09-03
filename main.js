const freq = 19963.9;        // Target frequency (Hz)
    const startDuration = 0.3;   // 200 ms start signal
    const bitDuration = 0.2;     // 200 ms per bit
    const pattern = [1, 0, 1, 0]; // Code: 1010

    document.getElementById("sendBtn").addEventListener("click", async () => {
      // Create/resume AudioContext
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      const gain = audioCtx.createGain();
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      let t = now;

      // 🔊 Start tone (200 ms)
      let osc = audioCtx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.connect(gain);
      osc.start(t);
      osc.stop(t + startDuration);
      t += startDuration;

      // Small gap between start and code (optional, 50 ms)
      t += 0.05;

      // 🔊 Encode pattern (1 = tone, 0 = silence)
      pattern.forEach(bit => {
        if (bit === 1) {
          let o = audioCtx.createOscillator();
          o.type = "sine";
          o.frequency.setValueAtTime(freq, t);
          o.connect(gain);
          o.start(t);
          o.stop(t + bitDuration);
        }
        // if bit == 0 → silence (do nothing)
        t += bitDuration;
      });

      console.log("✅ Signal scheduled at " + freq + " Hz");
    });


