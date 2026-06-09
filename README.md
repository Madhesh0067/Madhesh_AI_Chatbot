# madhesh AI - Professional Chatbot Web Application

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Madhesh0067/Madhesh_AI_Chatbot)

A premium, professional AI chatbot web application inspired by ChatGPT, Claude, and Gemini. Built with a React (Vite + Tailwind CSS) frontend and a Node.js (Express) backend powered by the Google Gemini API.

---

## 🌟 Key Features

### Frontend (React + Tailwind CSS)
- **Bot Persona**: Programmed as **madhesh** with custom bot-themed avatars.
- **Glassmorphic Design**: Modern transparent panels, backdrop blurs, indigo/purple gradients, and smooth slide-in animations.
- **Theme Switcher**: Fully functional Dark & Light mode toggle, persisted in local storage.
- **Sidebar Navigation**: Responsive sliding drawer containing a "New Chat" creator, filterable chat session search, inline double-click/pencil renaming, and trash deletes.
- **Markdown & Syntax Highlighting**: Complete markdown compatibility (headers, lists, tables, quotes) with code syntax highlights using Prism and the `vscDarkPlus` theme.
- **Timestamp Log**: Local time stamps appended to all conversation message elements.
- **Response Clipboard**: Clickable copy button to easily copy assistant solutions.
- **Welcome Board**: A welcome dashboard showing suggestion prompts (e.g. "Explain Quantum Computing") to get users started instantly.
- **Downloader**: Instant JSON chat logs export functionality.
- **Clear Actions**: Clean chat resets for specific logs or full database wipeouts from Settings.
- **Responsive Drawer Layout**: Cross-platform responsive grids fitting desktop monitors, tablets, and phones.

### Backend (Node.js + Express)
- **AI Integrator**: Connects natively to Google's `@google/generative-ai` SDK using the high-speed `gemini-1.5-flash` model.
- **Document Extractors**: Includes in-memory multi-part uploading utilizing Multer:
  - **PDF Parser**: `pdf-parse` for text extraction.
  - **Word Doc Parser**: `mammoth` for DOCX files.
  - **Text Parser**: UTF-8 string converters.
- **Security Rate-Limiter**: Implements `express-rate-limit` to prevent denial-of-service or bot abuses (caps at 100 requests per 15 minutes per IP).
- **Dotenv Config**: Standard environment controls.

---

## 📂 Project Structure

```
ai-chatbot-app/
├── backend/
│   ├── uploads/            # Multer upload files directory
│   ├── .env                # App environment keys (API keys, ports)
│   ├── .env.example        # Environment settings sample
│   ├── package.json        # Backend dependencies
│   └── server.js           # Express app & Gemini connection routes
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── Avatar.jsx            # User/AI avatar indicators
│   │   │   ├── ChatInterface.jsx     # Chat screen panels & welcome dashboard
│   │   │   ├── MessageItem.jsx       # Chat bubbles, copy, code syntax highlight
│   │   │   ├── SettingsModal.jsx     # Dark mode & clear history modal
│   │   │   ├── Sidebar.jsx           # Search panel & list of history sessions
│   │   │   └── Toast.jsx             # Alert notification banners
│   │   ├── App.jsx         # App context and core states
│   │   ├── index.css       # Tailwind directives & glassmorphic themes
│   │   └── main.jsx        # App mounting configuration
│   ├── package.json        # Frontend dependencies
│   ├── tailwind.config.js  # Styling templates configuration
│   ├── postcss.config.js   # Style processor rules
│   └── vite.config.js      # Vite dev settings (port 3000)
├── package.json            # Root runner (runs front/back concurrently)
└── README.md               # User documentation
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher is recommended)
- npm (v9 or higher)

### 1. Backend Key Configuration
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Set your Google Gemini API key inside `.env`:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 2. Automatic Install & Execution (Recommended)
You can orchestrate both folders from the project's root folder:
1. Open a terminal at the project root `ai-chatbot-app/`.
2. Run the bulk install command:
   ```bash
   npm run install-all
   ```
3. Boot up both servers together:
   ```bash
   npm start
   ```
   *This uses `concurrently` to launch the Express API server on `http://localhost:5000` and the React frontend on `http://localhost:3000` simultaneously.*

### 3. Manual Installation (Alternative)
If you prefer running them in separate terminals:

**Express API Server:**
```bash
cd backend
npm install
npm start
```
*API will run at `http://localhost:5000`*

**Vite Frontend Dev Client:**
```bash
cd frontend
npm install
npm run dev
```
*App will open at `http://localhost:3000`*

---

## 🧪 Testing and Verifications
- **Chat**: Type prompts in the chat box and receive detailed markdown responses from **madhesh**.
- **Attachment Check**: Use the paperclip button to attach a PDF, DOCX, or TXT file. The bot will automatically use the parsed content to address your queries.
- **Historical Switch**: Create multiple sessions in the sidebar. Click to switch, double-click to rename them, and click the bin icon to remove individual logs.
- **Theme switch**: Open Settings, toggle between Light and Dark visual aesthetics.
