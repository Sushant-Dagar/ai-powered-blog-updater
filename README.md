# BeyondChats Article Enhancement Platform

A full-stack application that scrapes articles from BeyondChats blog, enhances them using AI, and displays both original and enhanced versions.

### [Live Demo](https://ai-powered-blog-updater.vercel.app) | [API](https://ai-powered-blog-updater.onrender.com/api/articles)

## Project Overview

This project consists of three main components:

1. **Laravel Backend** - REST API for article management
2. **Node.js Article Enhancer** - Script that uses Google search and LLM to enhance articles
3. **React Frontend** - Responsive UI for viewing articles

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BEYONDCHATS ARTICLE PLATFORM                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄───────►│  Laravel API    │◄───────►│  SQLite DB      │
│  (Vite + React) │  HTTP   │  (PHP 8.3)      │         │                 │
│                 │         │                 │         │                 │
└─────────────────┘         └────────▲────────┘         └─────────────────┘
                                     │
                                     │ HTTP
                                     │
                            ┌────────▼────────┐
                            │                 │
                            │  Node.js Script │
                            │  (Enhancer)     │
                            │                 │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
            ┌───────────┐    ┌───────────┐    ┌───────────┐
            │  Google   │    │  External │    │  OpenAI   │
            │  Search   │    │  Websites │    │  API      │
            └───────────┘    └───────────┘    └───────────┘
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW DIAGRAM                               │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 1: Article Scraping & Storage
─────────────────────────────────────
BeyondChats Blog ──► Scraper ──► Laravel API ──► SQLite Database

Phase 2: Article Enhancement
─────────────────────────────
┌────────────────────────────────────────────────────────────────────────────┐
│ Node.js Enhancer Script                                                     │
│                                                                            │
│  1. Fetch articles from API                                                │
│  2. For each article:                                                      │
│     └─► Search Google with article title                                   │
│         └─► Scrape top 2 blog/article results                              │
│             └─► Send to OpenAI for enhancement                             │
│                 └─► Post enhanced article back to API                      │
└────────────────────────────────────────────────────────────────────────────┘

Phase 3: Display
────────────────
React Frontend ◄──── API ◄──── Database
     │
     └──► Shows original & enhanced versions
           with references
```

## Quick Start (Windows PowerShell)

### Option 1: Start Both Servers at Once
```powershell
# From the project root directory
.\start-all.ps1
```
This will open two PowerShell windows - one for the backend and one for the frontend.

### Option 2: Start Servers Individually
```powershell
# Terminal 1 - Backend
.\start-backend.ps1

# Terminal 2 - Frontend
.\start-frontend.ps1
```

### Access the Application
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/articles

## Local Setup Instructions

### Prerequisites

- **Windows:** PHP 8.3 (install via `winget install PHP.PHP.8.3`)
- **Node.js:** 18+ (download from nodejs.org)
- **npm:** Comes with Node.js

### 1. Backend Setup (Laravel)

```powershell
# Navigate to backend directory
cd backend

# Install PHP dependencies (run from project root)
php ..\composer.phar install

# Generate application key
php artisan key:generate

# Run migrations and seed database
php artisan migrate --seed --seeder=ArticleSeeder

# Start the development server
php artisan serve --host=127.0.0.1 --port=8000
```

The API will be available at `http://localhost:8000/api`

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/articles` | List all articles (optional: `?enhanced=true/false`) |
| GET | `/api/articles/{id}` | Get single article |
| POST | `/api/articles` | Create new article |
| PUT | `/api/articles/{id}` | Update article |
| DELETE | `/api/articles/{id}` | Delete article |
| PUT | `/api/articles/{id}/enhance` | Add enhanced content to article |

### 2. Article Enhancer Setup (Node.js)

```powershell
# Navigate to enhancer directory
cd article-enhancer

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env and add your OpenAI API key
notepad .env

# Run the enhancement script (backend must be running)
npm run enhance
```

**Note:** The enhancer requires:
- Laravel backend running at the specified API_BASE_URL
- Valid OpenAI API key with access to GPT-4o-mini

### 3. Frontend Setup (React)

```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Building for Production

**Frontend:**
```powershell
cd frontend
npm run build
# Output in dist/ folder
```

## Project Structure

```
BeyondChats/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   │   └── ArticleController.php
│   │   └── Models/
│   │       └── Article.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       └── ArticleSeeder.php
│   └── routes/
│       └── api.php
│
├── article-enhancer/           # Node.js Enhancement Script
│   ├── index.js
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ArticleList.jsx
│   │   │   ├── ArticleCard.jsx
│   │   │   └── ArticleDetail.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   └── .env.example
│
├── start-all.ps1               # Start both servers
├── start-backend.ps1           # Start Laravel server
├── start-frontend.ps1          # Start React server
├── composer.phar               # PHP Composer
└── README.md
```

## Features

### Backend (Laravel)
- RESTful API for article CRUD operations
- SQLite database for easy setup
- CORS support for frontend integration
- Article enhancement endpoint
- Database seeder with 5 oldest BeyondChats articles

### Article Enhancer (Node.js)
- Fetches non-enhanced articles from API
- Searches Google for related content
- Scrapes top 2 blog/article results
- Uses OpenAI GPT-4o-mini to enhance articles
- Posts enhanced content back to API
- Stores reference URLs for citations

### Frontend (React)
- Responsive, professional UI
- Article listing with filter options (All/Enhanced/Original)
- Article detail view with tabs for original/enhanced content
- Reference citations for enhanced articles
- Loading states and error handling

## Technologies Used

- **Backend:** Laravel 11, PHP 8.3, SQLite
- **Enhancer:** Node.js, Axios, Cheerio, OpenAI API
- **Frontend:** React 18, Vite 5, React Router, Axios

## Live Demo

**Frontend:** https://ai-powered-blog-updater.vercel.app

**Backend API:** https://ai-powered-blog-updater.onrender.com/api

### Deployment Options

**Frontend (React) - Free hosting:**
- [Vercel](https://vercel.com) - Connect GitHub repo, auto-deploys
- [Netlify](https://netlify.com) - Drag & drop `dist/` folder or connect repo

**Backend (Laravel) - Free/Low-cost hosting:**
- [Railway](https://railway.app) - Easy Laravel deployment
- [Render](https://render.com) - Free tier available
- [Fly.io](https://fly.io) - Free tier with PHP support

### Quick Deploy to Vercel (Frontend)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
npm run build
vercel --prod
```

**Important:** After deploying the backend, update `frontend/.env` with your production API URL before deploying the frontend.

## License

This project is created for the BeyondChats assessment.
