<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
  <img src="https://img.shields.io/badge/Gemini_AI-Free-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI"/>
</p>

# 🤖 Instagram AI Clone

A full-stack Instagram clone powered by AI — featuring personalized feed ranking, AI content moderation, smart caption generation, semantic search, and real-time chat. Built with **Next.js 14**, **FastAPI**, **PostgreSQL**, **Qdrant**, and **Google Gemini AI**.

> **100% Free-Tier Compatible** — Every API and service used has a free tier. Zero cost to run.

---

## ✨ Features

### 🏠 Core Social Features
- **Home Feed** — Scrollable post feed with like, comment, save, and share actions
- **Stories** — View and create ephemeral stories with auto-progress timers
- **Post Creation** — Upload images with captions, tags, and location
- **User Profiles** — View post grids, follower counts, and bio
- **Explore Page** — Discover content through semantic vector search
- **Direct Messages** — Real-time chat with AI-powered bot conversations
- **Follow/Unfollow** — Social graph with follower relationship tracking

### 🤖 AI-Powered Features
- **Personalized Feed Ranking** — Posts scored by follow proximity, engagement, and interest matching
- **Content Moderation** — Real-time toxicity detection using Google Gemini AI (NSFW, violence, harassment)
- **Smart Caption Ideas** — AI-generated caption suggestions based on image description
- **Semantic Embeddings** — 384-dimensional text embeddings via Hugging Face for recommendation relevance
- **AI Chat Bot** — Simulated AI assistant in the messages tab

### 🎨 Premium UI/UX
- **Dark Mode** — Sleek dark theme with glassmorphism effects
- **Framer Motion** — Smooth page transitions and micro-animations
- **Responsive Layout** — Mobile-first design with adaptive navigation
- **Tailwind CSS** — Utility-first styling with custom design tokens

---

## 🏗️ Architecture

```
instagram-ai-clone/
├── backend/                    # FastAPI Python Backend
│   ├── alembic/                # Database migration scripts
│   ├── app/
│   │   ├── api/v1/             # REST API endpoints
│   │   │   ├── auth.py         # JWT authentication (register/login)
│   │   │   ├── posts.py        # Feed, likes, comments, saves
│   │   │   ├── stories.py      # Story creation & viewing
│   │   │   ├── chats.py        # Direct messaging
│   │   │   ├── explore.py      # Semantic search & discovery
│   │   │   └── users.py        # Profile management & follows
│   │   ├── core/               # Config, DB engine, JWT security
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── repositories/       # Data access layer (Repository Pattern)
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/           # AI service & S3 storage integrations
│   │   ├── tests/              # Pytest async test suite
│   │   └── seed_db.py          # Database seeding script
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/                   # Next.js 14 React Frontend
│   ├── src/
│   │   ├── app/                # App Router pages & layouts
│   │   ├── components/         # Reusable UI components
│   │   └── services/           # API client with JWT interceptor
│   ├── package.json
│   └── tailwind.config.ts
└── docker-compose.yml          # Dev infrastructure (Postgres, Redis, Qdrant, MinIO)
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript | App Router, SSR, client components |
| **Styling** | Tailwind CSS, Framer Motion | Responsive design & animations |
| **Backend** | FastAPI, Python 3.11 | Async REST API with dependency injection |
| **Database** | PostgreSQL 16, SQLAlchemy 2.0 | Relational data with async ORM |
| **Vector DB** | Qdrant | Semantic search & recommendation engine |
| **Cache** | Redis | Chat messages & session storage |
| **Storage** | MinIO / Cloudflare R2 | S3-compatible media file uploads |
| **AI - Moderation** | Google Gemini 1.5 Flash | Content safety & caption generation |
| **AI - Embeddings** | Hugging Face (all-MiniLM-L6-v2) | 384-dim text embeddings |
| **Auth** | JWT (HS256) + bcrypt | Secure token-based authentication |
| **Testing** | Pytest + aiosqlite | In-memory async integration tests |
| **Migrations** | Alembic | Database schema versioning |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (running locally or via Docker)

### 1. Clone the Repository
```bash
git clone https://github.com/musi22/instagram-ai-clone.git
cd instagram-ai-clone
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
GEMINI_API_KEY=your_gemini_api_key_here
HF_TOKEN=your_hugging_face_token_here
EOF

# Initialize the database
python -m app.create_db

# Run migrations
alembic upgrade head

# Seed sample data
python -m app.seed_db

# Start the backend server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### 4. Open the App
Navigate to **http://localhost:3000** in your browser.

---

## 🔑 Free API Keys Setup

All AI features work with **100% free** API keys:

| Service | Free Tier | How to Get |
|---------|-----------|------------|
| **Google Gemini AI** | 15 RPM / 1M TPM | [Google AI Studio](https://aistudio.google.com/) → Create API Key |
| **Hugging Face** | Generous free tier | [HF Settings](https://huggingface.co/settings/tokens) → New Token (Read) |

> **Note:** The app works without API keys — it falls back to rule-based moderation and deterministic embeddings.

---

## 🧪 Running Tests

```bash
cd backend
python -m pytest app/tests/ -v
```

Expected output:
```
app/tests/test_auth.py::test_register_user PASSED
app/tests/test_auth.py::test_register_existing_username PASSED
app/tests/test_auth.py::test_login_success PASSED
app/tests/test_auth.py::test_login_invalid_credentials PASSED
app/tests/test_posts.py::test_create_post_success PASSED
app/tests/test_posts.py::test_get_feed_empty PASSED
app/tests/test_posts.py::test_toggle_like_not_found PASSED
======================= 7 passed in 3.5s ========================
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user |
| `POST` | `/api/v1/auth/login` | Login (returns JWT tokens) |

### Posts & Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/posts/` | Get personalized feed |
| `POST` | `/api/v1/posts/` | Create a new post |
| `POST` | `/api/v1/posts/{id}/like` | Toggle like on a post |
| `POST` | `/api/v1/posts/{id}/save` | Toggle save on a post |
| `POST` | `/api/v1/posts/{id}/comments` | Add a comment |

### Stories
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/stories/` | Get all active stories |
| `POST` | `/api/v1/stories/` | Create a story |
| `POST` | `/api/v1/stories/{id}/view` | Mark story as viewed |

### Chat & Messaging
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/chats/` | Get all chat threads |
| `POST` | `/api/v1/chats/{id}/messages` | Send a message |

### Explore & Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/explore/` | Explore feed with semantic search |

---

## ☁️ Deployment (100% Free Tier)

| Service | Provider | Free Tier |
|---------|----------|-----------|
| **Frontend** | [Vercel](https://vercel.com) | Unlimited hobby projects |
| **Backend** | [Render](https://render.com) | 750 hrs/month free |
| **Database** | [Neon](https://neon.tech) | 0.5 GiB PostgreSQL |
| **Vector DB** | [Qdrant Cloud](https://cloud.qdrant.io) | 1 GB free cluster |
| **Cache** | [Upstash](https://upstash.com) | 10K requests/day Redis |
| **Storage** | [Cloudflare R2](https://cloudflare.com) | 10 GB + free egress |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using Next.js, FastAPI, and Google Gemini AI
</p>
