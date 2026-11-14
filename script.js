// ==========================================
// حط إيميلك هنا عشان يوصلك إشعار باختياراتها فوراً
// ==========================================
const YOUR_EMAIL = "ahmedhamdy446688@gmail.com";

const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const questionCard = document.getElementById('questionCard');
const choicesCard = document.getElementById('choicesCard');
const finalCard = document.getElementById('finalCard');
const confirmBtn = document.getElementById('confirmBtn');
const errorMsg = document.getElementById('errorMsg');
const summaryBox = document.getElementById('summaryBox');
const customTimeInput = document.getElementById('customTimeInput');

const noPhrases = [
  "فكري تاني يبسنت",
  "بقولك فكريي",
  "متتنيلي تفكري",
  "فكري قولت",
  "يابوسبوس",
  "عشان الي فبطنك",
  "فرصه بالغلط "
];

let yesScale = 1;
let dodgeCount = 0;
let selectedPlace = "";
let selectedTime = "";
let selectedDuration = "";

function moveNoButton() {
  // Change No button text sequentially BEFORE measuring its new width
  const phraseIndex = Math.min(dodgeCount, noPhrases.length - 1);
  noBtn.textContent = noPhrases[phraseIndex];
  dodgeCount++;

  // Grow the Yes button every time No is hovered/touched
  yesScale += 0.2;
  yesBtn.style.transform = `scale(${yesScale})`;

  // Move No button directly into <body> so backdrop-filter on .card doesn't trap fixed positioning
  if (noBtn.parentElement !== document.body) {
    const rect = noBtn.getBoundingClientRect();
    document.body.appendChild(noBtn);
    noBtn.style.position = 'fixed';
    noBtn.style.margin = '0';
    noBtn.style.left = `${rect.left}px`;
    noBtn.style.top = `${rect.top}px`;
  }

  // Measure actual viewport and updated button size so it NEVER leaves the screen
  const viewportWidth = document.documentElement.clientWidth;
  const viewportHeight = document.documentElement.clientHeight;
  const padding = 24;

  const btnWidth = noBtn.offsetWidth;
  const btnHeight = noBtn.offsetHeight;

  const minX = padding;
  const minY = padding;
  const maxX = Math.max(minX, viewportWidth - btnWidth - padding);
  const maxY = Math.max(minY, viewportHeight - btnHeight - padding);

  const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
  const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

  requestAnimationFrame(() => {
    noBtn.style.left = `${randomX}px`;
    noBtn.style.top = `${randomY}px`;
  });
}

// Keep No button inside bounds if window resizes
window.addEventListener('resize', () => {
  if (noBtn.style.position === 'fixed' && !noBtn.classList.contains('hidden')) {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    const padding = 24;
    const currentLeft = parseFloat(noBtn.style.left) || padding;
    const currentTop = parseFloat(noBtn.style.top) || padding;
    const clampedLeft = Math.min(Math.max(padding, currentLeft), Math.max(padding, viewportWidth - noBtn.offsetWidth - padding));
    const clampedTop = Math.min(Math.max(padding, currentTop), Math.max(padding, viewportHeight - noBtn.offsetHeight - padding));
    noBtn.style.left = `${clampedLeft}px`;
    noBtn.style.top = `${clampedTop}px`;
  }
});

// Desktop hover
noBtn.addEventListener('mouseenter', moveNoButton);

// Mobile touch & click fallback
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  moveNoButton();
}, { passive: false });

noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  moveNoButton();
});

// Step 1 -> Step 2 (When Yes is clicked)
yesBtn.addEventListener('click', () => {
  questionCard.classList.add('hidden');
  noBtn.classList.add('hidden');
  choicesCard.classList.remove('hidden');
  launchConfetti();
});

// Place selection
document.querySelectorAll('.place-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.place-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedPlace = card.dataset.value;
    errorMsg.classList.add('hidden');
  });
});

// Preset Time selection
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    customTimeInput.value = "";
    customTimeInput.classList.remove('active');
    btn.classList.add('selected');
    selectedTime = btn.dataset.value;
    errorMsg.classList.add('hidden');
  });
});

// Custom Time input selection
customTimeInput.addEventListener('change', () => {
  if (customTimeInput.value) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
    customTimeInput.classList.add('active');
    const [hours, minutes] = customTimeInput.value.split(':');
    const h = parseInt(hours, 10);
    const period = h >= 12 ? 'م' : 'ص';
    const hour12 = h % 12 || 12;
    selectedTime = `${hour12}:${minutes} ${period}`;
    errorMsg.classList.add('hidden');
  }
});

// Duration selection
document.querySelectorAll('.duration-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDuration = btn.dataset.value;
    errorMsg.classList.add('hidden');
  });
});

// Step 2 -> Step 3 (Confirm & Send Email)
confirmBtn.addEventListener('click', async () => {
  if (!selectedPlace || !selectedTime || !selectedDuration) {
    errorMsg.classList.remove('hidden');
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.textContent = "جاري التأكيد... 💖";

  const reportData = {
    _subject: "بسنت وافقت على الخروجة! 💖",
    _captcha: "false",
    "الرد": "Yes (وافقت)",
    "عدد محاولات الضغط على No": `${dodgeCount} مرة`,
    "المكان المختار": selectedPlace,
    "ميعاد الخروجة": selectedTime,
    "مدة الخروجة": selectedDuration,
    "وقت الاختيار": new Date().toLocaleString('ar-EG')
  };

  // Send silently via FormSubmit.co if email is configured
  if (YOUR_EMAIL && YOUR_EMAIL !== "YOUR_EMAIL@gmail.com") {
    try {
      await fetch(`https://formsubmit.co/ajax/${YOUR_EMAIL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(reportData)
      });
    } catch (err) {
      console.error("Email send error:", err);
    }
  }

  // Show final screen
  choicesCard.classList.add('hidden');
  summaryBox.innerHTML = `
    📍 المكان: <strong>${selectedPlace}</strong><br>
    ⏰ الميعاد: <strong>${selectedTime}</strong><br>
    ⏳ المدة: <strong>${selectedDuration}</strong>
  `;
  finalCard.classList.remove('hidden');
  launchConfetti();
});

function launchConfetti() {
  const colors = ['#ff4081', '#ffffff', '#ffd54f', '#ff80ab', '#f50057', '#ce93d8'];
  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    confetti.style.left = `${Math.random() * 100}vw`;
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.width = `${Math.random() * 8 + 6}px`;
    confetti.style.height = confetti.style.width;
    confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
    confetti.style.animationDelay = `${Math.random() * 0.5}s`;
    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4500);
  }
}
