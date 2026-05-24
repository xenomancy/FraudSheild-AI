# FraudShield AI - Real-time ML Fraud Detection Platform

**FraudShield AI** is a production-level, high-fidelity fintech platform that uses machine learning to predict fraudulent transaction vectors in real-time, backed by beautiful multi-dimensional analytical dashboards, a searchable transaction ledger, and a responsive glassmorphism dark-theme dashboard console.

---

## 🚀 Key Platform Features

*   **SMOTE-Balanced Machine Learning Pipeline:** Employs Scikit-Learn **Random Forest Classifier** trained on transaction amount, geographic location, device type, hourly timestamp, and payment method, resolved using SMOTE to handle heavily imbalanced financial datasets.
*   **Highly Resilient FastAPI Backend:** Powered by asynchronous routers, JWT-based token handshakes, password crypt hashing, CORS integration, and MongoDB Atlas database connectors.
*   **Self-Healing Database Fallback:** If MongoDB Atlas is offline or not configured, the backend automatically transitions to a memory-buffered, pre-seeded mockup registry allowing full platform exploration out of the box.
*   **Recruiter Quick Demo (One-Click Entrance):** A dedicated **"Continue as Guest"** pathway on the login page issues a pre-authorized token mapping immediately to high-fidelity historical mockup records and active dashboards.
*   **Modern Glassmorphism Frontend Console:** React SPA styled with custom fintech dark-theme tokens (slate-950, deep indigo, neon cyan, amber, and rose gradients), glowing micro-animations, loading skeletons, searchable data grids, and interactive prediction gauges.
*   **Multidimensional Recharts Graphs:** Live daily area trends (Safe vs Suspicious), risk rating ratios (Pie chart), transaction activity charts (Line chart), payment profiling (stacked Bar chart), and monthly aggregations (double-axis Bar chart).

---

## 📁 Repository Directory Structure

```text
FraudShield-AI/
├── ml-model/               # Machine Learning training & dataset modules
│   ├── artifacts/          # Serialized models, scalers, and JSON metadata
│   ├── dataset_generator.py # High-fidelity synthetic transactional dataset seeder
│   ├── train.py            # SMOTE, Preprocessor StandardScaler, and Random Forest Trainer
│   └── requirements.txt    # Python library requirements for training
│
├── backend/                # FastAPI Asynchronous Web Server
│   ├── app/
│   │   ├── ml/             # Production joblib model artifacts (for inference)
│   │   ├── routes/
│   │   │   ├── auth.py     # JWT login, signup, and Guest Quick login endpoints
│   │   │   ├── predict.py  # Live ML prediction router with fallback rules
│   │   │   └── transactions.py # Searchable logs, analytics compilers, and logs
│   │   ├── auth.py         # Password hashings and token decoding handshakes
│   │   ├── config.py       # Pydantic Settings system configurations
│   │   ├── database.py     # MongoDB connection pooling & self-healing mock fallback
│   │   ├── models.py       # Pydantic typing and validation schemas
│   │   └── main.py         # FastAPI main script (CORS, error handlers)
│   ├── .env.example        # Configuration template for production vars
│   └── requirements.txt    # Web server dependencies (Uvicorn, PyJWT, passlib)
│
└── frontend/               # React Vite Tailwind CSS Single Page Application
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx # Responsive collapsable navigation drawer
    │   │   └── RecruiterBanner.jsx # Sticky Top Guest Mode Evaluator Warning Banner
    │   ├── context/
    │   │   └── AuthContext.jsx # JWT session context and resilient Offline API fallback
    │   ├── pages/
    │   │   ├── LandingPage.jsx # Glowing interactive console portal
    │   │   ├── LoginPage.jsx   # Login screen with Quick Guest login cards
    │   │   ├── RegisterPage.jsx# Secure account creation forms
    │   │   ├── DashboardPage.jsx # Analytics and recent alerts overview
    │   │   ├── AnalyticsPage.jsx # Multi-chart threat intelligence board
    │   │   ├── TransactionsPage.jsx # Datagrid transaction ledger with paginations
    │   │   └── PredictorPage.jsx # Form with custom animated circular SVG probability gauge
    │   ├── App.jsx         # App router and Protected Route guards
    │   ├── index.css       # Tailwind directives and custom scrollbar classes
    │   └── main.jsx        # App mounting entry script
    ├── tailwind.config.js  # Custom Slate-950/Indigo/Cyan fintech color values
    ├── postcss.config.js   # CSS compiler configs
    └── package.json        # NPM dependencies (Recharts, Lucide, React Router v6)
```

---

## 🛠️ Step-by-Step Local Setup Instructions

### Phase 1: Machine Learning Module & Model Generation

1.  Navigate into the `ml-model` folder:
    ```bash
    cd ml-model
    ```
2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate
    ```
3.  Install ML dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Train and serialize models:
    ```bash
    python train.py
    ```
    *This generates `fraud_model.joblib`, `preprocessor.joblib`, and `metadata.json` under `ml-model/artifacts/` and automatically copies them directly to `backend/app/ml/` for seamless backend access.*

---

### Phase 2: FastAPI Backend Deployment

1.  Navigate to the `backend` folder:
    ```bash
    cd ../backend
    ```
2.  Install backend dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Copy and rename environment file:
    ```bash
    cp .env.example .env
    ```
4.  Configure `.env` file (Optional):
    *   To connect your **MongoDB Atlas** database, set your `MONGODB_URI` string.
    *   If left empty, the self-healing DB fallback will automatically activate so that everything runs flawlessly using the in-memory seeder.
5.  Launch the FastAPI server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
    *Your APIs will boot up on `http://localhost:8000`. You can inspect the interactive documentation at `http://localhost:8000/docs`.*

---

### Phase 3: React Vite Tailwind Frontend Setup

1.  Navigate into the `frontend` folder:
    ```bash
    cd ../frontend
    ```
2.  Install npm node packages:
    ```bash
    npm install
    ```
3.  Launch the hot-reload hot-module local development server:
    ```bash
    npm run dev
    ```
    *The web application console is now active on `http://localhost:5173`. Open it in your browser and click "Continue as Guest" to immediately begin reviewing!*

---

## ☁️ Production Cloud Deployment Blueprints

### 1. Frontend: Deploy to Vercel

*Vercel is the ultimate host for React Vite single-page applications.*

1.  Push your code to a GitHub repository.
2.  Import your repository into the [Vercel Console](https://vercel.com).
3.  Set the following configuration variables in Vercel:
    *   **Framework Preset:** Vite
    *   **Root Directory:** `frontend`
    *   **Build Command:** `npm run build`
    *   **Output Directory:** `dist`
4.  Set Environment Variables in Vercel settings (if connecting live backend):
    *   Configure your API endpoints to communicate with your live Render backend URL.
5.  Click **Deploy**!

---

### 2. Backend: Deploy to Render

*Render is perfect for hosting high-performance FastAPI Python microservices.*

1.  Go to the [Render Dashboard](https://render.com) and click **New + -> Web Service**.
2.  Connect your GitHub repository.
3.  Configure the Web Service with the following details:
    *   **Name:** `fraudshield-backend`
    *   **Environment:** `Python`
    *   **Root Directory:** `backend`
    *   **Build Command:** `pip install -r requirements.txt`
    *   **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4.  Under **Advanced**, click **Add Environment Variable** to set up production variables:
    *   `JWT_SECRET`: *A secure random hash key*
    *   `ALGORITHM`: `HS256`
    *   `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
    *   `MONGODB_URI`: *Your MongoDB Atlas production connection string*
5.  Click **Deploy Web Service**!

---

## 🌟 Recruiter Fast-Review Walkthrough Checklist

For the absolute best evaluation, follow this pathway:
1.  Open the site on `http://localhost:5173` to see the gorgeous **Fintech Landing Page**.
2.  Click **Launch Recruiter Guest Demo** or navigate to `/login` and select **Continue as Guest**.
3.  Observe the custom sticky **Recruiter Banner** stating your pre-authorized Demo access.
4.  Examine the **KPI stats cards** (Total volume, suspicious counts) pre-populated over the last 30 days.
5.  Hover over the **Recharts Area Graph** to inspect multi-gradient transaction daily anomalies.
6.  Navigate to the **Analytics Page** and inspect the 5 independent, custom HSL-styled data charts.
7.  Navigate to the **Audit Ledger Table**, type a search filter (e.g. `US` or `Transfer`), sort, and paginate.
8.  Navigate to the **AI Predictor** and test out transaction inputs:
    *   *Test 1 (Safe baseline):* Amount: `$150.00`, Location: `US`, Hour: `14 (2 PM)`, Payment: `Debit Card` -> Evaluates to **Low Risk (Green)**.
    *   *Test 2 (High Risk anomaly):* Amount: `$12,000.00`, Location: `ASIA`, Hour: `02 (2 AM)`, Payment: `Transfer` -> Triggers an instant **High Risk Flag (Red)** with a full model rationalization diagnostic breakdown!
9.  Go back to the **Audit Ledger Table** or **Dashboard recent activity feed**; your custom predictions will be logged and rendered at the very top of the datasets in real-time!
