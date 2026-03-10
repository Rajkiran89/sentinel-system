package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
)

func main() {
	// Changed route to /ingest to match your React fetch call
	http.HandleFunc("/ingest", handleAnalyze)

	fmt.Println("🌐 Gateway (Direct Mode) live on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handleAnalyze(w http.ResponseWriter, r *http.Request) {
	// 1. ADD CORS HEADERS (Fixes "Failed to Fetch")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle Preflight request
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Use POST", http.StatusMethodNotAllowed)
		return
	}

	// 2. Read the body from React
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Error reading request", http.StatusInternalServerError)
		return
	}

	// 3. Forward to Python AI Service
	resp, err := http.Post("http://localhost:8000/predict", "application/json", bytes.NewBuffer(body))
	if err != nil {
		fmt.Println("❌ AI Service (Port 8000) is offline")
		http.Error(w, "AI Service is offline", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	// 4. Return result to React
	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)

	fmt.Println("✅ Request successfully processed")
}
