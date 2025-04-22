document.getElementById('transcribeForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData();
  const audioFile = document.getElementById('audioFile').files[0];
  formData.append('audio', audioFile);

  try {
    const response = await fetch('https://rephoria-backend-production.up.railway.app/api/transcribe', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.transcript) {
      document.getElementById('transcriptResult').textContent = `Transcript: ${data.transcript}`;
    } else {
      document.getElementById('transcriptResult').textContent = 'Error: ' + data.error;
    }
  } catch (error) {
    document.getElementById('transcriptResult').textContent = 'Error: ' + error.message;
  }
});

document.getElementById('summarizeForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent default form submission

  const transcriptText = document.getElementById('transcriptText').value;

  try {
    const response = await fetch('https://rephoria-backend-production.up.railway.app/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript: transcriptText }),
    });

    const data = await response.json();
    if (data.summary) {
      document.getElementById('summaryResult').textContent = `Summary: ${data.summary}`;
    } else {
      document.getElementById('summaryResult').textContent = 'Error: ' + data.error;
    }
  } catch (error) {
    document.getElementById('summaryResult').textContent = 'Error: ' + error.message;
  }
});
