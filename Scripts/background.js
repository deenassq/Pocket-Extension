chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "embedTexts") {
        let notes = request.texts;

        fetch('http://127.0.0.1:8000/embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ texts: notes })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Received embeddings:', data.embeddings);
            chrome.storage.local.set({ 'embeddings': data.embeddings }, () => {
                sendResponse({ texts: notes, embeddings: data.embeddings });
            });
        })
        .catch(error => {
            console.error('Error embedding texts:', error);
            sendResponse({ error: 'Failed to embed texts' });
        });

        return true; // Keep the message channel open for sendResponse
    }
});
