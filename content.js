// Inject the page-inject.js script into the page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('page-inject.js');
script.onload = () => script.remove();
(document.head || document.documentElement).appendChild(script);

// Create the HUD to show the time
function createTimeHud() {
  if (document.getElementById('hud-time')) return; // Avoid duplicates

  const hud = document.createElement('div');
  hud.id = 'hud-time';

  Object.assign(hud.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    padding: '12px 18px',
    background: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    zIndex: 999999,
  });

  hud.innerText = 'Waiting for time...';
  document.body.appendChild(hud);
}
createTimeHud();

// Create the HUD to show lessons completed
function createLessonsHud() {
  if (document.getElementById('jhud-lessons')) return; // Avoid duplicates

  const lessonsHud = document.createElement('div');
  lessonsHud.id = 'jhud-lessons';

  Object.assign(lessonsHud.style, {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    padding: '12px 18px',
    background: 'rgba(0, 0, 0, 0.85)',
    color: 'white',
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    zIndex: 999999,
  });

  lessonsHud.innerText = 'Lessons: waiting...';
  document.body.appendChild(lessonsHud);
}
createLessonsHud();

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  let result = '';
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0 || hours > 0) result += `${minutes}m `;
  result += `${seconds}s`;

  return result.trim();
}

let baseTime = null;
let tick = 0;
let timerInterval = null;

const hud = document.getElementById('hud-time');
const lessonsHud = document.getElementById('jhud-lessons');

// Listen for time updates from the page context script
window.addEventListener('JHUDTimeUpdate', (event) => {
  const data = event.detail;
  if (data === 'error') {
    hud.innerText = 'Error reading time';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  } else if (typeof data === 'number') {
    baseTime = data;
    tick = 0;
    hud.innerText = 'Time: ' + formatTime(baseTime);

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      tick += 1000; // increment by 1 second (1000 ms)
      hud.innerText = 'Time: ' + formatTime(baseTime + tick);
    }, 1000); // update every 1 second
  } else {
    hud.innerText = 'Waiting for time...';
  }
});

// Listen for lessons updates from the page context script
window.addEventListener('JHUDLessonsUpdate', (e) => {
  const val = e.detail;
  if (val === 'error') {
    lessonsHud.innerText = 'Lessons: error';
  } else if (val === 'unknown') {
    lessonsHud.innerText = 'Lessons: unknown';
  } else {
    lessonsHud.innerText = 'Lessons: ' + val;
  }
});

// Create the Hide UI button (injected into page context)
function createToggleButton() {
  if (document.getElementById('jhud-toggle-btn')) return;

  const toggleButton = document.createElement('button');
  toggleButton.id = 'jhud-toggle-btn';
  toggleButton.innerText = 'Hide UI';

  Object.assign(toggleButton.style, {
    position: 'fixed',
    top: '20px',
    left: '20px',
    padding: '8px 12px',
    backgroundColor: '#444',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif',
    zIndex: 1000000,
  });

  document.body.appendChild(toggleButton);

  let uiHidden = false;
  toggleButton.addEventListener('click', () => {
    uiHidden = !uiHidden;

    hud.style.display = uiHidden ? 'none' : 'block';
    lessonsHud.style.display = uiHidden ? 'none' : 'block';

    toggleButton.innerText = uiHidden ? 'Show UI' : 'Hide UI';
  });
}
createToggleButton();

try {
  window.__lessonFeedbackOptIn = false;
  console.log("✅ Feedback opt-in disabled.");
} catch (e) {
  console.warn("⚠️ Could not disable feedback opt-in:", e);
}
