package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"os" // Required for os.Getenv
)

func main() {
	// Matches the /ingest call from your React frontend
	http.HandleFunc("/ingest", handleAnalyze)

	// In the cloud, Render provides the PORT variable. Locally, we use 8080.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🌐 Gateway live on port %s\n", port)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, nil))
}

func handleAnalyze(w http.ResponseWriter, r *http.Request) {
	// CORS Headers - Allow your Vercel frontend to talk to this Gateway
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Use POST", http.StatusMethodNotAllowed)
		return
	}

	// 1. Get the AI Service URL from the Environment Variable you set on Render
	aiServiceURL := os.Getenv("AI_SERVICE_URL")
	if aiServiceURL == "" {
		// Fallback for when you are testing on your own computer
		aiServiceURL = "http://localhost:8000"
	}

	body, _ := io.ReadAll(r.Body)

	// 2. Forward the request to the dynamic URL
	fmt.Printf("🔍 Forwarding to: %s/predict\n", aiServiceURL)
	resp, err := http.Post(aiServiceURL+"/predict", "application/json", bytes.NewBuffer(body))
	if err != nil {
		fmt.Println("❌ Error reaching AI Service:", err)
		http.Error(w, "AI Service is offline", http.StatusServiceUnavailable)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}
