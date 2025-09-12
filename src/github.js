// src/github.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GITHUB_API_BASE = "https://api.github.com/repos";

/**
 * Fetch repository metadata from GitHub
 * @param {string} repoUrl - GitHub repository URL
 */
export async function fetchRepoMetadata(repoUrl) {
  try {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\.git)?/);

    if (!match) {
      const e = new Error("❌ Invalid GitHub repository URL.");
      e.status = 400;
      throw e;
    }

    const owner = match[1];
    const repo = match[2];

    const headers = {
      "User-Agent": "MyReadme-Generator",
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await axios.get(`${GITHUB_API_BASE}/${owner}/${repo}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    const status = error.response?.status || 502; // default to Bad Gateway for upstream errors
    const msg = error.response?.data?.message || error.message;
    const e = new Error(`⚠️ Failed to fetch repository metadata${status ? ` (HTTP ${status})` : ""}: ${msg}`);
    e.status = status;
    throw e;
  }
}
