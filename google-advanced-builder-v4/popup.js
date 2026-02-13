const categories = {
  "Basic": ['""', '()', '-', 'OR', 'AND', '*', '+', '~', '_'],
  "Web": ['site:', 'inurl:', 'allinurl:', 'intext:', 'allintext:', 'intitle:', 'allintitle:', 'inanchor:', 'allinanchor:', 'link:', 'related:', 'cache:', 'info:'],
  "Files": ['filetype:', 'ext:', 'mime:', 'size:'],
  "Search Modifiers": ['AROUND(5)', 'NEAR(5)', 'BEFORE:', 'AFTER:', 'daterange:'],
  "Location": ['loc:', 'location:', 'map:', 'radius:', 'postalcode:', 'country:'],
  "Content Types": ['source:', 'author:', 'label:', 'category:', 'type:', 'lang:'],
  "Business/Commerce": ['$', '€', '£', 'price:', 'store:', 'review:', 'rating:'],
  "Date/Time": ['daterange:', 'before:', 'after:', 'date:'],
  "Specialized": ['define:', 'weather:', 'stocks:', 'movie:', 'book:', 'recipe:', 'patent:', 'archive:'],
  "Technical": ['inurl:admin', 'inurl:login', 'inurl:config', 'inurl:backup', 'filetype:sql', 'filetype:env', 'ext:log']
};

const presets = [
  // Security/Admin
  'inurl:admin login',
  'intitle:"index of" "parent directory"',
  'filetype:sql "password"',
  'inurl:wp-admin',
  'intitle:"phpinfo()" "PHP Version"',
  
  // File Search
  'filetype:pdf "confidential"',
  'filetype:docx "resume"',
  'ext:sql "CREATE TABLE"',
  'filetype:env "API_KEY"',
  'filetype:log "error"',
  
  // Sensitive Info
  'intext:"password" "username"',
  'intext:"private key" -----BEGIN',
  'intext:"api_key" "https://"',
  'filetype:txt "credentials"',
  'intitle:"dashboard" "login"',
  
  // Cameras/Surveillance
  'intext:"camera live view"',
  'intitle:"webcamXP 5"',
  'intext:"MJPG Streamer"',
  'inurl:view/view.shtml',
  'intext:"Network Camera"',
  
  // Databases
  'intitle:"phpMyAdmin" "Welcome to"',
  'inurl:phpmyadmin/',
  'intitle:"MongoDB" "Dashboard"',
  'inurl:adminer.php',
  
  // Development/Config
  'filetype:yml "database:"',
  'filetype:config "password"',
  'intext:".env" "DB_PASSWORD"',
  'filetype:json "apiKey"',
  
  // Document Search
  'filetype:pdf "invoice" "total"',
  'filetype:xlsx "salary"',
  'filetype:doc "confidential" "draft"',
  'filetype:pptx "presentation"',
  
  // Maps/Location
  'map:restaurants near me',
  'location:New York pizza',
  'postalcode:10001 restaurants',
  'radius:5km coffee',
  
  // Specialized Searches
  'define:quantum computing',
  'weather:London tomorrow',
  'stocks:AAPL',
  'movie:"The Matrix" cast',
  'book:"Harry Potter" author',
  'recipe:chocolate cake',
  
  // Web Vulnerabilities
  'inurl:"id=" "product"',
  'inurl:"page=" "category"',
  'intext:"SQL syntax" "MySQL"',
  'intext:"Warning:" "mysql_fetch"',
  
  // Log Files
  'ext:log "error" "GET /"',
  'filetype:log "PUT" "200"',
  'ext:txt "login failed"',
  
  // IoT Devices
  'intitle:"DVR" "login"',
  'intext:"IP Camera" "Network"',
  'inurl:"webcam" "stream"',
  'intitle:"Router" "status"'
];

document.addEventListener("DOMContentLoaded", () => {
  buildUI();
  loadUrls();
});

function box() { return document.getElementById("searchBox"); }

function getCursorPosition() {
  const input = box();
  return input.selectionStart;
}

function setCursorPosition(pos) {
  const input = box();
  input.focus();
  input.setSelectionRange(pos, pos);
}

function getCurrentTextAndPosition() {
  const input = box();
  const cursorPos = getCursorPosition();
  const text = input.value;
  const textBeforeCursor = text.substring(0, cursorPos);
  const textAfterCursor = text.substring(cursorPos);
  
  return { text, cursorPos, textBeforeCursor, textAfterCursor };
}

function getWordBeforeCursor(text, cursorPos) {
  const textBefore = text.substring(0, cursorPos);
  const words = textBefore.split(/\s+/);
  return words[words.length - 1] || '';
}

function containsOperator(text) {
  if (text.match(/[a-z]+:/i)) return true;
  return false;
}

function applyOperator(op) {
  const input = box();
  const { text, cursorPos, textBeforeCursor, textAfterCursor } = getCurrentTextAndPosition();
  const wordBefore = getWordBeforeCursor(text, cursorPos);
  
  if (op === '""') {
    if (input.selectionStart !== input.selectionEnd) {
      const selectedText = input.value.substring(input.selectionStart, input.selectionEnd);
      const newText = textBeforeCursor + `"${selectedText}"` + textAfterCursor;
      input.value = newText;
      setCursorPosition(input.selectionStart + selectedText.length + 2);
    } else {
      const spaceBefore = cursorPos > 0 && text[cursorPos - 1] === ' ' ? ' ' : '';
      const spaceAfter = text[cursorPos] === ' ' ? ' ' : '';
      
      if (wordBefore && !containsOperator(wordBefore)) {
        const textBeforeWord = textBeforeCursor.substring(0, cursorPos - wordBefore.length);
        const newText = textBeforeWord + spaceBefore + `"${wordBefore}"` + spaceAfter + textAfterCursor;
        input.value = newText;
        setCursorPosition(textBeforeWord.length + spaceBefore.length + wordBefore.length + 3);
      } else {
        const newText = textBeforeCursor + `""` + textAfterCursor;
        input.value = newText;
        setCursorPosition(cursorPos + 1);
      }
    }
    return;
  }
  
  if (op === '()') {
    if (input.selectionStart !== input.selectionEnd) {
      const selectedText = input.value.substring(input.selectionStart, input.selectionEnd);
      const newText = textBeforeCursor + `(${selectedText})` + textAfterCursor;
      input.value = newText;
      setCursorPosition(input.selectionStart + selectedText.length + 2);
    } else {
      const newText = textBeforeCursor + `()` + textAfterCursor;
      input.value = newText;
      setCursorPosition(cursorPos + 1);
    }
    return;
  }
  
  if (['AND', 'OR', '-', '+', '~', '_'].includes(op)) {
    const trimmedBefore = textBeforeCursor.trim();
    const trimmedAfter = textAfterCursor.trim();
    
    const spaceBefore = trimmedBefore && !trimmedBefore.endsWith(' ') && op !== '_' ? ' ' : '';
    const spaceAfter = trimmedAfter && !trimmedAfter.startsWith(' ') && op !== '_' ? ' ' : '';
    
    const newText = textBeforeCursor + spaceBefore + op + spaceAfter + textAfterCursor;
    input.value = newText;
    setCursorPosition(cursorPos + spaceBefore.length + op.length + spaceAfter.length);
    return;
  }
  
  if (['$', '€', '£'].includes(op)) {
    if (input.selectionStart !== input.selectionEnd) {
      const selectedText = input.value.substring(input.selectionStart, input.selectionEnd);
      const newText = textBeforeCursor + op + selectedText + textAfterCursor;
      input.value = newText;
      setCursorPosition(input.selectionStart + selectedText.length + op.length);
    } else {
      const newText = textBeforeCursor + op + textAfterCursor;
      input.value = newText;
      setCursorPosition(cursorPos + op.length);
    }
    return;
  }
  
  if (op === '*') {
    const newText = textBeforeCursor + '*' + textAfterCursor;
    input.value = newText;
    setCursorPosition(cursorPos + 1);
    return;
  }
  
  if (op === 'AROUND(5)' || op === 'NEAR(5)') {
    if (input.selectionStart !== input.selectionEnd) {
      const selectedText = input.value.substring(input.selectionStart, input.selectionEnd);
      const newText = textBeforeCursor + ` ${op} ` + textAfterCursor;
      input.value = newText;
    } else {
      const spaceBefore = cursorPos > 0 && text[cursorPos - 1] !== ' ' ? ' ' : '';
      const spaceAfter = text[cursorPos] !== ' ' ? ' ' : '';
      const newText = textBeforeCursor + spaceBefore + op + spaceAfter + textAfterCursor;
      input.value = newText;
      setCursorPosition(cursorPos + spaceBefore.length + op.length + spaceAfter.length);
    }
    return;
  }
  
  if (op.endsWith(':')) {
    const isWordOperator = wordBefore.endsWith(':');
    const isTechnicalPreset = op.includes('admin') || op.includes('login') || op.includes('config') || op.includes('backup') || op.includes('.sql') || op.includes('.env') || op.includes('.log');
    
    if (isTechnicalPreset) {
      input.value = op;
      input.focus();
      return;
    }
    
    if (isWordOperator) {
      const textBeforeWord = textBeforeCursor.substring(0, cursorPos - wordBefore.length);
      const newText = textBeforeWord + op + textAfterCursor;
      input.value = newText;
      setCursorPosition(textBeforeWord.length + op.length);
    } else {
      const spaceBefore = cursorPos > 0 && text[cursorPos - 1] !== ' ' ? ' ' : '';
      const newText = textBeforeCursor + spaceBefore + op + textAfterCursor;
      input.value = newText;
      setCursorPosition(cursorPos + spaceBefore.length + op.length);
    }
    return;
  }
  
  const newText = textBeforeCursor + op + textAfterCursor;
  input.value = newText;
  setCursorPosition(cursorPos + op.length);
}

function buildUI() {
  let opsDiv = document.getElementById("ops");
  opsDiv.innerHTML = '';
  
  for(let cat in categories) {
    let h = document.createElement("h3");
    h.textContent = cat;
    opsDiv.appendChild(h);
    
    let container = document.createElement("div");
    
    categories[cat].forEach(op => {
      let b = document.createElement("button");
      b.textContent = op;
      b.onclick = () => applyOperator(op);
      container.appendChild(b);
    });
    
    opsDiv.appendChild(container);
  }
  
  let ph = document.createElement("h3");
  ph.textContent = "Search Presets";
  opsDiv.appendChild(ph);
  
  let presetContainer = document.createElement("div");
  
  presets.forEach(p => {
    let b = document.createElement("button");
    b.textContent = p;
    b.onclick = () => {
      box().value = p;
      box().focus();
    };
    presetContainer.appendChild(b);
  });
  
  opsDiv.appendChild(presetContainer);
}

document.getElementById("copy").onclick = () => {
  navigator.clipboard.writeText(box().value);
};

document.getElementById("search").onclick = () => {
  const query = box().value.trim();
  if (!query) return;
  chrome.tabs.create({
    url: "https://www.google.com/search?q=" + encodeURIComponent(query)
  });
};

// Modified grab button to scroll to URL list
document.getElementById("grab").onclick = () => {
  // First, send the grab message
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    chrome.tabs.sendMessage(tabs[0].id, {action: "grab"});
  });
  
  // Then scroll to the URL list
  setTimeout(() => {
    const urlList = document.getElementById("urlList");
    if (urlList) {
      urlList.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
  }, 500); // Small delay to allow URLs to be added
};

document.getElementById("export").onclick = () => {
  chrome.storage.local.get(["urls"], res => {
    const urls = res.urls || [];
    let blob = new Blob([urls.join('\n')], {type: "text/plain"});
    let url = URL.createObjectURL(blob);
    chrome.downloads.download({url, filename: "urls.txt"});
  });
};

// Clear search box
document.getElementById("clear").onclick = () => {
  document.getElementById("searchBox").value = "";
};

// Clear URL list from storage AND display
document.getElementById("clearls").onclick = () => {
  if (confirm("Are you sure you want to clear all saved URLs? This action cannot be undone.")) {
    // Clear from Chrome storage
    chrome.storage.local.set({ urls: [] }, () => {
      // Clear the display
      let list = document.getElementById("urlList");
      list.innerHTML = "<div style='color: #999; text-align: center; padding: 10px;'>URL list cleared</div>";
      
      console.log("URL list cleared from storage");
    });
  }
};

function loadUrls() {
  chrome.storage.local.get(["urls"], res => {
    let list = document.getElementById("urlList");
    list.innerHTML = "";
    const urls = res.urls || [];
    
    if (urls.length === 0) {
      list.innerHTML = "<div style='color: #999; text-align: center; padding: 10px;'>No URLs saved yet</div>";
      return;
    }
    
    // Add counter display
    const counter = document.createElement("div");
    counter.textContent = `Total URLs: ${urls.length}`;
    counter.style.cssText = "color: #666; font-size: 12px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #eee;";
    list.appendChild(counter);
    
    urls.forEach(u => {
      let a = document.createElement("a");
      a.href = u;
      a.target = "_blank";
      a.textContent = u;
      list.appendChild(a);
    });
  });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.urls) {
    chrome.storage.local.get(["urls"], res => {
      let all = [...(res.urls || []), ...msg.urls];
      all = [...new Set(all)];
      chrome.storage.local.set({urls: all}, () => {
        // After URLs are saved, scroll to the URL list
        loadUrls();
        setTimeout(() => {
          const urlList = document.getElementById("urlList");
          if (urlList) {
            urlList.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start'
            });
          }
        }, 100);
      });
    });
  }
});
