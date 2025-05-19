const injectBtn = document.getElementById('injectBtn');
if (injectBtn) {
  injectBtn.addEventListener('click', () => {
    injectBtn.remove();
    alert('Injected');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ['content.js']
      });
    });
  });
}

document.getElementById('runBtn1').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        window.dispatchEvent(new CustomEvent('JHUDCommand', { detail: 'runCorrect' }));
      }
    });
  });
});

document.getElementById('runBtn2').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        window.dispatchEvent(new CustomEvent('JHUDCommand', { detail: 'runIncorrect' }));
      }
    });
  });
});

document.getElementById('runBtn3').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        window.dispatchEvent(new CustomEvent('JHUDCommand', { detail: 'instantFinish' }));
      }
    });
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    files: ['injected-script.js']
  });
});


document.getElementById('setLessonsBtn').addEventListener('click', () => {
  const val = prompt('Enter new value for __lessonsCompletedThisWeek:');
  if (val !== null && !isNaN(val)) {
    alert(`Setting __lessonsCompletedThisWeek to ${val}`);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (lessonsVal) => {
          window.dispatchEvent(new CustomEvent('ExtensionSetLessons', { detail: Number(lessonsVal) }));
        },
        args: [val]
      });
    });
  } else {
    alert('Please enter a valid number.');
  }
});

document.getElementById('setCoinsBtn').addEventListener('click', () => {
  const val = prompt('Enter value for shell.updateCoinCount:');
  if (val !== null) {
    alert(`Calling shell.updateCoinCount("${val}")`);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (coinVal) => {
          window.dispatchEvent(new CustomEvent('ExtensionSetCoins', { detail: coinVal }));
        },
        args: [val]
      });
    });
  }
});
