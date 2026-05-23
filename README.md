# AI Powerd PDF Q&A  Application 🚀

A modern, production-ready **AI Chat Application** built with **Next.js** that supports intelligent conversations using **LLMs**, secure authentication, vector search, and scalable backend infrastructure.

This project is designed with **real-world engineering practices**, focusing on performance, scalability, and clean architecture.

---

## ✨ Features

- 🤖 AI-powered chat using **Google Gemini**
- 🧠 Context-aware responses with **LangChain**
- 📄 Vector search & semantic memory using **Qdrant**
- 🔐 Secure authentication & user management with **Clerk**
- 💾 Serverless Postgres with **Neon DB**
- 🧬 Type-safe database access using **Prisma**
- 🎨 Modern UI with **ShadCN UI**
- ⚡ App Router & Server Actions (Next.js)
- 📈 Scalable and production-ready architecture

---

## 🛠 Tech Stack

### Frontend
- **Next.js (App Router)**
- **TypeScript**
- **ShadCN UI**
- **Tailwind CSS**

### Backend / AI
- **LangChain**
- **Google Gemini (LLM)**
- **Qdrant (Vector Database)**

### Database & Auth
- **Neon DB (PostgreSQL)**
- **Prisma ORM**
- **Clerk Authentication**

---

## 🧠 Architecture Overview
Client (Next.js UI)
↓
Server Actions / API Routes
↓
LangChain (Prompt + Memory + Context)
↓
Gemini LLM
↓
Qdrant (Vector Search for Context)
↓
Neon DB (User & Chat Metadata via Prisma)

---

## 🗂 Project Structure
<!-- src/
├─ app/ # Next.js App Router
├─ components/ # UI Components (ShadCN)
├─ lib/
│ ├─ prisma.ts # Prisma Client
│ ├─ qdrant.ts # Vector DB config
│ ├─ langchain.ts # LLM & chain setup
│ └─ auth.ts # Clerk helpers
├─ actions/ # Server Actions
├─ types/ # Shared Types
└─ styles/ -->

```text
-src/
├─ app/                # Next.js App Router
├─ components/         # UI Components (ShadCN)
├─ lib/
│  ├─ prisma.ts        # Prisma Client
│  ├─ qdrant.ts        # Vector DB config
│  ├─ langchain.ts     # LLM & chain setup
│  └─ auth.ts          # Clerk helpers
├─ actions/            # Server Actions
├─ types/              # Shared Types
└─ styles/

---

## 🔐 Environment Variables

Create a `.env` file in the root:

env
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Gemini
GOOGLE_API_KEY=

# Qdrant
QDRANT_URL=
QDRANT_API_KEY=


🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2️⃣ Install Dependencies
npm install

3️⃣ Setup Database
npx prisma generate
npx prisma migrate dev

4️⃣ Run the App
npm run dev


App will be available at:
👉 http://localhost:3000

🧪 Key Engineering Decisions

LangChain is used to manage prompt chaining, memory, and context injection.

Qdrant enables semantic search instead of simple keyword matching.

Prisma + Neon ensures type safety and scalability.

Server Actions reduce API boilerplate and improve performance.

Clerk simplifies authentication without compromising security.

📌 Future Improvements

✅ Streaming responses

✅ Chat history summarization

⏳ Multi-document context injection

⏳ Rate limiting & analytics

⏳ Message feedback (👍 / 👎)

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Nishant Baiga
Software Engineer | Full-Stack | AI-Focused

Built with a focus on real-world engineering, not tutorials.




