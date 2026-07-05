# 📚 Socratic Paper Reviewer (B11)

An AI-powered web application that helps students critically read academic papers through **Socratic questioning** — instead of summarizing papers for you, it asks guided questions that push you to understand the methodology, results, and limitations yourself.

Built as a course project at ORT Braude College.

<!-- TODO: Add a screenshot or GIF of the app in action -->
![App Screenshot](docs/screenshot.png)

## ✨ Features

- **Interactive Socratic dialogue** — the AI bot guides you through a paper with targeted questions rather than giving away answers
- **PDF paper upload** — upload an academic paper and start a review session
- **RAG-powered context** — answers and questions are grounded in the actual paper content, not generic knowledge
- **Session history** — pick up your literature review where you left off
- **UX-tested** — evaluated with SUS and engagement questionnaires as part of the course research

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express |
| Database | MongoDB (Atlas) |
| AI / RAG | Gemini `text-embedding-004` embeddings + MongoDB Atlas Vector Search + `gemini-2.0-flash` |

## 🏗 Architecture

```
Client (React + TS + Vite)
        │  REST API
        ▼
Server (Express)
        │
        ├── MongoDB Atlas ── documents, sessions, users
        │        └── Vector Search (paper chunk embeddings)
        │
        └── Gemini API ── embeddings + chat completions
```

Key design decision: **all AI API calls happen server-side.** API keys never reach the browser — the Express server acts as a secure proxy between the client and the Gemini API.

**RAG pipeline:** uploaded papers are split into chunks → embedded with `text-embedding-004` → stored in MongoDB Atlas Vector Search. When the user interacts with the bot, relevant chunks are retrieved by semantic similarity and injected into the `gemini-2.0-flash` prompt, so responses stay grounded in the actual paper.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (with Vector Search enabled)
- Gemini API key

### Setup

```bash
# Clone the repo
git clone https://github.com/ShayGonen1/socratic-paper-reviewer.git
cd socratic-paper-reviewer

# Install and run the server
cd server
npm install
npm run dev

# In a second terminal — install and run the client
cd client
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=3000
```

> ⚠️ Never commit `.env` — it is already listed in `.gitignore`.

## 👥 Team

Developed by Shay Gonen and team as part of the Web Technologies course (Group B11), ORT Braude College.

## 📄 License

For academic and demonstration purposes.
