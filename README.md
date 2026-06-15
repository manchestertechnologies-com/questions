# Manchester Technologies Question Bank Management System

A production-ready, highly scalable, and modular **JEE, NEET, KCET, and Board Exam Question Bank Management System** built with the MERN stack (MongoDB, Express, React, Node) and integrated with Cloudinary for asset storage.

---

## System Overview & Architecture

The system is split into two modular sub-applications under a monorepo structure:
- **`backend/`**: Node.js/Express REST API. Features an automated DB seeding controller, advanced document parsing processors for `.doc`, `.docx`, and `.json`, and a resilient file uploader with a local storage fallback system when Cloudinary keys are missing.
- **`frontend/`**: Vite-powered React single page application styled with Tailwind CSS, utilizing Outfit typography, dynamic dashboard charts, and responsive sidebars with a global dark mode toggle.

---

## Database Collections (Mongoose Schema)

The database matches the required schema structure across 9 primary collections:
1. **`Users`**: Holds admin accounts and student profiles with bcrypt hashed password storage.
2. **`Subjects`**: Defines subjects (Physics, Chemistry, Mathematics, Botany, Zoology) segmented by Class level (11 / 12).
3. **`Chapters`**: Refers to subjects and groups chapter definitions (e.g. Electromagnetic Induction).
4. **`Concepts`**: Holds specific chapters subdivisions (e.g. Lenz Law).
5. **`SubConcepts`**: Preloaded concepts branches (e.g. Graph-Based Questions).
6. **`Questions`**: Stores MCQs, correct keys, explanation details, and target exam types.
7. **`QuestionImages`**: Audit log tracks Cloudinary urls, public IDs, and uploaders per image slot.
8. **`QuestionStatistics`**: Tracks practice logs (attempt counts, correct vs incorrect rates).
9. **`ActivityLogs`**: System-wide logging tracking administrative bulk imports, login timestamps, and slot uploads.

---

## Preloaded NCERT Syllabus (Class 11 & 12)

The system comes preloaded with the **latest full NCERT Class 11 and Class 12 syllabus structure**. The subjects seeded include:
- **Physics** (Class 11 & Class 12)
- **Chemistry** (Class 11 & Class 12)
- **Mathematics** (Class 11 & Class 12)
- **Botany** (Class 11 & Class 12)
- **Zoology** (Class 11 & Class 12)

### Auto Self-Seeding Mechanism
You do not need to manually configure chapters or run standalone seed files. The server entrypoint `backend/server.js` triggers a check on startup:
1. Checks if the `Subject` collection is empty.
2. If blank, it imports `ncertData.js` and seeds all subjects, chapters, concepts, and sub-concepts in a single nested sequence.
3. Automatically seeds the default Admin credential:
   - **Email**: `manchestertechnologiess@gmail.com`
   - **Password**: `MANTECH`

---

## Question Import System & [[IMG_SLOT]] Placeholders

Admins can upload questions in bulk using **JSON, DOCX, or DOC formats**.

### Document Parsing Formatting Template
Extract files must follow this formatting convention:
```text
Question 1
Find the current flowing in the following circuit.
[[IMG_SLOT]]
A) 2A
B) 3A
C) 4A
D) 5A
Correct: A
Explanation: According to Ohm's Law, V = IR...
```

### Image Placeholder System
1. When Claude or an editor outputs a question, any diagrams, tables, figures, or circuits are represented as `[[IMG_SLOT]]`.
2. The backend parser scans `questionText`, option details, and `explanation` blocks for `[[IMG_SLOT]]`.
3. It initializes an array of empty slot references: e.g. `questionText_0`, `optionA_0`, `explanation_0`.
4. In the **Admin Portal**, questions with empty slots display a dashed drawing attachment card. Clicking it allows admins to upload the drawing/diagram directly to that position.
5. In both portals, the text is dynamically split and renders the image inline exactly where `[[IMG_SLOT]]` was positioned.

---

## Getting Started: Local Execution

### 1. Configure the Environment
Navigate to `backend/` and copy the env file:
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and paste:
1. Your **MongoDB Connection String** (`MONGODB_URI`).
2. Optional: **Cloudinary Credentials** (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`). If omitted, the system falls back to saving uploads inside `backend/uploads/` locally.

### 2. Install Dependencies
Run install in both folders:
```bash
# In backend/
npm install

# In frontend/
cd ../frontend
npm install
```

### 3. Start the Applications
```bash
# Start Backend (runs on http://localhost:5000)
cd backend
npm run dev

# Start Frontend (runs on http://localhost:3000)
cd frontend
npm run dev
```

---

## Deployment to Vercel

Vercel hosts both Express and Vite SPAs. You will deploy them as two separate linked Vercel apps.

### 1. Deploy the Backend (API Server)
1. Install Vercel CLI globally: `npm install -g vercel`
2. Navigate to the `backend/` directory: `cd backend`
3. Run `vercel` to start deployment.
4. Set up the project name (e.g. `manchester-questions-api`).
5. Configure the Vercel project environment variables in your Vercel Dashboard:
   - `MONGODB_URI`: Paste your MongoDB Connection String.
   - `JWT_SECRET`: Any random security string.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: (Cloudinary configurations).
6. Redeploy or run `vercel --prod` to copy environmental variables to the live build.
7. Record your deployed Backend URL (e.g. `https://manchester-questions-api.vercel.app`).

### 2. Deploy the Frontend (Vite Client)
1. Navigate to the `frontend/` directory: `cd ../frontend`
2. Create an `.env` file or define build variables in Vercel:
   - `VITE_API_URL`: Set this to your deployed backend API URL + `/api` (e.g. `https://manchester-questions-api.vercel.app/api`).
3. Run `vercel` to deploy the static site.
4. Set up the project name (e.g. `manchester-questions`).
5. Run `vercel --prod` to release the frontend.

---

## Pushing to GitHub Remote Repository

To push this codebase to the target GitHub repository:

1. Initialize git (if not already done) and stage files:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit - complete production question bank system"
   ```
2. Add the remote repository URL:
   ```bash
   git remote add origin https://github.com/manchestertechnologies-com/questions.git
   ```
3. Push to the main branch:
   ```bash
   git branch -M main
   git push -u origin main
   ```
