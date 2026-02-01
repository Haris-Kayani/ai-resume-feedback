# Resume Fix

> **ATS Resume Scoring & Optimization Platform**

A full-stack web application that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). Upload your resume, paste a job description, and get instant ATS compatibility scores with actionable recommendations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-22-green)

---

## ✨ Features

- 📄 **Resume Upload** - Support for PDF and DOCX formats
- 📝 **Rich Text Job Description Editor** - Built with Tiptap
- 🎯 **ATS Scoring** - Get detailed compatibility scores (0-100)
- 🔍 **Keyword Analysis** - Match your resume with job requirements
- 💡 **Smart Recommendations** - Actionable suggestions to improve your score
- 📊 **Side-by-Side Comparison** - See resume and job description differences
- 📚 **History Tracking** - Access all your past analyses
- 🔐 **Secure Authentication** - JWT-based user authentication
- 🌙 **Modern UI** - Dark theme with smooth animations

---

## 🚀 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **React Router v7** - Client-side routing
- **Zustand** - State management
- **TailwindCSS** - Utility-first styling
- **Tiptap** - Rich text editor
- **Lucide React** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **pdf-parse** - PDF text extraction
- **mammoth** - DOCX text extraction
- **Zod** - Schema validation

### DevOps & Testing
- **Docker & Docker Compose** - Containerization
- **Playwright** - E2E testing
- **Vitest** - Unit testing
- **ESLint** - Code linting
- **Vercel** - Deployment ready

---

## 📋 Prerequisites

- **Node.js** 22 or higher
- **MongoDB** 7 or higher (or use Docker Compose)
- **npm** or **pnpm**

---

## 🛠️ Installation

### Option 1: Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-fix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/resume_ats
   
   # Authentication
   JWT_SECRET=your_super_secret_key_change_this_in_production
   
   # CORS
   CLIENT_ORIGIN=http://localhost:5173,http://localhost:3001
   
   # File Upload
   MAX_FILE_SIZE_MB=5
   UPLOAD_DIR=./uploads
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Or use your local MongoDB installation
   ```

5. **Run the development servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or run them separately:
   npm run client:dev  # Frontend on http://localhost:5173
   npm run server:dev  # Backend on http://localhost:3001
   ```

### Option 2: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-fix
   ```

2. **Update environment variables in docker-compose.yml**
   ```yaml
   # Change JWT_SECRET to a secure value
   JWT_SECRET: your_production_secret_key
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3001
   - MongoDB: localhost:27017

---

## 📦 Build & Production

### Build for production

```bash
# Build both frontend and backend
npm run build:all

# Or build separately:
npm run build        # Frontend
npm run build:server # Backend
```

### Start production server

```bash
npm start
```

### Docker production build

```bash
docker build -t resume-fix .
docker run -p 3001:3001 \
  -e MONGODB_URI=mongodb://host.docker.internal:27017/resume_ats \
  -e JWT_SECRET=your_secret \
  resume-fix
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

### End-to-End Tests
```bash
npm run test:e2e      # Run Playwright tests
```

### Performance Tests
```bash
npm run test:perf     # Load testing
```

### Security Tests
```bash
npm run test:security # Security checks
```

---

## 📁 Project Structure

```
resume-fix/
├── api/                      # Backend source
│   ├── app.ts               # Express app setup
│   ├── server.ts            # Server entry point
│   ├── db/                  # Database connection
│   ├── middleware/          # Auth & validation
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
├── src/                      # Frontend source
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── components/          # React components
│   ├── pages/               # Page components
│   ├── stores/              # Zustand stores
│   ├── hooks/               # Custom hooks
│   └── utils/               # Utilities
├── e2e/                      # E2E tests
├── scripts/                  # Utility scripts
├── uploads/                  # Uploaded files
├── docker-compose.yml        # Docker setup
├── Dockerfile                # Production build
└── DOCUMENTATION.md          # Detailed docs
```

---

## 🔑 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/resume_ats` |
| `JWT_SECRET` | Secret for JWT signing | **Required** |
| `CLIENT_ORIGIN` | Allowed CORS origins | `http://localhost:5173` |
| `MAX_FILE_SIZE_MB` | Max upload size | `5` |
| `UPLOAD_DIR` | Upload directory | `./uploads` |

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Resumes
- `GET /api/resumes` - List all resumes
- `POST /api/resumes` - Upload new resume
- `DELETE /api/resumes/:id` - Delete resume

### Job Descriptions
- `GET /api/jds` - List all job descriptions
- `POST /api/jds` - Create job description
- `PUT /api/jds/:id` - Update job description
- `DELETE /api/jds/:id` - Delete job description

### Analysis
- `POST /api/runs` - Run ATS analysis
- `GET /api/runs` - List all runs
- `GET /api/runs/:id` - Get specific run

---

## 🎨 Key Features Explained

### ATS Score Calculation

The platform analyzes:
- **Keyword Matching** - How well your resume matches required skills
- **Format Compatibility** - Resume structure and readability
- **Content Quality** - Completeness and relevance
- **Experience Alignment** - Match with job requirements

### Resume Processing

1. Upload PDF or DOCX file
2. Extract text using specialized parsers
3. Parse and structure content
4. Store securely with metadata

### Job Description Editor

- Rich text formatting (bold, italic, lists, links)
- Auto-save functionality
- Placeholder guidance
- Clean HTML output

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for session management
- Input validation with Zod
- File type verification
- Rate limiting on API endpoints
- Helmet.js for security headers
- XSS protection with sanitize-html

---

## 📞 Support

For detailed documentation, see [DOCUMENTATION.md](./DOCUMENTATION.md)

For issues or questions, please open an issue on the repository.

---

## 🙏 Acknowledgments

Built with modern web technologies and best practices for security, performance, and user experience.
