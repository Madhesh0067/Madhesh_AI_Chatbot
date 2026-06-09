import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { rateLimit } from 'express-rate-limit';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting to secure the endpoint
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure Multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/webp'
    ];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.txt') || file.originalname.endsWith('.pdf') || file.originalname.endsWith('.docx') || file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Supported types: PDF, DOCX, TXT, PNG, JPEG, WEBP.'));
    }
  }
});

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('CRITICAL: GEMINI_API_KEY is not defined in the environment variables.');
}
const genAI = new GoogleGenerativeAI(apiKey || '');

// Route: Parse uploaded files
app.post(['/api/upload', '/upload'], upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype } = req.file;
    let textContent = '';

    let base64Data = null;
    let isImage = false;

    if (mimetype.startsWith('image/')) {
      isImage = true;
      base64Data = buffer.toString('base64');
    } else if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      const parsedPdf = await pdfParse(buffer);
      textContent = parsedPdf.text;
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
      originalname.endsWith('.docx')
    ) {
      const parsedDoc = await mammoth.extractRawText({ buffer });
      textContent = parsedDoc.value;
    } else {
      // Treat as plain text
      textContent = buffer.toString('utf-8');
    }

    if (!isImage && (!textContent || textContent.trim() === '')) {
      return res.status(400).json({ error: 'Failed to extract text. The file might be empty or scanned.' });
    }

    // Truncate if extremely large to prevent model token overflow (max ~80k characters, about 20k tokens)
    const maxLength = 80000;
    let isTruncated = false;
    if (!isImage && textContent.length > maxLength) {
      textContent = textContent.substring(0, maxLength);
      isTruncated = true;
    }

    res.json({
      fileName: originalname,
      textContent: textContent,
      isTruncated,
      charCount: isImage ? 0 : textContent.length,
      isImage,
      mimetype,
      base64Data
    });
  } catch (error) {
    console.error('File extraction error:', error);
    res.status(500).json({ error: `File processing failed: ${error.message}` });
  }
});

// Route: Handle chat interactions
app.post(['/api/chat', '/chat'], chatLimiter, async (req, res) => {
  try {
    const { messages, currentMessage, fileContext } = req.body;

    if (!currentMessage) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'Gemini API key is missing on the server. Please check your .env configuration.' });
    }

    // Initialize the model with system instruction naming the bot "madhesh"
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: 'Your name is madhesh. You are a professional, highly intelligent, friendly, and helpful AI assistant. Always refer to yourself as "madhesh". When asked who you are or what your name is, state clearly that your name is "madhesh". Answer questions with markdown, organize code in syntax-highlighted blocks, and maintain a premium, clean structure. If the user provides a document (file upload) context, analyze it thoroughly and answer the user question based on that context.'
    });

    // Format chat history for Gemini API
    // Gemini history format is: [ { role: 'user' | 'model', parts: [ { text: string } ] } ]
    const chatHistory = [];
    
    // Construct past history
    if (messages && Array.isArray(messages)) {
      for (const msg of messages) {
        // Exclude system instructions or errors from history
        if (msg.role === 'user' || msg.role === 'model' || msg.role === 'assistant') {
          const role = msg.role === 'assistant' ? 'model' : msg.role;
          chatHistory.push({
            role: role,
            parts: [{ text: msg.content }]
          });
        }
      }
    }

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      }
    });

    // Format the current message. If a file is uploaded, inject it as context
    let promptParts = [currentMessage];
    
    if (fileContext) {
      if (fileContext.isImage && fileContext.base64Data && fileContext.mimetype) {
        promptParts = [
          {
            inlineData: {
              data: fileContext.base64Data,
              mimeType: fileContext.mimetype
            }
          },
          currentMessage
        ];
      } else if (fileContext.name && fileContext.content) {
        const textPrompt = `[ATTACHED FILE CONTEXT]\nFile Name: ${fileContext.name}\nFile Content:\n---\n${fileContext.content}\n---\n\nUser Query:\n${currentMessage}`;
        promptParts = [textPrompt];
      }
    }

    // Call Gemini API
    const result = await chat.sendMessage(promptParts);
    const responseText = result.response.text();

    res.json({
      role: 'model',
      content: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ 
      error: `Gemini API Error: ${error.message || 'An unexpected error occurred.'}` 
    });
  }
});

// Standard status check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'healthy', bot: 'madhesh', time: new Date().toISOString() });
});

// Resolve directory paths in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React frontend build folder if it exists (e.g. locally or monolithic deploys)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // Fallback all other routes to index.html for React SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Start listening
app.listen(PORT, () => {
  console.log(`[madhesh-backend] Server is running on port ${PORT}`);
});
