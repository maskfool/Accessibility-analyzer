# ♿ Accessibility Analyzer 🔍

A full-stack web app that audits the accessibility of any public URL using **axe-core**, **Puppeteer**, and **OpenAI GPT-4o**, and provides both a **score** and **AI-generated fix suggestions** for detected issues.

Live Demo: [https://accessibility-analyzer.vercel.app](https://accessibility-analyzer.vercel.app)

---

## ✨ Features

- 🔗 Enter any live website URL
- ♿ Automatically detects accessibility issues using axe-core
- 🧠 AI suggestions (via OpenAI) on how to fix each issue
- 📊 Calculates a custom accessibility score
- ⚡ Fast and simple UI built with React + Tailwind CSS
- 🌐 Production-ready setup (Vercel + Railway)

---

## 🛠️ Tech Stack

### Frontend
- **React + Vite**
- **Tailwind CSS**
- Hosted on **Vercel**

### Backend
- **Node.js + Express**
- **Puppeteer + axe-core** for accessibility scan
- **OpenAI GPT-4o** for fix recommendations
- Hosted on **Railway**

---

# 1. Clone the repository
git clone https://github.com/maskfool/Accessibility-analyzer.git
cd Accessibility-analyzer

# 2. Install frontend dependencies and start Vite dev server
npm install
npm run dev

# 3. In a new terminal, go to the backend folder
cd server

# 4. Install backend dependencies
npm install

# 5. Create a .env file and add your OpenAI API key
echo "OPENAI_API_KEY=your-openai-key-here" > .env

# 6. Start the backend server
npm start

