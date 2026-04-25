const express = require('express');
const multer = require('multer');
const axios = require('axios');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.FREEPik_API_KEY;
const BASE_URL = process.env.BASE_URL || `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'localhost:3000'}`;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.post('/api/generate', upload.fields([{name:'image'}, {name:'video'}]), async (req, res) => {
  try {
    const imageFile = req.files.image[0];
    const videoFile = req.files.video[0];

    const image_url = `${BASE_URL}/uploads/${imageFile.filename}`;
    const video_url = `${BASE_URL}/uploads/${videoFile.filename}`;

    const { prompt = "", character_orientation = "video", cfg_scale = 0.5 } = req.body;

    const payload = {
      image_url,
      video_url,
      prompt,
      character_orientation,
      cfg_scale: parseFloat(cfg_scale)
    };

    const response = await axios.post(
      'https://api.freepik.com/v1/ai/video/kling-v3-motion-control-pro',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-freepik-api-key': API_KEY
        }
      }
    );

    const task_id = response.data.data?.task_id || response.data.task_id || 'unknown';
    res.json({ success: true, task_id });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

app.get('/api/task/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const response = await axios.get(
      `https://api.freepik.com/v1/ai/video/kling-v3-motion-control-pro/${taskId}`,
      { headers: { 'x-freepik-api-key': API_KEY } }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di ${BASE_URL}`);
});
