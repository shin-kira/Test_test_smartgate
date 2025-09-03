import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_RsdlNL9CLIDr8kw5yGgNZCaBj3PxPBk",
  authDomain: "gate-pre.firebaseapp.com",
  databaseURL: "https://gate-pre-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gate-pre",
  storageBucket: "gate-pre.appspot.com",
  messagingSenderId: "786412393457",
  appId: "1:786412393457:web:6226728a8cf5863073ea50"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const guestId = "guest123";
const guestRef = ref(db, `guests/${guestId}`);

const gatestate = {
  OTP: null,
  state: false,
  timestamp: null,
  validUntil: null
};

function sendSignal() {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      const freq = 19963.9; // Target frequency
      const startDuration = 0.2; // 300ms for start signal
      const bitDuration = 0.2; // 200ms per bit
      const pattern = [1, 0, 1, 0]; // 1010

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      const now = context.currentTime;

      // Start tone for 300ms
      gainNode.gain.setValueAtTime(1, now);
      gainNode.gain.setValueAtTime(0, now + startDuration);

      let time = now + startDuration;

      // Encode the pattern
      pattern.forEach(bit => {
        if (bit === 1) {
          gainNode.gain.setValueAtTime(1, time);
          gainNode.gain.setValueAtTime(0, time + bitDuration);
        } else {
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.setValueAtTime(0, time + bitDuration);
        }
        time += bitDuration;
      });

      oscillator.start(now);
      oscillator.stop(time);
}

document.addEventListener("DOMContentLoaded", () => {
  const gateButton = document.getElementById("gateAccsess");
  if (!gateButton) return;

  gateButton.addEventListener("click", () => {
    const otpExpiry = 20000; 

    gateButton.disabled = true; // ✅ Prevent spamming clicks

    gatestate.state = true;
    gatestate.OTP = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    gatestate.timestamp = Date.now();
    gatestate.validUntil = Date.now() + otpExpiry;

    sendSignal();

    update(guestRef, gatestate)
      .then(() => {
        console.log(`✅ Gate access granted! OTP: ${gatestate.OTP}`);

        // ✅ Auto reset after expiry
        setTimeout(() => {
          update(guestRef, { state: false, OTP: null })
            .then(() => console.log("✅ OTP expired, gate closed"))
            .catch(err => console.error("Error resetting gate:", err));
        }, 5000);
      })
      .catch(err => console.error("❌ Error updating gate access:", err));
  });
});
