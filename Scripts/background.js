// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "embedTexts") {
//         let notes = request.texts;

//         fetch('http://127.0.0.1:8000/embed', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ texts: notes })
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log('Received embeddings:', data.embeddings);
//             chrome.storage.local.set({ 'embeddings': data.embeddings }, () => {
//                 sendResponse({ texts: notes, embeddings: data.embeddings });
//             });
//         })
//         .catch(error => {
//             console.error('Error embedding texts:', error);
//             sendResponse({ error: 'Failed to embed texts' });
//         });

//         return true; // Keep the message channel open for sendResponse
//     }
// });

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCurrentTabUrl") {
        // Get the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab) {
                sendResponse({ url: activeTab.url });
            }
        });
        return true; // Indicate that the response will be sent asynchronously
    }
});

let visitTimes = {};
let currentTabId = null;

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    if (currentTabId !== null && visitTimes[currentTabId]) {
        visitTimes[currentTabId].endTime = new Date().getTime();
        const timeSpent = visitTimes[currentTabId].endTime - visitTimes[currentTabId].startTime;
        visitTimes[currentTabId].totalTime += timeSpent;
    }

    currentTabId = activeInfo.tabId;
    if (!visitTimes[currentTabId]) {
        visitTimes[currentTabId] = { startTime: new Date().getTime(), totalTime: 0 };
    } else {
        visitTimes[currentTabId].startTime = new Date().getTime();
    }
});

chrome.tabs.onRemoved.addListener((tabId) => {
    if (visitTimes[tabId]) {
        visitTimes[tabId].endTime = new Date().getTime();
        const timeSpent = visitTimes[tabId].endTime - visitTimes[tabId].startTime;
        visitTimes[tabId].totalTime += timeSpent;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && visitTimes[tabId]) {
        visitTimes[tabId].url = tab.url;
    }
});

// Example function to log data
function logTimeSpent() {
    for (let tabId in visitTimes) {
        console.log(`Tab ${tabId}: ${visitTimes[tabId].totalTime / 1000} seconds on ${visitTimes[tabId].url}`);
    }
}

