// background.js

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'sendNotesToServer') {
        sendNotesToServer(request.notes);
    }
});

// Function to send notes to the server
async function sendNotesToServer(notes) {

    console.log('notes in BG ',notes);
    try {
        const response = await fetch('http://127.0.0.1:8000/add_nodes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "notes": notes })
  
        });
        const data = await response.json();
        console.log('Notes sent successfully:', data);
    } catch (error) {
        console.error('Error sending notes:', error);
    }
}
