require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));   // ← untuk web UI nanti

const API_BASE = 'https://api.freepik.com/v1/ai/video';
const API_KEY = process.env.FREEPik_API_KEY;

// ====================== PROXY KLING 3 PRO MOTION CONTROL ======================
app.post('/api/kling-motion-control-pro', async (req, res) => {
  try {
    const response = await axios.post(
      `${API_BASE}/kling-v3-motion-control-pro`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-freepik-api-key': API_KEY
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// GET daftar tugas / status
app.get('/api/tasks', async (req, res) => {
  try {
    const response = await axios.get(`${API_BASE}/kling-v3-motion-control-pro`, {
      headers: { 'x-freepik-api-key': API_KEY }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server Freepik Kling Proxy berjalan di http://localhost:${PORT}`);
  console.log(`📌 Endpoint Motion Control 3 Pro: POST /api/kling-motion-control-pro`);
});
