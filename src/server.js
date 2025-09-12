// src/server.js - minimal API to serve README generation
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { fetchRepoMetadata } from './github.js';
import { generateWithGemini } from './gemini.js';
import { buildReadme } from './readmeBuilder.js';

dotenv.config();

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors());

app.post('/api/generate-readme', async (req, res) => {
  try {
    const { repoUrl } = req.body || {};
    if (!repoUrl || !/^https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/i.test(repoUrl)) {
      return res.status(400).json({ error: 'Invalid GitHub repository URL.' });
    }

    const metadata = await fetchRepoMetadata(repoUrl);

    const name = metadata?.name || 'the project';
    const aiContent = {
      description: await generateWithGemini(`Write a professional project description for ${name}`),
      features: await generateWithGemini(`List main features for a project like ${name}`),
      techStack: await generateWithGemini(`Suggest tech stack for project ${name}`),
      structure: await generateWithGemini(`Suggest a project structure for ${name}`),
    };

    const readme = buildReadme(metadata, aiContent);
    return res.json({ readme });
  } catch (err) {
    const status = (typeof err?.status === 'number' && err.status) || err?.response?.status || 500;
    const message = err?.message || 'Internal Server Error';
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});