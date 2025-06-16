// backend/api/summarize.js

import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import fetch from "node-fetch";
import { OpenAI } from "openai";

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL required" });
  }

  try {
    const html = await fetch(url).then((r) => r.text());
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      return res.status(400).json({ error: "Could not extract readable content." });
    }

    const prompt = `Summarize the following article and list 5 key points:\n\n${article.textContent}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;
    const [summary, ...points] = content.split(/\n/).filter(Boolean);

    res.status(200).json({
      url,
      summary,
      keyPoints: points.slice(0, 5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Summarization failed." });
  }
}
