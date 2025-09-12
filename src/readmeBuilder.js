// src/readmeBuilder.js

/**
 * Build a professional README.md content
 * @param {object} metadata - GitHub metadata
 * @param {object} aiContent - Gemini generated content
 */
export function buildReadme(metadata = {}, aiContent = {}) {
  const tech = Array.isArray(metadata.languages)
    ? metadata.languages.join(", ")
    : (typeof metadata.language === "string" && metadata.language)
      ? metadata.language
      : (aiContent.techStack || "");

  return `
# ${metadata.name || "Project Title"}

## 📌 Description
${metadata.description || aiContent.description || ""}

## ✨ Features
${aiContent.features || "- Feature 1\n- Feature 2"}

## ⚙️ Installation
\`\`\`bash
 git clone ${metadata.html_url || "<repo-url>"}
 cd ${metadata.name || "<repo-name>"}
 npm install
\`\`\`

## 🛠 Tech Stack
${tech}

## 📂 Project Structure
\`\`\`
${aiContent.structure || "To be filled..."}
\`\`\`

## 📄 License
${metadata.license?.name || "No license specified"}
`;
}