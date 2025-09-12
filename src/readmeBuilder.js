// src/readmeBuilder.js

/**
 * Build a professional README.md content
 * @param {object} metadata - GitHub metadata
 * @param {object} aiContent - Gemini generated content
 */
export function buildReadme(metadata, aiContent) {
  return `
# ${metadata.name || "Project Title"}

## 📌 Description
${metadata.description || aiContent.description}

## ✨ Features
${aiContent.features || "- Feature 1\n- Feature 2"}

## ⚙️ Installation
\`\`\`bash
git clone ${metadata.html_url}
cd ${metadata.name}
npm install
\`\`\`

## 🛠 Tech Stack
${Object.keys(metadata.language || {}).join(", ") || aiContent.techStack}

## 📂 Project Structure
\`\`\`
${aiContent.structure || "To be filled..."}
\`\`\`

## 📄 License
${metadata.license?.name || "No license specified"}
  `;
}
