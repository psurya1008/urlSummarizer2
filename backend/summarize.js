const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = async function (req, res) {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  try {
    const html = await fetch(url).then(res => res.text());
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      return res.status(400).json({ error: 'Could not extract readable content.' });
    }

    const prompt = `Summarize the following article and list 5 key points:\n\n${article.textContent}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.choices[0].message.content;
    const lines = content.split('\n').filter(Boolean);
    const summary = lines[0];
    const keyPoints = lines.slice(1).slice(0, 5);

    res.json({ url, summary, keyPoints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Summarization failed.' });
  }
};
