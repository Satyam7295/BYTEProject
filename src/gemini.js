// src/gemini.js — lil helper to talk to Gemini
// Uses Google Generativ Language API (Gemini) w/ API key (hopefuly set)
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const MODEL = "gemini-1.5-flash"; // ajust if needd
const API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Generate README content sugestions using Google Gemini.
 * Uses the Generative Lang API via api key auth (kinda standard).
 * Falls back to a placehoder on failer so the app can keep goin.
 * @param {string} prompt - what we ask the model (plain txt)
 */
export async function generateWithGemini(prompt) {
  if (!API_KEY) {
    // Soft fail so the pipline can keep goin (dont crash the flow)
    return "[AI unavailable: missing GOOGLE_API_KEY]";
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const { data } = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000,
      }
    );

    // Grab first candiate text
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini.";

    return text;
  } catch (error) {
    // Soft fail n return placehoder
    const msg =
      error?.response?.data?.error?.message || error?.message || "Unknown error";
    return `[AI error: ${msg}]`;
  }
}