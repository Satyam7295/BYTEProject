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

    // Normalize and validate GitHub URL
    const normalizedUrl = (() => {
      if (!repoUrl || typeof repoUrl !== 'string') return null;
      const candidate = repoUrl.trim();
      const withProtocol = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
      try {
        const u = new URL(withProtocol);
        if (!/^(?:www\.)?github\.com$/i.test(u.hostname)) return null;
        const parts = u.pathname.replace(/^\/+|\/+$/g, '').split('/');
        if (parts.length < 2) return null;
        const owner = parts[0];
        let repo = parts[1];
        if (!owner || !repo) return null;
        repo = repo.replace(/\.git$/i, '');
        return `https://github.com/${owner}/${repo}`;
      } catch {
        return null;
      }
    })();

    if (!normalizedUrl) {
      return res.status(400).json({ error: 'Invalid GitHub repository URL.' });
    }

    const metadata = await fetchRepoMetadata(normalizedUrl);

    const name = metadata?.name || 'the project';
    const [description, features, techStack, structure] = await Promise.all([
      generateWithGemini(`Write a professional project description for ${name}`),
      generateWithGemini(`List main features for a project like ${name}`),
      generateWithGemini(`Suggest tech stack for project ${name}`),
      generateWithGemini(`Suggest a project structure for ${name}`),
    ]);

    const readme = buildReadme(metadata, { description, features, techStack, structure });
    return res.json({ readme });
  } catch (err) {
    console.error('Error in /api/generate-readme:', err);
    const status = (typeof err?.status === 'number' && err.status) || err?.response?.status || 500;
    const message = err?.message || 'Internal Server Error';
    return res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Global error handler to ensure JSON errors
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const status = (typeof err?.status === 'number' && err.status) || 500;
  const message = err?.message || 'Internal Server Error';
  res.status(status >= 400 && status < 600 ? status : 500).json({ error: message });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});