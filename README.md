# Data Room

A secure web document management application built for due diligence and collaboration. Think Google Drive for M&A transactions.

## 🎯 Features

### Core Functionality
- ✅ **Data Room Management**: Create and manage multiple secure data rooms
- ✅ **Hierarchical Folders**: Nested folder structure with unlimited depth
- ✅ **PDF Document Upload**: Store and organize PDF documents
- ✅ **File Operations**: Upload, download, rename, and delete files
- ✅ **Folder Operations**: Create, rename, and delete folders (with cascade)
- ✅ **Full-Text Search**: Search documents by filename and PDF content
- ✅ **OAuth 2.0 Authentication**: Secure Google OAuth integration
- ✅ **Access Control**: User-based permissions and data isolation

### Technical Highlights
- **Backend**: Python, Flask, PostgreSQL, SQLAlchemy
- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI
- **Authentication**: JWT tokens with OAuth 2.0 (Google)
- **Database**: Podman containerized PostgreSQL
- **Search**: PDF text extraction with content indexing
- **File Storage**: Disk-based with unique naming to prevent conflicts

## 🏗️ Architecture & Design Decisions

### Database Schema

#### Users Table
```sql
- id: Primary key
- email: Unique, indexed for fast lookup
- oauth_provider, oauth_id: Composite unique constraint
- name, avatar_url: User profile information
- created_at, updated_at: Timestamps
```

#### DataRooms Table
```sql
- id: Primary key
- name, description: DataRoom metadata
- owner_id: Foreign key to users (cascade delete)
- created_at, updated_at: Timestamps
```

#### Folders Table (Hierarchical)
```sql
- id: Primary key
- name: Folder name
- parent_id: Self-referencing foreign key (supports nesting)
- dataroom_id: Foreign key to datarooms
- path: Denormalized path for efficient querying (/folder1/subfolder2)
- Unique constraint: (dataroom_id, parent_id, name) - prevents duplicates
- Indexed: parent_id, dataroom_id, path
```

#### Files Table
```sql
- id: Primary key
- name: Display name (user-facing)
- original_name: Original upload name
- folder_id: Optional foreign key to folders (NULL for root files)
- dataroom_id: Foreign key to datarooms
- file_path: Relative disk path (dataroom_id/uuid.pdf)
- file_size: Bytes (for display)
- mime_type: application/pdf
- content_text: Extracted PDF text for search
- Indexed: folder_id, dataroom_id
```

### Key Design Patterns

#### 1. **Application Factory Pattern** (Flask)
- Modular blueprints for each resource
- Clean separation of concerns
- Easy testing and configuration

#### 2. **JWT Authentication**
- Stateless authentication
- 7-day expiration
- Secure OAuth 2.0 flow with Google

#### 3. **Hierarchical Folders**
- Self-referencing parent_id
- Path denormalization for performance
- Recursive tree building
- Cascade delete for cleanup

#### 4. **File Conflict Resolution**
- Auto-rename duplicates: `file.pdf` → `file (1).pdf`
- UUID-based disk storage prevents collisions
- Display name separate from storage name

#### 5. **Search Strategy**
- PyPDF2 text extraction on upload
- Content stored in database for fast search
- ILIKE pattern matching (scalable with pg_trgm GIN indexes)

### Scalability Considerations

#### Current Implementation
- Disk-based file storage
- PostgreSQL for metadata
- Basic ILIKE search

#### Future Scalability (Millions of files, Thousands of users)
1. **File Storage**
   - Move to S3/MinIO object storage
   - CDN for downloads
   - Signed URLs for security

2. **Search**
   - Enable `pg_trgm` extension
   - Create GIN indexes: `CREATE INDEX ON files USING gin(content_text gin_trgm_ops)`
   - Consider Elasticsearch for advanced search

3. **Database**
   - Connection pooling (pgBouncer)
   - Read replicas for search queries
   - Partitioning by dataroom_id

4. **Caching**
   - Redis for session management
   - Cache folder structures
   - CDN for static assets

5. **Background Jobs**
   - Celery for PDF text extraction
   - Async file upload processing

### Security Features

- **Authentication**: OAuth 2.0 with JWT
- **Authorization**: Row-level security (user owns dataroom)
- **Input Validation**: Sanitization on all endpoints
- **SQL Injection**: Parameterized queries via SQLAlchemy
- **File Upload**: Type validation (PDF only), size limits (100MB)
- **Secrets Management**: Environment variables, .gitignore for .env
- **CORS**: Configured for frontend origin only

## 🚀 Setup Instructions

### Prerequisites
- **Python 3.12+** with `uv` package manager
- **Node.js 18+** with `npm`
- **Podman** (or Docker)
- **Google OAuth 2.0 Client** credentials

### Quick Start with Docker/Podman

The easiest way to run the entire application is using Docker or Podman Compose. See **[DOCKER_SETUP.md](DOCKER_SETUP.md)** for complete containerization guide.

**Quick commands:**
```bash
# Using the convenience script (auto-detects docker/podman)
./docker-compose.sh up       # Start all services
./docker-compose.sh logs     # View logs
./docker-compose.sh down     # Stop services
./docker-compose.sh help     # See all commands

# Or manually with docker/podman:
# 1. Copy and configure environment variables
cp .env.example .env
# Edit .env with your Google OAuth credentials

# 2. Start all services (database, backend, frontend)
docker compose up -d
# or with Podman:
podman-compose up -d
# or with Podman + uvx (no installation):
uvx podman-compose up -d

# 3. Access the application
# Frontend: http://localhost:5000
# Backend API: http://localhost:5001
```

### Manual Setup (Development)

#### 1. Database Setup

Start PostgreSQL in Podman:
```bash
cd backend
chmod +x start-postgres.sh
./start-postgres.sh
```

**Connection Details:**
- Host: `localhost`
- Port: `5433` (to avoid conflict with system PostgreSQL)
- Database: `dataroom`
- User: `dataroom`
- Password: `dataroom_dev_password`

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
uv sync

# Configure environment
cp .env.example .env
# Edit .env and set your Google OAuth credentials:
#   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
#   GOOGLE_CLIENT_SECRET=your-client-secret
#   SECRET_KEY=your-random-secret-key

# Run database migrations (creates tables)
# Tables are auto-created on first run via db.create_all()

# Start the Flask backend
uv run app.py
```

Backend will run on **http://localhost:5001**

#### 3. Frontend Setup

```bash
cd ui

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on **http://localhost:5000**

#### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure the OAuth consent screen (if first time):
   - User Type: External
   - App name: Data Room
   - Add your email as developer contact
6. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: Data Room Local Dev
   - **Authorized redirect URIs**: `http://localhost:5000/auth/callback`
7. Copy the Client ID and Client Secret to `backend/.env`

See **[GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)** for detailed OAuth configuration.

#### 5. Testing the Application

1. Open **http://localhost:5000**
2. Click "Sign in with Google"
3. Select your Google account and authorize the application
4. Create a new Data Room
5. Upload PDF files
6. Create folders
7. Search for documents

## 📁 Project Structure

```
data-room/
├── backend/                # Python Flask API
│   ├── app.py             # Application factory
│   ├── config.py          # Configuration management
│   ├── models.py          # SQLAlchemy models
│   ├── auth_utils.py      # JWT utilities
│   ├── routes/            # API blueprints
│   │   ├── auth.py        # OAuth & authentication
│   │   ├── datarooms.py   # DataRoom CRUD
│   │   ├── folders.py     # Folder CRUD
│   │   ├── files.py       # File upload/download
│   │   └── search.py      # Search API
│   ├── uploads/           # File storage (gitignored)
│   ├── .env               # Environment variables (gitignored)
│   ├── pyproject.toml     # Python dependencies
│   └── start-postgres.sh  # Database startup script
│
├── ui/                    # React TypeScript SPA
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   └── ui/        # Shadcn/UI components
│   │   ├── contexts/      # React contexts
│   │   │   └── auth-context.tsx
│   │   ├── lib/           # Utilities
│   │   │   ├── api.ts     # API client
│   │   │   └── utils.ts   # Helper functions
│   │   ├── pages/         # Route pages
│   │   │   ├── login-page.tsx
│   │   │   ├── auth-callback-page.tsx
│   │   │   ├── dashboard-page.tsx
│   │   │   └── dataroom-page.tsx
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Global styles
│   ├── vite.config.ts     # Vite configuration
│   ├── tailwind.config.js # Tailwind CSS config
│   ├── eslint.config.js   # ESLint Stylistic config
│   ├── tsconfig.json      # TypeScript config
│   └── package.json       # Node dependencies
│
└── README.md             # This file
```

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/login` - Get Google OAuth URL
- `GET /api/auth/callback?code=xyz` - OAuth callback handler
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout

### Data Rooms
- `GET /api/datarooms` - List user's data rooms
- `POST /api/datarooms` - Create data room
- `GET /api/datarooms/:id` - Get data room details
- `PUT /api/datarooms/:id` - Update data room
- `DELETE /api/datarooms/:id` - Delete data room
- `GET /api/datarooms/:id/structure` - Get folder tree

### Folders
- `POST /api/folders` - Create folder
- `GET /api/folders/:id` - Get folder with children
- `PUT /api/folders/:id` - Rename folder
- `DELETE /api/folders/:id` - Delete folder (cascade)
- `GET /api/folders/:id/contents` - Get immediate contents

### Files
- `POST /api/files` - Upload file (multipart/form-data)
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Download file
- `PUT /api/files/:id` - Rename/move file
- `DELETE /api/files/:id` - Delete file

### Search
- `GET /api/search?q=query&dataroom_id=123` - Search files

**All endpoints except `/auth/login` and `/auth/callback` require JWT token:**
```
Authorization: Bearer <token>
```

## 🧪 Edge Cases Handled

1. **Duplicate Files**: Auto-rename with (1), (2), etc.
2. **Duplicate Folders**: Database unique constraint prevents creation
3. **Folder Deletion**: Cascade deletes all children and files
4. **File Upload Errors**: Rollback on failure
5. **Large Files**: 100MB limit configurable
6. **Concurrent Uploads**: Unique UUID-based storage names
7. **Missing PDF Text**: Graceful fallback (empty content_text)
8. **Access Control**: All endpoints verify dataroom ownership

## 🛠️ Technologies Used

### Backend
- **Flask**: Web framework
- **SQLAlchemy**: ORM
- **PostgreSQL**: Database
- **Podman**: Container runtime
- **PyPDF2**: PDF text extraction
- **PyJWT**: Token generation
- **Flask-CORS**: Cross-origin requests
- **python-dotenv**: Environment management
- **uv**: Fast Python package manager

### Frontend
- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS
- **Shadcn/UI**: Component library
- **Lucide React**: Icons
- **ESLint Stylistic**: Code style

## 📝 Development Notes

### Running Tests

#### E2E Tests (Playwright)
```bash
# Start test browser
cd ui
./start-test-browser.sh

# In another terminal, run tests
npm run test:e2e

# Or run in UI mode
npm run test:e2e:ui

# View report
npm run test:e2e:report
```

See [ui/e2e/README.md](ui/e2e/README.md) for comprehensive E2E testing documentation.

#### Backend Tests (pytest)
```bash
# Backend tests (pytest)
cd backend
uv run pytest

# Frontend tests (vitest)
cd ui
npm test
```

### Building for Production
```bash
# Backend
cd backend
uv build

# Frontend
cd ui
npm run build
# Outputs to ui/dist/
```

### Environment Variables

#### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=oauth-client-secret
OAUTH_REDIRECT_URI=http://localhost:5000/auth/callback
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=104857600
CORS_ORIGINS=http://localhost:5000
```

## 🚧 Known Limitations & Future Improvements

### Current Limitations
1. ~~No E2E tests with Playwright~~ ✅ **Implemented!** - Comprehensive E2E test suite
2. Basic search (no fuzzy matching, ranking)
3. No file preview in browser
4. Single OAuth provider (Google only)
5. No real-time collaboration features
6. No file versioning
7. No audit logs

### Planned Improvements
1. ~~**Playwright E2E Tests**: Full test coverage~~ ✅ **Complete** - See [ui/e2e/README.md](ui/e2e/README.md)
2. **Advanced Search**: Fuzzy matching, filters, facets
3. **PDF Preview**: In-browser PDF viewer
4. **Multi-provider OAuth**: GitHub, Microsoft, additional providers
5. **Real-time Updates**: WebSockets for live collaboration
6. **File Versioning**: Track document changes
7. **Audit Logs**: Track all user actions
8. **Permissions**: Share datarooms with other users
9. **Drag & Drop**: Move files/folders via UI
10. **Bulk Operations**: Multi-select and batch actions

## 📄 License

MIT License - Feel free to use this project for learning or as a foundation for your own applications.

## 👨‍💻 Author

Mark Ferenci mark.ferenci.full.stack@gmail.com