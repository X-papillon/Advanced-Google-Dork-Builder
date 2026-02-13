// ===== REAL SIDEBAR (Chrome safe + runs JS) =====

chrome.runtime.onMessage.addListener((req) => {
  if (req.action === "grab") {
    let links = [...document.querySelectorAll('a')]
      .map(a => a.href)
      .filter(h => h.startsWith('http') && !h.includes('google'));

    chrome.runtime.sendMessage({ urls: links });
  }
});
