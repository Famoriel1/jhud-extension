(function waitAndSendTime(retries = 20) {
  if (typeof window.__initialWeeklyTime === 'number' && window.__initialWeeklyTime > 0) {
    window.dispatchEvent(new CustomEvent('JHUDTimeUpdate', { detail: window.__initialWeeklyTime }));
  } else if (retries > 0) {
    setTimeout(() => waitAndSendTime(retries - 1), 500);
  } else {
    window.dispatchEvent(new CustomEvent('JHUDTimeUpdate', { detail: 'error' }));
  }
})();

function sendLessonsCount() {
  try {
    const count = window.__lessonsCompletedThisWeek;
    if (typeof count === 'number') {
      window.dispatchEvent(new CustomEvent('JHUDLessonsUpdate', { detail: count }));
    } else {
      window.dispatchEvent(new CustomEvent('JHUDLessonsUpdate', { detail: 'unknown' }));
    }
  } catch (e) {
    window.dispatchEvent(new CustomEvent('JHUDLessonsUpdate', { detail: 'error' }));
  }
}

// Run immediately and then repeat
sendLessonsCount();
setInterval(sendLessonsCount, 1000);

// --- REMOVE ELEMENT BY ID AND WATCH FOR REINSERTION ---
function removeElementById(id) {
  const targetNode = document.getElementById(id);

  if (targetNode) {
    targetNode.parentNode.removeChild(targetNode);

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          Array.from(mutation.addedNodes).forEach(function(addedNode) {
            if (addedNode.id === id) {
              addedNode.parentNode.removeChild(addedNode);
            }
          });
        }
      });
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.documentElement, config);
  }
}

setTimeout(() => {
  removeElementById("copyright");
}, 1000);

// --- SKIP TOGGLE WITH MESSAGE HUD ---
let skipEnabled = false;
let intervalId = null;
const messageDiv = document.createElement('div');

Object.assign(messageDiv.style, {
  position: 'fixed',
  bottom: '10px',
  left: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white',
  padding: '6px 10px',
  borderRadius: '6px',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  display: 'none',
  zIndex: 999999
});

messageDiv.innerText = 'Skip Enabled';
document.body.appendChild(messageDiv);

document.addEventListener('keydown', (event) => {
  if (event.key === 'f' || event.key === 'F') {
    skipEnabled = !skipEnabled;
    messageDiv.style.display = skipEnabled ? 'block' : 'none';

    if (skipEnabled) {
      intervalId = setInterval(() => {
        try {
          userSkip(); // Must exist on page
        } catch (e) {
          // Silently fail
        }
      }, 10);
    } else {
      clearInterval(intervalId);
    }
  }
});

// ... keep all your existing logic (time updates, skip toggle, etc.) ...

// --- LISTEN FOR EXTENSION COMMANDS ---
window.addEventListener('JHUDCommand', (event) => {
  const cmd = event.detail;

  if (cmd === 'runCorrect') {
    if (typeof updateProgressCorrect === 'function') updateProgressCorrect();
    else console.warn('updateProgressCorrect is not defined.');
  }

  else if (cmd === 'runIncorrect') {
    if (typeof updateProgressIncorrect === 'function') updateProgressIncorrect();
    else console.warn('updateProgressIncorrect is not defined.');
  }

  else if (cmd === 'instantFinish') {
    waitForShellUpdate();
  }
});

// Wait for shell.updateProgress and run it
function waitForShellUpdate(retries = 20) {
  if (
    typeof shell === 'object' &&
    typeof shell.updateProgress === 'function'
  ) {
    try {
      shell.updateProgress(100, "Complete", {});
      console.log("✅ shell.updateProgress ran successfully.");
    } catch (e) {
      console.error("❌ shell.updateProgress threw an error:", e);
    }
  } else if (retries > 0) {
    setTimeout(() => waitForShellUpdate(retries - 1), 500);
  } else {
    console.warn("❗ shell.updateProgress is not available after waiting.");
  }
}
