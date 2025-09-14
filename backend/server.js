import express from "express";
import multer from "multer";
import AdmZip from "adm-zip";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static file serving with better caching
app.use("/files", express.static(path.join(process.cwd(), "files"), {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Enhanced multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.originalname.endsWith('.zip')) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'), false);
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Enhanced upload endpoint with better error handling
app.post("/upload", upload.single("zipfile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: "No file uploaded",
        details: "Please select a ZIP file to upload"
      });
    }

    const zipPath = req.file.path;
    console.log(`Processing ZIP file: ${zipPath}`);

    let zip;
    try {
      zip = new AdmZip(zipPath);
    } catch (error) {
      console.error('Error reading ZIP file:', error);
      return res.status(400).json({ 
        error: "Invalid ZIP file",
        details: "The uploaded file is not a valid ZIP archive"
      });
    }

    // Find chat file with multiple possible names
    const chatEntry = zip.getEntries().find(entry => 
      entry.entryName.includes('_chat.txt') || 
      entry.entryName.includes('WhatsApp Chat') ||
      entry.entryName.endsWith('.txt')
    );

    if (!chatEntry) {
      return res.status(400).json({ 
        error: "Chat file not found",
        details: "No WhatsApp chat file (_chat.txt) found in the ZIP archive"
      });
    }

    let chatContent;
    try {
      chatContent = chatEntry.getData().toString("utf8");
    } catch (error) {
      console.error('Error reading chat content:', error);
      return res.status(400).json({ 
        error: "Error reading chat file",
        details: "Unable to read the chat file content"
      });
    }

    // Ensure files directory exists
    const filesDir = path.join(process.cwd(), "files");
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir, { recursive: true });
    }

    // Extract all attachments with better error handling
    let extractedFiles = 0;
    const entries = zip.getEntries();
    
    for (const entry of entries) {
      if (!entry.isDirectory && !entry.entryName.includes('_chat.txt')) {
        try {
          const fileName = path.basename(entry.entryName);
          const filePath = path.join(filesDir, fileName);
          
          // Avoid overwriting existing files
          let finalPath = filePath;
          let counter = 1;
          while (fs.existsSync(finalPath)) {
            const ext = path.extname(fileName);
            const name = path.basename(fileName, ext);
            finalPath = path.join(filesDir, `${name}_${counter}${ext}`);
            counter++;
          }
          
          fs.writeFileSync(finalPath, entry.getData());
          extractedFiles++;
        } catch (error) {
          console.error(`Error extracting file ${entry.entryName}:`, error);
          // Continue with other files
        }
      }
    }

    // Parse chat with enhanced error handling
    let messages;
    try {
      messages = parseChat(chatContent);
    } catch (error) {
      console.error('Error parsing chat:', error);
      return res.status(400).json({ 
        error: "Error parsing chat",
        details: "Unable to parse the chat file format"
      });
    }

    // Clean up uploaded ZIP file
    try {
      fs.unlinkSync(zipPath);
    } catch (error) {
      console.error('Error cleaning up ZIP file:', error);
      // Non-critical error, continue
    }

    console.log(`Successfully processed ${messages.length} messages and ${extractedFiles} files`);

    res.json({ 
      messages,
      stats: {
        totalMessages: messages.length,
        extractedFiles,
        chatFileName: chatEntry.entryName
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({ 
      error: "Internal server error",
      details: error.message
    });
  }
});

// Enhanced chat parser with better regex and error handling
function parseChat(text) {
  // Multiple regex patterns to handle different WhatsApp export formats
  const patterns = [
    // Standard format: [DD/MM/YY, HH:MM:SS] Author: Message
    /\[(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]\s+(.+?):\s+([\s\S]*?)(?=\n\[|\n$|$)/g,
    // Alternative format: DD/MM/YY, HH:MM - Author: Message
    /(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s+-\s+(.+?):\s+([\s\S]*?)(?=\n\d|\n$|$)/g,
    // Another format: DD.MM.YY, HH:MM - Author: Message
    /(\d{1,2}\.\d{1,2}\.\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\s+-\s+(.+?):\s+([\s\S]*?)(?=\n\d|\n$|$)/g
  ];

  const messages = [];
  let messageId = 0;

  for (const regex of patterns) {
    let match;
    const tempMessages = [];
    
    while ((match = regex.exec(text)) !== null) {
      const [_, date, time, author, content] = match;
      
      // Skip system messages
      if (content.includes('Messages and calls are end-to-end encrypted') ||
          content.includes('This message was deleted') ||
          author.includes('WhatsApp')) {
        continue;
      }

      tempMessages.push({
        id: messageId++,
        date: date.replace(/\./g, '/'), // Normalize date format
        time: time,
        author: author.trim(),
        content: content.trim(),
        processed: processAttachment(content.trim())
      });
    }

    // Use the pattern that found the most messages
    if (tempMessages.length > messages.length) {
      messages.length = 0;
      messages.push(...tempMessages);
      messageId = tempMessages.length;
    }

    // Reset regex
    regex.lastIndex = 0;
  }

  // Sort messages by date and time
  messages.sort((a, b) => {
    try {
      const dateA = parseDate(a.date, a.time);
      const dateB = parseDate(b.date, b.time);
      return dateA - dateB;
    } catch {
      return 0;
    }
  });

  // Reassign IDs after sorting
  messages.forEach((msg, index) => {
    msg.id = index;
  });

  return messages;
}

// Helper function to parse dates
function parseDate(dateStr, timeStr) {
  try {
    const [day, month, year] = dateStr.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    const [hours, minutes] = timeStr.split(':');
    return new Date(fullYear, month - 1, day, hours, minutes);
  } catch {
    return new Date();
  }
}

// Enhanced attachment processor
function processAttachment(content) {
  // Handle different attachment formats
  const attachmentPatterns = [
    /<attached:\s*(.+?)>/i,
    /\(file attached\)/i,
    /\(image omitted\)/i,
    /\(video omitted\)/i,
    /\(document omitted\)/i,
    /\(audio omitted\)/i,
    /\(sticker omitted\)/i,
    /\(GIF omitted\)/i
  ];

  for (const pattern of attachmentPatterns) {
    const match = pattern.exec(content);
    if (match) {
      if (match[1]) {
        // Has filename
        const fileName = match[1].trim();
        return categorizeFile(fileName);
      } else {
        // Generic attachment
        if (content.includes('image')) return { type: "image", fileName: "image_omitted" };
        if (content.includes('video')) return { type: "video", fileName: "video_omitted" };
        if (content.includes('audio')) return { type: "file", fileName: "audio_omitted" };
        if (content.includes('document')) return { type: "file", fileName: "document_omitted" };
        if (content.includes('sticker')) return { type: "image", fileName: "sticker_omitted" };
        if (content.includes('GIF')) return { type: "image", fileName: "gif_omitted" };
        return { type: "file", fileName: "file_omitted" };
      }
    }
  }

  return { type: "text", content };
}

// Enhanced file categorization
function categorizeFile(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff'];
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.3gp'];
  const audioExts = ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a', '.wma'];
  const documentExts = ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'];
  const archiveExts = ['.zip', '.rar', '.7z', '.tar', '.gz'];
  const codeExts = ['.js', '.html', '.css', '.py', '.java', '.cpp', '.c', '.php'];

  if (imageExts.includes(ext)) {
    return { type: "image", fileName };
  } else if (videoExts.includes(ext)) {
    return { type: "video", fileName };
  } else if (audioExts.includes(ext) || documentExts.includes(ext) || 
             archiveExts.includes(ext) || codeExts.includes(ext)) {
    return { type: "file", fileName };
  } else {
    return { type: "file", fileName };
  }
}

// File info endpoint
app.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'files', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  const stats = fs.statSync(filePath);
  const ext = path.extname(filename).toLowerCase();
  
  res.json({
    filename,
    size: stats.size,
    modified: stats.mtime,
    type: categorizeFile(filename).type,
    extension: ext
  });
});

// List all files endpoint
app.get('/files', (req, res) => {
  const filesDir = path.join(process.cwd(), 'files');
  
  if (!fs.existsSync(filesDir)) {
    return res.json({ files: [] });
  }

  try {
    const files = fs.readdirSync(filesDir).map(filename => {
      const filePath = path.join(filesDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        size: stats.size,
        modified: stats.mtime,
        type: categorizeFile(filename).type
      };
    });

    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Error listing files' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        details: 'Maximum file size is 100MB'
      });
    }
    return res.status(400).json({ 
      error: 'Upload error',
      details: error.message
    });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    details: error.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    details: `Route ${req.method} ${req.path} not found`
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Files served from: ${path.join(process.cwd(), 'files')}`);
  console.log(`📤 Upload directory: ${path.join(process.cwd(), 'uploads')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});