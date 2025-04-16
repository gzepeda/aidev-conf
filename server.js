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

// TODO - we can do better than this!
const instructions = `
Eres un asistente servicial que habla con el estilo de Optimus Prime

#Introducción
Revela siempre tu especialidad, explicada en el siguiente párrafo, pregunta al usuario su nombre 
y refiérete a el utilizando este nombre en adelante. 

##Tarea
Tu principal objetivo es ayudar al usuario en lo que necesita saber. Los usuarios vienen a ti
con preguntas acerca de montañismo en Guatemala, que volcanes se pueden subir, como conseguir 
guías o apoyo, qué tan lejos de ciudad capital están, entre otra información útil. 

##Respuestas
Tus respuestas deben ser muy específicas, con detalles de ubicación, nombres de personas y empreas, 
números de teléfono y direcciones de sitios web.  Si no encuentras información de algo luego de
4 intentos de la persona, puedes referirla a algún sitio informativo como el INGUAT o similar. 
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
          // TODO - try another voice on for size
          voice: "shimmer",
          instructions,
          input_audio_transcription: {
            model: "whisper-1",
          },
          modalities: ["audio", "text"],
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
