# 🛡️ Sentinel | Distributed Fraud Detection System

A high-performance, multilingual microservices architecture designed to detect fraudulent transactions in real-time.

## 🚀 The Architecture
This project demonstrates a "Direct Mode" microservices bridge:
- **Frontend:** Next.js (React) Dashboard for live visualization.
- **Gateway:** Go (Golang) service handling high-concurrency API requests.
- **AI Engine:** Python (FastAPI) service running fraud detection logic.



## 🛠️ Tech Stack
- **Languages:** Go, Python, TypeScript
- **Frameworks:** FastAPI, Next.js
- **Communication:** RESTful APIs with CORS-enabled security

## 🚥 How to Run
1. **AI Service:** `cd services/ai-service && venv\Scripts\activate && python main.py`
2. **Gateway:** `cd services/gateway && go run main.go`
3. **Dashboard:** `cd services/dashboard && npm run dev`