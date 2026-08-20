<div align="center">

# 🚀 AI-Powered Job Portal

### *Where Talent Meets Opportunity, Enhanced by Intelligence*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?logo=socket.io&badgeColor=010101)](https://socket.io/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59)](https://expressjs.com/)

[Features](#-features) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Documentation](#-documentation) • [Contributing](#-future-work--collaboration)

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [💻 Tech Stack](#-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🔧 Configuration](#-configuration)
- [📡 API Reference](#-api-reference)
- [🔌 WebSocket Events](#-websocket-events)
- [📊 Data Models](#-data-models)
- [🧪 Testing](#-testing)
- [🐛 Troubleshooting](#-troubleshooting)
- [🤝 Future Work & Collaboration](#-future-work--collaboration)

---

## 🌟 Overview

A **next-generation job portal** that bridges the gap between job seekers and employers with cutting-edge AI capabilities. Built with modern web technologies and powered by artificial intelligence, this platform revolutionizes the job search and recruitment process.

### 🎯 Key Highlights

```mermaid
graph LR
    A[👤 Job Seekers] -->|Apply| B[🤖 AI Portal]
    C[🏢 Employers] -->|Post Jobs| B
    B -->|Search & Filter| D[🔍 Smart Search]
    B -->|Real-time| E[💬 Direct Chat]
    D -->|Browse Jobs| A
    D -->|Find Candidates| C
    B -->|AI Insights| A
    B -->|Quality Applications| C
    A <-->|Message| E
    E <-->|Message| C
```

<div align="center">

| For Job Seekers | For Employers | AI Features |
|:---------------:|:-------------:|:-----------:|
| 🔍 Advanced Search & Filters | 📝 Easy Posting | 🧠 Resume Analysis |
| 📄 Profile Builder | 📊 Analytics | ✍️ Cover Letter Gen |
| 💬 Real-time Chat | 👥 Applicant Management | 🎯 Interview Prep |
| 🎓 Skill Tracking | 🔔 Notifications | 💡 Smart Insights |

</div>

---

## ✨ Features

### 👨‍💼 For Job Seekers

<details open>
<summary><b>Click to expand/collapse</b></summary>

- **🔐 Authentication & Profile**
  - Email/password registration and login
  - 🌐 Google OAuth integration
  - Comprehensive profile management (avatar, skills, education, certifications)
  
- **🔍 Job Discovery**
  - Advanced search with multiple filters
  - Category-based browsing
  - Real-time job updates
  - Bookmark favorite positions
  
- **📝 Application Management**
  - One-click apply with cover letter
  - Resume upload and management
  - Track application status in real-time
  - Withdraw applications if needed
  
- **💬 Communication**
  - Real-time messaging with employers
  - Direct chat with hiring managers
  - Typing indicators
  - Unread message notifications
  - Message threading
  
- **🤖 AI-Powered Tools**
  - **Resume Analysis**: Get instant feedback on your resume
  - **Cover Letter Generator**: AI-crafted personalized cover letters
  - **Interview Practice**: Practice with AI-generated questions
  - **Answer Evaluation**: Get scored on your interview responses
  
- **🎓 Experience Sharing**
  - Read anonymous interview experiences
  - Share your own interview journey
  - Rate and review interview processes
  - Helpful tips from the community

</details>

### 🏢 For Employers

<details open>
<summary><b>Click to expand/collapse</b></summary>

- **📋 Job Management**
  - Create and publish job listings
  - Edit and update postings
  - Track application counts
  - Set custom application questions
  
- **👥 Candidate Review**
  - View all applicants for each position
  - Filter and search candidates
  - Review resumes and cover letters
  - Update application statuses
  
- **📊 Analytics**
  - Track job views
  - Monitor application metrics
  - Candidate pipeline visualization
  
- **💬 Engagement**
  - Direct messaging with job seekers
  - Real-time communication with candidates
  - Interview coordination
  - Professional networking

</details>

### 🤖 AI Capabilities

<details open>
<summary><b>Intelligent Fallback Chain</b></summary>

Our AI features use a sophisticated fallback mechanism to ensure reliability:

```
Primary AI → Secondary AI → Template-based Fallback
```

| Feature | Primary | Secondary | Fallback |
|---------|---------|-----------|----------|
| 📊 Resume Analysis | Gemini | Groq | Template |
| ✍️ Cover Letter Gen | Groq | Gemini | Template |
| 🎯 Interview Practice | Groq | Gemini | Template |

**Benefits:**
- ✅ 100% uptime for AI features
- ✅ Graceful degradation
- ✅ Consistent user experience
- ✅ No API key required for basic functionality

</details>

---

## 🏗️ Architecture

### System Design

```mermaid
graph TB
    subgraph Client["CLIENT LAYER"]
        React["React SPA (Port 3000)<br/>React Router | Context API | Socket.IO Client<br/>Axios | Framer Motion | React Hot Toast"]
    end
    
    subgraph API["API GATEWAY"]
        Express["Express Server (Port 5000)<br/>JWT Auth | REST API | Socket.IO Server"]
    end
    
    subgraph Services["SERVICE LAYER"]
        Auth["Auth Service"]
        Business["Business Logic"]
        Realtime["Real-time Messages"]
    end
    
    subgraph Data["DATA LAYER"]
        MongoDB["MongoDB Atlas<br/>Users | Jobs | Applications<br/>Messages | Experiences"]
    end
    
    React -->|HTTP/WebSocket| Express
    Express --> Auth
    Express --> Business
    Express --> Realtime
    Auth --> MongoDB
    Business --> MongoDB
    Realtime --> MongoDB
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant DB as MongoDB
    participant G as Google OAuth

    U->>F: Login Request
    alt Email/Password
        F->>B: POST /api/auth/login
        B->>DB: Verify Credentials
        DB-->>B: User Data
        B-->>F: JWT Token
    else Google OAuth
        F->>G: Redirect to Google
        G-->>B: Auth Callback
        B->>DB: Find/Create User
        DB-->>B: User Data
        B-->>F: Redirect with Token
    end
    F->>F: Store Token
    F->>B: Authenticated Requests
    B->>B: Verify JWT
    B-->>F: Protected Resources
```

### Real-time Messaging Flow

```mermaid
sequenceDiagram
    participant JS as Job Seeker
    participant WS as Socket.IO Server
    participant DB as MongoDB
    participant E as Employer

    JS->>WS: Connect with userId
    WS->>WS: Store socket mapping
    E->>WS: Connect with userId
    WS->>WS: Store socket mapping
    
    JS->>WS: Send Message to Employer
    WS->>DB: Save Message
    DB-->>WS: Confirmation
    WS->>E: Emit message:receive
    WS->>JS: Emit message:sent
    
    E->>WS: Mark as Read
    WS->>DB: Update Message
    WS->>JS: Update Read Status
```

---

## 💻 Tech Stack

### Frontend Stack

<div align="center">

| Technology | Version | Purpose |
|:-----------|:-------:|:--------|
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | 18.x | UI Framework |
| ![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white) | 6.x | Navigation |
| ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101) | 4.x | Real-time Communication |
| ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) | Latest | HTTP Client |
| ![Framer](https://img.shields.io/badge/Framer_Motion-black?style=for-the-badge&logo=framer&logoColor=blue) | Latest | Animations |

</div>

### Backend Stack

<div align="center">

| Technology | Version | Purpose |
|:-----------|:-------:|:--------|
| ![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) | 18+ | Runtime |
| ![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge) | 4.x | Web Framework |
| ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white) | Latest | Database |
| ![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens) | Latest | Authentication |
| ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101) | 4.x | WebSocket Server |

</div>

### AI & External Services

<div align="center">

| Service | Purpose | Status |
|:--------|:--------|:------:|
| 🔷 **Google Gemini** | Resume Analysis (Primary) | Optional |
| ⚡ **Groq AI** | Cover Letter & Interview (Primary) | Optional |
| 🔐 **Google OAuth** | Social Authentication | Optional |
| 📄 **PDFMake** | PDF Generation | Required |
| 📖 **PDFReader** | PDF Parsing | Required |

</div>

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- ![Node](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white) **Node.js** 18 or higher
- ![npm](https://img.shields.io/badge/npm-9+-CB3837?logo=npm&logoColor=white) **npm** 9 or higher
- ![MongoDB](https://img.shields.io/badge/MongoDB-Running-4EA94B?logo=mongodb&logoColor=white) **MongoDB** (Local or Atlas)

### 📦 Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/job-portal-ai.git
cd job-portal-ai
```

#### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

<details>
<summary><b>Backend Environment Variables</b></summary>

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/job-portal

# Security
JWT_SECRET=your_super_secure_jwt_secret_min_32_characters
SESSION_SECRET=your_super_secure_session_secret_min_32_characters

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# AI Services (Optional but Recommended)
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

</details>

#### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

<details>
<summary><b>Frontend Environment Variables</b></summary>

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api
```

</details>

#### 4️⃣ Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

#### 5️⃣ Access the Application

🎉 **Your application is now running!**

- 🌐 **Frontend**: [http://localhost:3000](http://localhost:3000)
- 🔌 **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- 💬 **WebSocket**: [http://localhost:5000](http://localhost:5000)

---

## 📁 Project Structure

```
job-portal-ai/
│
├── 📂 backend/                    # Server-side application
│   ├── 📂 config/                 # Configuration files
│   │   ├── database.js            # MongoDB connection
│   │   ├── passport.js            # Passport strategies
│   │   └── socket.js              # Socket.IO setup
│   │
│   ├── 📂 middleware/             # Express middleware
│   │   ├── auth.js                # JWT authentication
│   │   ├── roleCheck.js           # Role-based access
│   │   └── upload.js              # File upload handling
│   │
│   ├── 📂 models/                 # Mongoose schemas
│   │   ├── User.js                # User model
│   │   ├── Job.js                 # Job posting model
│   │   ├── Application.js         # Application model
│   │   ├── Message.js             # Message model
│   │   └── Experience.js          # Interview experience model
│   │
│   ├── 📂 routes/                 # API route handlers
│   │   ├── auth.js                # Authentication routes
│   │   ├── jobs.js                # Job management routes
│   │   ├── applications.js        # Application routes
│   │   ├── messages.js            # Messaging routes
│   │   ├── resume.js              # AI resume analysis
│   │   ├── coverLetter.js         # AI cover letter generation
│   │   ├── practiceTest.js        # AI interview practice
│   │   └── experiences.js         # Experience sharing
│   │
│   ├── 📂 utils/                  # Utility functions
│   │   ├── aiService.js           # AI integration logic
│   │   ├── pdfParser.js           # PDF parsing utilities
│   │   └── validators.js          # Input validation
│   │
│   ├── server.js                  # Main server file
│   ├── package.json               # Backend dependencies
│   └── .env                       # Environment variables
│
├── 📂 frontend/                   # Client-side application
│   ├── 📂 public/                 # Static assets
│   │   ├── index.html             # HTML template
│   │   └── favicon.ico            # App icon
│   │
│   ├── 📂 src/                    # React source code
│   │   ├── 📂 components/         # Reusable components
│   │   │   ├── Navbar.js          # Navigation bar
│   │   │   ├── JobCard.js         # Job listing card
│   │   │   ├── ApplicationCard.js # Application display
│   │   │   ├── ChatWindow.js      # Real-time chat
│   │   │   └── ...
│   │   │
│   │   ├── 📂 context/            # React Context
│   │   │   ├── AuthContext.js     # Authentication state
│   │   │   └── SocketContext.js   # Socket.IO state
│   │   │
│   │   ├── 📂 pages/              # Page components
│   │   │   ├── Home.js            # Landing page
│   │   │   ├── Login.js           # Login page
│   │   │   ├── Register.js        # Registration page
│   │   │   ├── Dashboard.js       # User dashboard
│   │   │   ├── Jobs.js            # Job listings
│   │   │   ├── JobDetails.js      # Job detail view
│   │   │   ├── PostJob.js         # Job posting form
│   │   │   ├── Profile.js         # User profile
│   │   │   ├── Messages.js        # Messaging interface
│   │   │   ├── ResumeAnalyzer.js  # AI resume analysis
│   │   │   ├── CoverLetterGen.js  # AI cover letter
│   │   │   ├── PracticeTest.js    # AI interview prep
│   │   │   └── Experiences.js     # Interview experiences
│   │   │
│   │   ├── App.js                 # Main app component
│   │   ├── App.css                # Global styles
│   │   └── index.js               # React entry point
│   │
│   ├── package.json               # Frontend dependencies
│   └── .env                       # Environment variables
│
├── 📄 README.md                   # This file
├── 📄 COMPLETE_SETUP.md           # Detailed setup guide
├── 📄 API_KEY_SETUP.md            # AI API key instructions
└── 📄 LICENSE                     # MIT License
```

---

## 🔧 Configuration

### API Keys Setup

<details>
<summary><b>🔷 Google Gemini API Key</b></summary>

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add to `.env`:
   ```env
   GEMINI_API_KEY=your_key_here
   ```

**Free Tier:** 60 requests per minute

</details>

<details>
<summary><b>⚡ Groq API Key</b></summary>

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Add to `.env`:
   ```env
   GROQ_API_KEY=your_key_here
   ```

**Free Tier:** Generous limits for testing

</details>

<details>
<summary><b>🔐 Google OAuth Setup</b></summary>

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
6. Copy Client ID and Secret to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

</details>

### MongoDB Setup

<details>
<summary><b>Local MongoDB</b></summary>

```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Update .env
MONGO_URI=mongodb://localhost:27017/job-portal
```

</details>

<details>
<summary><b>MongoDB Atlas (Cloud)</b></summary>

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (Free tier available)
3. Create database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and update `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/job-portal
   ```

</details>

---

## 📡 API Reference

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

<details>
<summary><b>POST /auth/register</b> - Register new user</summary>

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "jobseeker"  // or "employer"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker"
  }
}
```

</details>

<details>
<summary><b>POST /auth/login</b> - Login user</summary>

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker"
  }
}
```

</details>

<details>
<summary><b>GET /auth/me</b> - Get current user (Protected)</summary>

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "jobseeker",
    "avatar": "base64_string...",
    "skills": ["JavaScript", "React", "Node.js"],
    "education": [...],
    "experience": [...]
  }
}
```

</details>

### Job Endpoints

<details>
<summary><b>GET /jobs</b> - Get all jobs with filters</summary>

**Query Parameters:**
```
?search=developer
&location=remote
&employmentType=full-time
&experienceLevel=mid
&category=engineering
&sortBy=createdAt
&order=desc
&page=1
&limit=10
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "data": [
    {
      "id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "title": "Senior Full Stack Developer",
      "company": "Tech Corp",
      "location": "Remote",
      "salary": {
        "min": 100000,
        "max": 150000,
        "currency": "USD"
      },
      "employmentType": "full-time",
      "experienceLevel": "senior",
      "skills": ["React", "Node.js", "MongoDB"],
      "applicationsCount": 15,
      "views": 234,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

</details>

<details>
<summary><b>POST /jobs</b> - Create job posting (Employer only)</summary>

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Senior Full Stack Developer",
  "company": "Tech Corp",
  "description": "We are looking for...",
  "requirements": ["5+ years experience", "React expertise"],
  "responsibilities": ["Build features", "Code reviews"],
  "employmentType": "full-time",
  "experienceLevel": "senior",
  "location": "Remote",
  "salary": {
    "min": 100000,
    "max": 150000,
    "currency": "USD"
  },
  "skills": ["React", "Node.js", "MongoDB"],
  "category": "engineering",
  "applicationDeadline": "2024-12-31"
}
```

</details>

### Application Endpoints

<details>
<summary><b>POST /applications</b> - Submit job application</summary>

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
jobId: 64a1b2c3d4e5f6g7h8i9j0k1
coverLetter: "Dear Hiring Manager..."
resume: <file.pdf>
answers: [{"question": "Why do you want to work here?", "answer": "Because..."}]
```

</details>

### AI Endpoints

<details>
<summary><b>POST /resume/analyze</b> - Analyze resume text</summary>

**Request:**
```json
{
  "resumeText": "John Doe\nSenior Developer\n..."
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "score": 85,
    "strengths": [
      "Strong technical skills",
      "Clear career progression",
      "Quantifiable achievements"
    ],
    "improvements": [
      "Add more specific metrics",
      "Include leadership examples"
    ],
    "keywords": ["JavaScript", "React", "Team Lead"],
    "suggestions": {
      "format": "Use more bullet points",
      "content": "Highlight project outcomes"
    }
  },
  "provider": "gemini"  // or "groq" or "template"
}
```

</details>

<details>
<summary><b>POST /cover-letter/generate</b> - Generate cover letter</summary>

**Form Data:**
```
jobTitle: "Senior Developer"
companyName: "Tech Corp"
jobDescription: "We are looking for..."
resume: <file.pdf>
tone: "professional"  // or "enthusiastic", "formal"
```

**Response:**
```json
{
  "success": true,
  "coverLetter": "Dear Hiring Manager,\n\nI am writing to express...",
  "pdfBase64": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHl...",
  "provider": "groq"
}
```

</details>

<details>
<summary><b>POST /practice-test/generate</b> - Generate interview questions</summary>

**Request:**
```json
{
  "jobTitle": "Senior Developer",
  "skills": ["React", "Node.js"],
  "experienceLevel": "senior",
  "numberOfQuestions": 5
}
```

**Response:**
```json
{
  "success": true,
  "questions": [
    {
      "id": 1,
      "question": "Explain React hooks and their benefits",
      "category": "technical",
      "difficulty": "medium"
    }
  ],
  "testId": "64a1b2c3d4e5f6g7h8i9j0k1"
}
```

</details>

---

## 🔌 WebSocket Events

### Client → Server

```javascript
// User joins the socket room
socket.emit('user:join', { userId: '64a1b2c3d4e5f6g7h8i9j0k1' });

// Send a message
socket.emit('message:send', {
  senderId: '64a1b2c3d4e5f6g7h8i9j0k1',
  receiverId: '64b2c3d4e5f6g7h8i9j0k1l2',
  content: 'Hello!'
});

// Mark message as read
socket.emit('message:read', { messageId: '64c3d4e5f6g7h8i9j0k1l2m3' });

// Typing indicator
socket.emit('user:typing', {
  senderId: '64a1b2c3d4e5f6g7h8i9j0k1',
  receiverId: '64b2c3d4e5f6g7h8i9j0k1l2'
});
```

### Server → Client

```javascript
// User online status
socket.on('user:online', (data) => {
  console.log(`User ${data.userId} is online`);
});

// User offline status
socket.on('user:offline', (data) => {
  console.log(`User ${data.userId} went offline`);
});

// Receive new message
socket.on('message:receive', (message) => {
  console.log('New message:', message);
});

// Message sent confirmation
socket.on('message:sent', (message) => {
  console.log('Message sent successfully:', message);
});

// Typing indicator
socket.on('user:typing', (data) => {
  console.log(`${data.senderId} is typing...`);
});

// Error handling
socket.on('error', (error) => {
  console.error('Socket error:', error);
});
```

---

## 📊 Data Models

### User Schema

```javascript
{
  // Authentication
  name: String,
  email: String (unique, required),
  password: String (hashed),
  googleId: String,
  role: String (enum: ['jobseeker', 'employer']),
  
  // Profile
  avatar: String (base64),
  phone: String,
  location: String,
  professionalSummary: String,
  
  // Job Seeker Specific
  resumeFile: String (base64),
  skills: [String],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    current: Boolean
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    expiryDate: Date,
    credentialId: String
  }],
  
  // Employer Specific
  company: {
    name: String,
    website: String,
    description: String,
    size: String,
    industry: String,
    logo: String (base64)
  },
  
  // Metadata
  createdAt: Date,
  updatedAt: Date
}
```

### Job Schema

```javascript
{
  // Basic Info
  title: String (required),
  company: String (required),
  description: String (required),
  
  // Requirements
  requirements: [String],
  responsibilities: [String],
  skills: [String],
  
  // Job Details
  employmentType: String (enum: ['full-time', 'part-time', 'contract', 'internship']),
  experienceLevel: String (enum: ['entry', 'mid', 'senior', 'lead']),
  location: String,
  salary: {
    min: Number,
    max: Number,
    currency: String
  },
  
  // Categorization
  category: String,
  
  // Application
  applicationDeadline: Date,
  applicationFields: [{
    label: String,
    type: String,
    required: Boolean
  }],
  
  // Metrics
  status: String (enum: ['active', 'closed', 'draft']),
  applicationsCount: Number,
  views: Number,
  
  // References
  postedBy: ObjectId (ref: 'User'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Application Schema

```javascript
{
  // References
  job: ObjectId (ref: 'Job', required),
  applicant: ObjectId (ref: 'User', required),
  employer: ObjectId (ref: 'User', required),
  
  // Application Content
  coverLetter: String,
  resume: String (base64),
  answers: [{
    question: String,
    answer: String
  }],
  
  // Status Tracking
  status: String (enum: ['applied', 'under_review', 'waitlist', 'accepted', 'rejected', 'withdrawn']),
  statusUpdates: [{
    status: String,
    updatedBy: ObjectId (ref: 'User'),
    timestamp: Date,
    note: String
  }],
  
  // Timestamps
  appliedAt: Date,
  updatedAt: Date
}
```

### Message Schema

```javascript
{
  // Participants
  sender: ObjectId (ref: 'User', required),
  receiver: ObjectId (ref: 'User', required),
  
  // Content
  subject: String,
  content: String (required),
  
  // Context
  application: ObjectId (ref: 'Application'),
  job: ObjectId (ref: 'Job'),
  inReplyTo: ObjectId (ref: 'Message'),
  
  // Threading
  threadId: String,
  
  // Status
  read: Boolean (default: false),
  readAt: Date,
  
  // Timestamps
  sentAt: Date,
  createdAt: Date
}
```

### Experience Schema

```javascript
{
  // Company Info
  company: String (required),
  location: String,
  role: String (required),
  year: Number,
  
  // Interview Details
  applicationStatus: String,
  experienceText: String (required),
  interviewProcess: String,
  rating: Number (1-5),
  tips: String,
  difficulty: String (enum: ['easy', 'medium', 'hard']),
  
  // Engagement
  helpfulCount: Number (default: 0),
  helpfulBy: [ObjectId (ref: 'User')],
  
  // Reference
  submittedBy: ObjectId (ref: 'User'),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run with coverage
npm test -- --coverage
```

### Test Structure

```
backend/
  tests/
    unit/
      models/
      utils/
    integration/
      auth.test.js
      jobs.test.js
      applications.test.js
    
frontend/
  src/
    __tests__/
      components/
      pages/
      utils/
```

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><b>❌ MongoDB Connection Failed</b></summary>

**Symptoms:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**
1. Ensure MongoDB is running:
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

2. Check `MONGO_URI` in `.env`
3. For Atlas, verify IP whitelist and credentials

</details>

<details>
<summary><b>❌ CORS Errors</b></summary>

**Symptoms:**
```
Access to XMLHttpRequest blocked by CORS policy
```

**Solutions:**
1. Verify `CLIENT_URL` in backend `.env` matches frontend URL
2. Check `REACT_APP_API_URL` in frontend `.env`
3. Ensure backend CORS middleware is configured correctly

</details>

<details>
<summary><b>❌ JWT Authentication Fails</b></summary>

**Symptoms:**
```
401 Unauthorized
Invalid token
```

**Solutions:**
1. Clear browser `localStorage`
2. Check `JWT_SECRET` is set in backend `.env`
3. Verify token is being sent in `Authorization` header
4. Check token expiration (default 7 days)

</details>

<details>
<summary><b>❌ Google OAuth Not Working</b></summary>

**Symptoms:**
```
Redirect URI mismatch
Invalid client
```

**Solutions:**
1. Verify `GOOGLE_CALLBACK_URL` exactly matches Google Console
2. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Ensure Google+ API is enabled
4. Add both `http://localhost:3000` and `http://localhost:5000` as authorized origins

</details>

<details>
<summary><b>❌ AI Features Not Working</b></summary>

**Symptoms:**
```
AI service unavailable
Template fallback used
```

**Solutions:**
1. Verify API keys are set:
   ```bash
   echo $GEMINI_API_KEY
   echo $GROQ_API_KEY
   ```

2. Check API quota/limits
3. Test API keys directly
4. Template fallback will still work without keys

</details>

<details>
<summary><b>❌ File Upload Issues</b></summary>

**Symptoms:**
```
File too large
Unsupported file type
```

**Solutions:**
1. Check file size limits (10MB for resumes, 5MB for AI)
2. Verify file type (PDF, DOC, DOCX)
3. Ensure PDF is text-based, not scanned image
4. Check Multer middleware configuration

</details>

<details>
<summary><b>❌ WebSocket Connection Failed</b></summary>

**Symptoms:**
```
WebSocket connection failed
Real-time features not working
```

**Solutions:**
1. Verify backend is running on correct port
2. Check Socket.IO client URL in frontend
3. Ensure CORS is configured for WebSocket
4. Check browser console for connection errors

</details>

---

### Roadmap

See [Future Work & Collaboration](#-future-work--collaboration) for planned improvements.

---

## 🤝 Future Work & Collaboration

We're always looking to improve! Here are some exciting features on our roadmap:

### 🎯 Planned Features

#### 📅 Interview Scheduling
- **Google Meet Integration**
  - Automatic meeting link generation
  - Calendar invitations sent via Gmail
  - Reminder notifications

```javascript
// Proposed API endpoint
POST /api/interviews/schedule
{
  "applicationId": "64a1b2c3...",
  "dateTime": "2024-02-15T10:00:00Z",
  "duration": 60,
  "interviewers": ["interviewer@company.com"]
}
```

#### ✉️ Automated Email Workflows
- **Acceptance Letters**
  - Automatic emails to selected candidates
  - Customizable templates
  - Attachment support (offer letters)

- **Rejection Notifications**
  - Gentle, professional rejection emails
  - Feedback inclusion option
  - Future opportunities notification

- **Status Update Emails**
  - Real-time application status changes
  - Interview reminders
  - Document requests

```javascript
// Email service integration
const nodemailer = require('nodemailer');

// Send acceptance letter
sendAcceptanceLetter({
  to: candidate.email,
  jobTitle: job.title,
  startDate: offer.startDate,
  salary: offer.salary,
  offerPdf: offer.document
});
```

#### 🎥 Video Interview Platform
- In-app video interviews
- Recording and playback
- AI-powered interview analysis

#### 📊 Advanced Analytics
- Hiring funnel metrics
- Time-to-hire tracking
- Candidate source analysis
- Diversity metrics

#### 🔔 Enhanced Notifications
- Push notifications
- SMS alerts
- Email digests
- Custom notification preferences

#### 🌐 Multi-language Support
- Internationalization (i18n)
- RTL language support
- Localized job postings

#### 🔍 Advanced Search
- Elasticsearch integration
- Semantic search
- Saved searches
- Job alerts

### 💡 Want to Contribute?

We welcome contributions! Here's how you can help:

1. **🐛 Report Bugs**
   - Open an issue with detailed description
   - Include steps to reproduce
   - Share error logs/screenshots

2. **✨ Suggest Features**
   - Describe the feature
   - Explain use cases
   - Share mockups if available

3. **🔧 Submit Pull Requests**
   - Fork the repository
   - Create a feature branch
   - Follow code style guidelines
   - Add tests for new features
   - Update documentation

4. **📖 Improve Documentation**
   - Fix typos
   - Add examples
   - Translate to other languages
   - Create tutorials

### 📧 Contact

- **Email:** prabhleen6003@gmail.com


---

<div align="center">

## 🌟 Star Us on GitHub!

If you find this project useful, please consider giving it a star ⭐

Made with ❤️ by [Prabhleen Kaur]

[⬆ Back to Top](#-ai-powered-job-portal)

</div>

