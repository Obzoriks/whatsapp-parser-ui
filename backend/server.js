import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
app.use(cors());
app.use("/files", express.static(path.join(process.cwd(), "files")));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("zipfile"), (req, res) => {
  const zipPath = req.file.path;
  const zip = new AdmZip(zipPath);

  const chatEntry = zip.getEntries().find(e => e.entryName.endsWith("_chat.txt"));
  if (!chatEntry) return res.status(400).json({ error: "_chat.txt not found in zip" });

  const chatContent = chatEntry.getData().toString("utf8");

  // Распаковываем все вложения
  if (!fs.existsSync("files")) fs.mkdirSync("files");
  zip.getEntries().forEach(entry => {
    if (!entry.isDirectory) {
      const filePath = path.join("files", path.basename(entry.entryName));
      fs.writeFileSync(filePath, entry.getData());
    }
  });

  // Парсим чат
  const messages = parseChat(chatContent);
  res.json({ messages });
});

// Парсер сообщений
function parseChat(text) {
  const regex = /\[(\d+\/\d+\/\d+), (\d+:\d+:\d+)\] (.+?): (.+)/g;
  const messages = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [_, date, time, author, content] = match;
    messages.push({ id: messages.length, date, time, author, content, processed: processAttachment(content) });
  }
  return messages;
}

// Обработка вложений
function processAttachment(content) {
  const attachRegex = /<attached: (.+?)>/;
  const match = attachRegex.exec(content);
  if (!match) return { type: "text", content };

  const fileName = match[1];
  const ext = path.extname(fileName).toLowerCase();

  if ([".jpg", ".jpeg", ".png", ".gif"].includes(ext)) return { type: "image", fileName };
  if ([".mp4", ".mov", ".webm"].includes(ext)) return { type: "video", fileName };
  return { type: "file", fileName };
}

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));
