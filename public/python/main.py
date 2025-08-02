from fastapi import FastAPI, Request
from pydantic import BaseModel
import joblib
import numpy as np
import os
from fastapi.middleware.cors import CORSMiddleware

# Get the directory of this script
BASE_DIR = os.path.dirname(__file__)

# Join with model filename
model_path = os.path.join(BASE_DIR, "model.joblib")

# Load the model
model = joblib.load(model_path)

# Define the expected input schema
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

app = FastAPI()

origins = [
    "http://localhost:5173",  # your frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,        # allow this origin only (you can use ["*"] to allow all, but less secure)
    allow_credentials=True,
    allow_methods=["*"],          # allow all HTTP methods (GET, POST, etc)
    allow_headers=["*"],          # allow all headers
)

@app.post("/predict")
def predict(data: MortgageData):
    # Convert data to DataFrame format
    input_data = [data.dict()]
    
    import pandas as pd
    df = pd.DataFrame(input_data)

    # Predict
    prediction = model.predict(df)[0]
    return {"default_prediction": int(prediction)}
