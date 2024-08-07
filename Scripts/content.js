// Using URL's hostname as a key for storing notes
const tabId = document.URL;

// Main - Fires event when user selects some text
document.addEventListener("mouseup", function (event) {
    let selection = window.getSelection();
    let selectedText = selection.toString().trim();
    let previousAddBtn = document.getElementById("add-note-button");

    if (!selectedText || previousAddBtn) return;

    chrome.storage.local.get({ 'status': true, 'highlight': false }, function (res) {
        if (res.status) {
            createAddButton(selectedText, event);
        }
    });
});

// Remove add-note-button if user tries to select some other text or presses mouse button
document.addEventListener("mousedown", function (e) {
    let addNoteButton = document.getElementById("add-note-button");
    if (addNoteButton && e.target.id !== "add-note-button") {
        addNoteButton.remove();
    }
});

// Remove add-note-button if user presses some key
document.addEventListener("keydown", function () {
    let addNoteButton = document.getElementById("add-note-button");
    if (addNoteButton) {
        addNoteButton.remove();
    }
});

// Create add-note-button and add click event listener
function createAddButton(selectedText, event) {
    let addBtn = document.createElement("button");
    addBtn.id = "add-note-button";

    // If the user clicks the button, update the notes and highlight the text
    addBtn.addEventListener("click", function () {
        // Highlight the selected text immediately
        highlightText();
        // Add selected text to the notes of current tabId
        updateNotes(selectedText, tabId);
        // Remove button after notes are updated
        addBtn.remove();
    });

    // Get the position of the selected text for button's position
    let x = event.pageX;
    let y = event.pageY;
    // Set button's position
    addBtn.style.left = x + "px";
    addBtn.style.top = y + "px";
    // Add the button to the document
    document.body.appendChild(addBtn);
}

function updateNotes(selectedText, tabId) {
    chrome.storage.local.get({ 'all_notes': {} }, function (result) {
        let all_notes = result.all_notes;
        let notes = all_notes[tabId] || [];
        if (notes.indexOf(selectedText) === -1) {
            notes.push(selectedText);
            all_notes[tabId] = notes;
            chrome.storage.local.set({ all_notes: all_notes });
        }
        console.log(notes);
        // Send highlights to the background script
        chrome.runtime.sendMessage({ action: 'sendNotesToServer', notes: notes });
    });

    // create a new storage so notes can be saved and updated individually in rag
    chrome.storage.local.get('all_notes_container', result => {
        let all_notes_container = result.all_notes_container || {};
        let found = false;

        for (let key in all_notes_container) {
            if (all_notes_container[key] === selectedText) {
                found = true;
                break;
            }
        }

        if (!found) {
            let newKey = getNextKey(all_notes_container);
            all_notes_container[newKey] = selectedText;
            sendNotesToServer({ [newKey]: selectedText });
        }

        chrome.storage.local.set({ all_notes_container: all_notes_container });
    });

    window.getSelection().removeAllRanges();
}

// Highlight selected text
function highlightText() {
    var span = document.createElement("span");
    span.style.fontWeight = "bold";
    span.style.backgroundColor = "YELLOW";
    span.style.color = "BLACK";

    if (window.getSelection) {
        var sel = window.getSelection();
        try {
            let range = sel.getRangeAt(0).cloneRange();
            range.surroundContents(span);
            sel.removeAllRanges();
            sel.addRange(range);
        } catch {
            console.log("Cannot highlight the text");
        }
    }
}

// Generate the next key for storage
function getNextKey(obj) {
    let keys = Object.keys(obj);
    return keys.length ? Math.max(...keys.map(k => parseInt(k))) + 1 : 1;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getHighlights") {
        chrome.storage.local.get({ 'all_notes': {} }, function (result) {
            let tabId = document.URL;
            let notes = result.all_notes[tabId] || [];
            sendResponse({ texts: notes });
        });

        return true; // Keep the message channel open for sendResponse
    }
});



// Kavya's code for extracting and storing content
function extractContent() {
    let web_url = document.URL;
    let content = document.body.innerHTML;
    return { web_url, content };
}

function showIndicator() {
    const indicator = document.createElement('div');
    indicator.textContent = "You've visited this page before!";
    indicator.style.position = 'fixed';
    indicator.style.top = '5px';
    indicator.style.right = '5px';
    indicator.style.backgroundColor = '#F0FFFF';
    indicator.style.fontSize = '12px';
    indicator.style.padding = '2px';
    indicator.style.zIndex = 9999;
    document.body.appendChild(indicator);
}

function storeContentInLocalStorage(web_url, content) {
    chrome.storage.local.get('userHistory', function (result) {
        const userHistory = result.userHistory || {};

        if (web_url in userHistory) {
            showIndicator();
        } else {
            userHistory[web_url] = content;
            chrome.storage.local.set({ userHistory: userHistory }, function () {
                if (chrome.runtime.lastError) {
                    console.error('Error setting local storage:', chrome.runtime.lastError);
                } else {
                    console.log('Content stored successfully.');
                }
            });
        }
    });
}

const { web_url, content } = extractContent();
const urlObj = new URL(web_url);
if (!urlObj.searchParams.has('q')) {
    storeContentInLocalStorage(web_url, content);
}

// Function to send a new note to rag
async function sendNotesToServer(nodes) {
    console.log(nodes);
    try {
        const response = await fetch('http://127.0.0.1:8000/add_nodes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ "url_and_content": nodes })
        });
        const data = await response.json();
        console.log('Notes sent successfully:', data);
    } catch (error) {
        console.error('Error sending notes:', error);
    }
}

// Function to get the next available key
function getNextKey(container) {
    let maxKey = 0;
    for (let key in container) {
      if (container.hasOwnProperty(key)) {
        const numericKey = parseInt(key, 10);
        if (numericKey > maxKey) {
          maxKey = numericKey;
        }
      }
    }
    return maxKey + 1;
  }