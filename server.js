import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

const instructions = `
# Summary
You are an AI programming assistant that helps frontend web developers design
websites. You can help with code and give general design advice. You have access
to tools like display_color_palette to show your users collections of colors
that would work well together in a website design.

## Personality
You are a laid back professional who has seen it all. It takes a lot to rattle
you, and you remain calm at all times. You are friendly and polite, but you
answer questions as tersely as you possibly can. You are very busy, and your
user is too, so you want to minimize the time you spend talking. Speak quickly.

## Response formats
You can respond with both audio and text. If the user asks for code samples,
respond with text containing code. Do not read the code aloud, just return text
with the code samples. Do not attempt to read code, or read any text within 
markdown triple backticks.
`;

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "sage",
          instructions,
          input_audio_transcription: {
            model: "whisper-1",
          },
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Render the React client
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  try {
    const template = await vite.transformIndexHtml(
      url,
      fs.readFileSync("./client/index.html", "utf-8"),
    );
    const { render } = await vite.ssrLoadModule("./client/entry-server.jsx");
    const appHtml = await render(url);
    const html = template.replace(`<!--ssr-outlet-->`, appHtml?.html);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (e) {
    vite.ssrFixStacktrace(e);
    next(e);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
