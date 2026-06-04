# LensArthropoda - Smart Insect Identifier with AI Insights

Aplikasi web full-stack yang menggabungkan **Computer Vision** (PyTorch) untuk klasifikasi spesies serangga dengan **Generative AI** (Google Gemini 2.5 Flash) untuk memberikan wawasan mendalam seperti taksonomi, habitat, peran ekologis, dan fakta unik secara real-time.

## Table of Contents
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi](#-instalasi)
- [Cara Menjalankan](#-cara-menjalankan)
- [Struktur Proyek](#-struktur-proyek)
- [API Endpoints](#-api-endpoints)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Troubleshooting](#-troubleshooting)

---

## Fitur Utama

- **Identifikasi Akurat**: Model Deep Learning (EfficientNet B3) dioptimalkan untuk klasifikasi 118+ spesies serangga
- **AI Insights**: Integrasi Google Gemini dengan Extended Thinking untuk informasi biologis yang akurat
- **UI Modern**: Antarmuka elegan dengan Glassmorphism, real-time image preview, Markdown rendering
- **Asynchronous API**: FastAPI backend dengan concurrent request handling
- **Responsive Design**: Full responsive design dengan Tailwind CSS
- **Graceful Degradation**: Error handling yang robust ketika Gemini API tidak tersedia
- **Cross-Platform**: Berjalan di CPU dan GPU (CUDA/ROCm)
- **Production Ready**: Structured logging, error tracking, CORS middleware

---

## Tech Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | 0.136.3 |
| ML Engine | PyTorch (TorchScript) | 2.12.0 |
| LLM Integration | Google GenAI SDK | 2.7.0 |
| Image Processing | Pillow | 12.2.0 |
| Vision Model | TorchVision | 0.27.0 |
| ASGI Server | Uvicorn | 0.48.0 |
| Environment | python-dotenv | 1.2.2 |
| Request Parsing | python-multipart | 0.0.29 |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.2.5 |
| UI Library | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Markup Rendering | React Markdown | 10.1.0 |
| Code Quality | ESLint | 9.x |

---

## Instalasi

### 1. Clone/Setup Proyek

```bash
# Jika menggunakan git
git clone <repository-url>
cd UAS-LAB-ML

# Jika sudah ada folder, navigasi ke dalamnya
cd UAS-LAB-ML
```

### 2. Setup Backend

#### Step 1: Navigasi ke folder backend
```bash
cd backend
```

#### Step 2: Buat Virtual Environment
```bash
# Windows
python -m venv env
env\Scripts\activate

# macOS/Linux
python3 -m venv env
source env/bin/activate
```

#### Step 3: Install Dependencies
```bash
pip install -r requirement.txt
```

**Output yang diharapkan:**
```
Successfully installed fastapi-0.136.3 uvicorn-0.48.0 torch-2.12.0 ...
```

#### Step 4: Konfigurasi Environment Variables
Buat file `.env` di folder `backend/`:
```env
GEMINI_API_KEY=your_api_key_here_paste_without_quotes
```

**Catatan:** File `.env` sudah di-ignore oleh git untuk keamanan.


### 3. Setup Frontend

#### Step 1: Navigasi ke folder frontend
```bash
cd ../frontend
```

#### Step 2: Install Dependencies
```bash
npm install
```

**Output yang diharapkan:**
```
added XXX packages in X.XXs
```

#### Step 3: Verifikasi Setup Frontend
```bash
npm run build
```

---

## Cara Menjalankan

### Menjalankan Backend (Terminal 1)

```bash
# Navigate to backend folder jika belum
cd backend

# Aktifkan virtual environment (jika belum aktif)
# Windows: env\Scripts\activate
# macOS/Linux: source env/bin/activate

# Jalankan server
uvicorn main:app --reload
```

**Expected Output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

**Test Backend:**
```bash
# Buka terminal baru dan test API
curl http://127.0.0.1:8000/

# Output yang diharapkan:
{"status":"LensArthropoda API is running"}
```

### Menjalankan Frontend (Terminal 2)

```bash
# Navigate to frontend folder
cd frontend

# Jalankan dev server
npm run dev
```

**Expected Output:**
```
- Local:        http://localhost:3000
```

### Akses Aplikasi

1. **Frontend:** Buka http://localhost:3000 di browser
2. **API Docs:** Buka http://127.0.0.1:8000/docs untuk Swagger UI
3. **API ReDoc:** Buka http://127.0.0.1:8000/redoc untuk ReDoc UI

---

## Struktur Proyek

```
UAS-LAB-ML/
│
├── backend/                         # FastAPI Backend
│   ├── artifacts/
│   │   ├── model_traced.pt         # PyTorch TorchScript model (118 classes)
│   │   └── model_metadata.json     # Class names dan config
│   ├── env/                         # Virtual environment
│   ├── main.py                      # FastAPI app entry point
│   ├── ml_service.py               # Model inference logic
│   ├── gemini_service.py           # Google Gemini API integration
│   ├── requirement.txt             # Python dependencies
│   ├── .env.example                # Environment variables template
│   └── .gitignore                  # Git ignore untuk backend
│
├── frontend/                        # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx                # Main page component
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   └── ResultCard.tsx          # Result display component
│   ├── public/                     # Static assets
│   ├── package.json                # NPM dependencies
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.ts          # Tailwind CSS config
│   ├── next.config.ts              # Next.js config
│   └── .gitignore                  # Git ignore untuk frontend
│
├── files/                          # Data/files folder (if needed)
├── .gitignore                      # Root git ignore
├── README.md                       # This file
└── .git/                           # Git repository

```

---

## Model Information

### Model Metadata
```json
{
  "model_name": "efficientnet_b3",
  "num_classes": 118,
  "input_size": 300,
  "framework": "PyTorch",
  "format": "TorchScript (model_traced.pt)"
}
```

### Supported Insect Classes (118 total)
- Ants, Bees, Butterflies, Beetles, Dragonflies
- Grasshoppers, Wasps, Flies, Mosquitoes
- Spiders, Centipedes, Millipedes
- Dan 106 spesies lainnya...

### Model Performance
- **Architecture:** EfficientNet B3
- **Framework:** PyTorch 2.12
- **Input Resolution:** 300x300 pixels
- **Output:** Top-3 predictions dengan confidence scores

---