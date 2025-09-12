// src/index.js
import { fetchRepoMetadata } from "./github.js";
import { generateWithGemini } from "./gemini.js";
import { buildReadme } from "./readmeBuilder.js";
import fs from "fs";

async function main() {
  try {
    const repoUrl = process.argv[2];

    if (!repoUrl) {
      console.error("❌ Please provide a GitHub repository URL.");
      process.exit(1);
    }

    console.log("📡 Fetching GitHub repo metadata...");
    const metadata = await fetchRepoMetadata(repoUrl);

    console.log("🤖 Generating additional content with Gemini...");
    const aiContent = {
      description: await generateWithGemini(
        `Write a professional project description for ${metadata.name}`
      ),
      features: await generateWithGemini(
        `List main features for a project like ${metadata.name}`
      ),
      techStack: await generateWithGemini(
        `Suggest tech stack for project ${metadata.name}`
      ),
      structure: await generateWithGemini(
        `Suggest a project structure for ${metadata.name}`
      ),
    };

    console.log("📝 Building README.md...");
    const readmeContent = buildReadme(metadata, aiContent);

    fs.writeFileSync("README_GENERATED.md", readmeContent, "utf-8");

    console.log("✅ README_GENERATED.md created successfully!");
  } catch (error) {
    console.error(error.message);
  }
}

main();
