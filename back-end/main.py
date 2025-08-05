from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import numpy as np
import os
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Load model
BASE_DIR = os.path.dirname(__file__)
model_path = os.path.join(BASE_DIR, "model.joblib")
model = joblib.load(model_path)

# Input schema
class MortgageData(BaseModel):
    fico: float
    mi_pct: float
    dti: float
    orig_upb: float
    cltv: float
    int_rt: float
    orig_loan_term: int
    cnt_units: int
    flag_fthb: str
    occpy_sts: str
    loan_purpose: str
    cnt_borr: int
    prop_type: str
    metro: bool

# FastAPI app
app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",                    # local dev
        "https://alexkneale.github.io",            # GitHub Pages
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Predict endpoint
@app.post("/predict")
def predict(data: MortgageData):
    df = pd.DataFrame([data.dict()])
    prediction = model.predict(df)[0]
    return {"default_prediction": int(prediction)}

# Entry point for Render
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
