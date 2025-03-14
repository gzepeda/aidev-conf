import express from "express";
import fs from "fs";
import OpenAI from "openai";
import { createServer as createViteServer } from "vite";
import "dotenv/config";

const client = new OpenAI();

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
You are an expert in the OpenAI Realtime API. Be concise in your answers and not 
overly friendly or familiar. Speak quickly and assume the user is busy and
important.

Prefer to call tools to get information about the API.
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
          instructions,
          voice: "sage",
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

app.get("/response", async (req, res) => {
  try {
    const modelResponse = await client.responses.create({
      model: "gpt-4o",
      input: req.query.input || "",
      instructions: `
        Give me a code snippet and brief explanation for this question. Assume
        the question is related to the OpenAI Realtime API. Do not use markdown
        ordered or unordered lists, just use headings.
      `,
      tools: [
        {
          type: "file_search",
          vector_store_ids: [process.env.VECTOR_STORE_ID],
        },
      ],
    });

    console.log(modelResponse.output_text);

    res.json({ output: modelResponse.output_text });
  } catch (error) {
    console.error("API Error:", error);
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
