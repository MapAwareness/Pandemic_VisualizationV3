#  uvicorn main:app 

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import uvicorn
from model import PandemicPredictor
from data_preprocessing import preprocess_data
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

corona_predictor = PandemicPredictor()
variole_predictor = PandemicPredictor()

corona_df, variole_df = preprocess_data()

corona_score = corona_predictor.train(corona_df)
variole_score = variole_predictor.train(variole_df)

class PredictionRequest(BaseModel):
    disease: str  
    year: int
    month: int
    current_cases: float
    active_cases: float

@app.get("/")
def read_root():
    return {"message": "Pandemic Prediction API"}

@app.post("/predict")
def predict_cases(request: PredictionRequest):
    try:
        features = [[
            request.year,
            request.month,
            request.current_cases,
            request.active_cases
        ]]
        
        if request.disease == 'corona':
            prediction = corona_predictor.predict(features)
        elif request.disease == 'variole':
            prediction = variole_predictor.predict(features)
        else:
            raise HTTPException(status_code=400, detail="Disease must be 'corona' or 'variole'")
        
        return {
            "prediction": float(prediction[0]),
            "model_accuracy": float(corona_score if request.disease == 'corona' else variole_score)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-total-cases")
def predict_total_cases(request: PredictionRequest):
    try:
        print(f"Requête reçue : {request}") 
        if request.disease == 'corona':
            data = corona_df
            predictor = corona_predictor
        elif request.disease == 'variole':
            data = variole_df
            predictor = variole_predictor
        else:
            raise HTTPException(status_code=400, detail="Disease must be 'corona' or 'variole'")


        data["date"] = pd.to_datetime(data["date"])
        last_known_date = data["date"].max()
        last_known_row = data.loc[data["date"] == last_known_date]

        if last_known_row.empty:
            raise HTTPException(status_code=404, detail="No data available for the last known date.")

        
        last_known_total_cases = last_known_row["cumulative_total_cases"].iloc[0]

   
        current_date = last_known_date
        target_date = pd.Timestamp(year=request.year, month=request.month, day=1)
        cumulative_total_cases = last_known_total_cases

        while current_date < target_date:
            features = [[
                current_date.year,
                current_date.month,
                request.current_cases,
                request.active_cases
            ]]
            daily_new_cases = predictor.predict(features)[0]
            cumulative_total_cases += daily_new_cases
            current_date += pd.Timedelta(days=1)

        print(f"Prédiction calculée : {cumulative_total_cases}")  
        return {
            "cumulative_total_cases": cumulative_total_cases,
            "model_accuracy": float(corona_score if request.disease == 'corona' else variole_score)
        }
    except Exception as e:
        print(f"Erreur : {e}")  
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/model-info")
def get_model_info():
    return {
        "corona_model_accuracy": float(corona_score),
        "variole_model_accuracy": float(variole_score)
    }

corona_data, variole_data = preprocess_data()

@app.get("/api/processed-data")
def get_processed_data(page: int = 1, page_size: int = 100):
    try:
        start = (page - 1) * page_size
        end = start + page_size
        corona_paginated = corona_data.iloc[start:end].to_dict(orient="records")
        variole_paginated = variole_data.iloc[start:end].to_dict(orient="records")
        return {
            "corona": corona_paginated,
            "variole": variole_paginated,
            "total_corona": len(corona_data),
            "total_variole": len(variole_data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
