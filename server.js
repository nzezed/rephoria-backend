require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Health check / root route
app.get('/', (req, res) => {
  res.send('🤖 Rephoria API is live! Use POST /api/transcribe or /api/summarize');
});

// Transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // build form data for Whisper API
    const form = new FormData();
    form.append('file', fs.createReadStream(req.file.path));
    form.append('model', 'whisper-1');

    // call OpenAI Whisper endpoint
    const whisperRes = await axios.post(
      'https://api.openai.com/v1/audio/transcriptions',
      form,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...form.getHeaders(),
        },
      }
    );

    // return transcript
    res.json({ transcript: whisperRes.data.text });
  } catch (error) {
    console.error('Transcription error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Transcription failed' });
  } finally {
    // clean up uploaded file
    fs.unlink(req.file.path, () => {});
  }
});

// Summarization endpoint
app.post('/api/summarize', async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: 'No transcript provided' });
  }

  try {
    // call OpenAI ChatCompletion for summarization
    const summaryRes = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that summarizes call transcripts.' },
          { role: 'user', content: `Summarize this call transcript:\n\n${transcript}` }
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.skAN0rDKW7RgW811pS8YLdgOKz6RlwPs3UFbRmlP97KT3BlbkFJaULpa6tWpmoz4x1KWAuPt6Yi6663LIG2HyxsYMA}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = summaryRes.data.choices[0].message.content.trim();
    res.json({ summary });
  } catch (error) {
    console.error('Summarization error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Summarization failed' });
  }
});

// start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
