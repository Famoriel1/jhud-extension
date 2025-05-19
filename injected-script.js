// injected-script.js

function setLessonsCompleted(val) {
  window.__lessonsCompletedThisWeek = val;
  console.log(`__lessonsCompletedThisWeek set to ${val}`);
}

function setCoinCount(val) {
  if (typeof shell !== 'undefined' && typeof shell.updateCoinCount === 'function') {
    shell.updateCoinCount(val);
    console.log(`shell.updateCoinCount called with "${val}"`);
  } else {
    console.warn('shell or updateCoinCount not available');
  }
}

window.addEventListener('ExtensionSetLessons', (event) => {
  setLessonsCompleted(event.detail);
});

window.addEventListener('ExtensionSetCoins', (event) => {
  setCoinCount(event.detail);
});
