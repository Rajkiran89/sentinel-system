from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.post("/predict")
async def predict(data: dict):
    print(f"🔍 Analyzing transaction: {data}")
    amount = data.get("amount", 0)
    is_fraud = amount > 1000
    return {
        "status": "success",
        "is_fraud": is_fraud, 
        "score": 0.99 if is_fraud else 0.01,
        "message": "High risk!" if is_fraud else "Transaction safe"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)