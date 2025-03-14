import fs from "fs";
import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI();
let vector_store_id = process.env.VECTOR_STORE_ID;

if (!vector_store_id) {
  const vector_store = await client.vectorStores.create({
    name: "Realtime docs",
  });
  vector_store_id = vector_store.id;

  try {
    let envContent = "";
    if (fs.existsSync(".env")) {
      envContent = fs.readFileSync(".env", "utf8");
    }

    if (envContent && !envContent.endsWith("\n")) {
      envContent += "\n";
    }

    envContent += `VECTOR_STORE_ID=${vector_store.id}\n`;
    fs.writeFileSync(".env", envContent, "utf8");
  } catch (error) {
    console.error("Error updating .env file:", error);
  }
}

const docsFolder = "docs";
const files = fs.readdirSync(docsFolder);
const pdfFiles = files.filter((file) => file.toLowerCase().endsWith(".pdf"));

for (const pdfFile of pdfFiles) {
  console.log(`Uploading ${pdfFile} to vector store...`);

  const file = await client.files.create({
    file: fs.createReadStream(`./${docsFolder}/${pdfFile}`),
    purpose: "user_data",
  });

  const vsFile = await client.vectorStores.files.create(vector_store_id, {
    file_id: file.id,
  });
  console.log("Vector store file created:", vsFile.id);
}
