# FaceMesh ID System

## Overview
This system provides 3D face reconstruction and biometric registration/comparison. It consists of a React frontend and a FastAPI backend. It relies on an external inference API to generate raw mesh data.

## Prerequisites
1. **Python 3.9+**
2. **Node.js 18+**
3. **Inference API**: You must have your inference API running at `http://127.0.0.1:5011/infer` that returns `vertices` and `faces`.

## 1. External API Setup

1.  **Setup**: Follow the instructions in the [gen_mod repository](https://github.com/Yearningyeati1/gen_mod) to set up the inference API.
2.  **License**: Please note that this external component is intended for **non-commercial purposes(as indicated in dependencies licenses)** only.
3.  **Run**: Ensure the API is running at `http://127.0.0.1:5011`(or use another port but update main.py).

## 2. Backend Setup

1. Navigate to the `backend` folder (or where `main.py` is located).
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python main.py
   ```
   The backend will start at `http://127.0.0.1:8000`. It will create a `meshes` directory and a `facemesh.db` SQLite file automatically.

## 3. Frontend Setup

1. In the project root (where `package.json` would be):
2. Initialize project (if starting from scratch) or install dependencies:
   ```bash
   npm install react react-dom react-router-dom axios three @types/three @react-three/fiber @react-three/drei
   npm install -D tailwindcss postcss autoprefixer vite @vitejs/plugin-react typescript @types/react @types/react-dom
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## 4. Database
* **Default:** SQLite (`facemesh.db`). No configuration needed.
* **Postgres:**
  1. Install `psycopg2` via pip.
  2. Edit `backend/database.py`.
  3. Change `SQLALCHEMY_DATABASE_URL` to `postgresql://user:password@localhost/dbname`.

## 5. Environment
* The Frontend expects the backend at `http://127.0.0.1:8000` (Defined in `constants.ts`).
* The Backend expects the Inference API at `http://127.0.0.1:5011` (Defined in `backend/mesh_utils.py`).
