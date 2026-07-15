# 📚 Socratic Paper Reviewer (B11)

An AI-powered web application that helps students critically read academic papers through **Socratic questioning** — instead of summarizing papers for you, it asks guided questions that push you to understand the methodology, results, and limitations yourself.

Built as a course project at ORT Braude College.

<!-- TODO: Add a screenshot or GIF of the app in action -->
![App Screenshot](docs/screenshot.png)

## ✨ Features

- **Interactive Socratic dialogue** — the AI bot guides you through a paper with targeted questions rather than giving away answers
- **PDF paper upload** — upload an academic paper and start a review session, with parallel embedding and background ingestion for fast uploads
- **RAG-powered context** — answers and questions are grounded in the actual paper content, not generic knowledge
- **Saved guiding questions** — save your own guiding questions and have them offered again the next time you open a paper
- **Bilingual (English / Hebrew)** — full Hebrew (עברית) UI with a language switcher and RTL support; the AI also replies in Hebrew when Hebrew is selected
- **Hebrew paper translation** — on-demand, cached translation of paper content to Hebrew
- **Light & dark themes** — theme toggle with WCAG AA contrast across both modes
- **Lecturer / supervisor role** — a dedicated lecturer dashboard with course library management, student tracking, and comparison criteria & score rationale for submitted papers
- **Supervisor–student workflow** — students request a supervisor; supervisors approve/decline and manage their students
- **Uploader roles & badges** — papers show who uploaded them (student vs. lecturer)
- **User accounts** — authentication, password recovery, and profile management (Firebase + MongoDB)
- **Persistent preferences** — research field, citation format, and analysis depth are saved to your account
- **Session history** — pick up your literature review where you left off
- **UX-tested** — evaluated with SUS and engagement questionnaires as part of the course research

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, MUI + Radix UI, Tailwind/PostCSS |
| Backend | Node.js, Express (separate repo: [`weaamasad99/backend_web`](https://github.com/weaamasad99/backend_web)) |
| Auth | Firebase Authentication |
| Database | MongoDB (Atlas) |
| AI / RAG | Gemini `text-embedding-004` embeddings + MongoDB Atlas Vector Search + `gemini-2.0-flash` |
| Hardening | `express-rate-limit` on global and auth routes |

## 🏗 Architecture

```
Client (React + TS + Vite)      ← this repo (frontend)
        │  REST API (VITE_API_URL → :5000)
        ▼
Server (Express)                ← backend_web repo
        │
        ├── Firebase Auth ── sign-in, password recovery
        ├── MongoDB Atlas ── documents, sessions, users, preferences
        │        └── Vector Search (paper chunk embeddings)
        │
        └── Gemini API ── embeddings + chat completions + Hebrew translation
```

Key design decision: **all AI API calls happen server-side.** API keys never reach the browser — the Express server acts as a secure proxy between the client and the Gemini API. Analysis is authoritative on the server: lecturers receive computed charts/insights, while students receive a receipt only (chart data is not shipped to the client).

**RAG pipeline:** uploaded papers are split into chunks → embedded with `text-embedding-004` → stored in MongoDB Atlas Vector Search. When the user interacts with the bot, relevant chunks are retrieved by semantic similarity and injected into the `gemini-2.0-flash` prompt, so responses stay grounded in the actual paper.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (with Vector Search enabled)
- Firebase project (for authentication)
- Gemini API key

### Frontend (this repo)

```bash
git clone https://github.com/tomerhan/web-project.git
cd web-project
npm install
npm run dev
```

Configure the API base URL in `.env.local`:

```env
VITE_API_URL=http://localhost:5000
```

> Restart the dev server after changing env values — Vite reads env at startup.

### Backend

The Express server lives in a separate repository:

```bash
git clone https://github.com/weaamasad99/backend_web.git
cd backend_web
npm install
npm run dev
```

Create a `.env` file in the backend with:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

> ⚠️ Never commit `.env` / `.env.local` — they are already listed in `.gitignore`.

## 👥 Team

Developed as part of the Web Technologies course (Group B11), ORT Braude College:

- Oneil Abed — אוניל עבד
- Tomer Hananya — תומר חנניה
- Shay Gonen — שי גונן
- Ido Rotner — עידו רוטנר
- Weaam Asad — ויאם אסאד

## 📄 License

For academic and demonstration purposes.
