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
      throw new Error("❌ Invalid GitHub repository URL.");
    }

    const owner = match[1];
    const repo = match[2];

    const response = await axios.get(`${GITHUB_API_BASE}/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        "User-Agent": "MyReadme-Generator",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `⚠️ Failed to fetch repository metadata: ${error.response?.data?.message || error.message}`
    );
  }
}
