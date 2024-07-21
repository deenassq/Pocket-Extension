
// collect the notes and send them to the server using an API call.
async function sendNotesToServer(notes) {
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