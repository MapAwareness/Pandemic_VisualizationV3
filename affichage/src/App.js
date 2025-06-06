import React, { useState } from 'react';
import './App.css';

function App() {
  // States pour les inputs et les résultats
  const [disease, setDisease] = useState('corona');
  const [year, setYear] = useState(2024);
  const [month, setMonth] = useState(6);
  const [currentCases, setCurrentCases] = useState(100);
  const [activeCases, setActiveCases] = useState(50);
  const [prediction, setPrediction] = useState(null);
  const [totalCases, setTotalCases] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  // Appel à /predict
  const handlePredict = async () => {
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease,
        year: Number(year),
        month: Number(month),
        current_cases: Number(currentCases),
        active_cases: Number(activeCases)
      })
    });
    const data = await response.json();
    setPrediction(data);
  };

  // Appel à /predict-total-cases
  const handlePredictTotalCases = async () => {
    const response = await fetch('http://localhost:8000/predict-total-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        disease,
        year: Number(year),
        month: Number(month),
        current_cases: Number(currentCases),
        active_cases: Number(activeCases)
      })
    });
    const data = await response.json();
    setTotalCases(data);
  };

  // Appel à /model-info
  const handleGetModelInfo = async () => {
    const response = await fetch('http://localhost:8000/model-info');
    const data = await response.json();
    setModelInfo(data);
  };

  // Appel à /api/processed-data
  const handleGetProcessedData = async () => {
    const response = await fetch('http://localhost:8000/api/processed-data?page=1&page_size=5');
    const data = await response.json();
    setProcessedData(data);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Pandemic Prediction Demo</h2>
        <div>
          <label>
            Disease:
            <select value={disease} onChange={e => setDisease(e.target.value)}>
              <option value="corona">Corona</option>
              <option value="variole">Variole</option>
            </select>
          </label>
          <label>
            Year:
            <input type="number" value={year} onChange={e => setYear(e.target.value)} />
          </label>
          <label>
            Month:
            <input type="number" value={month} onChange={e => setMonth(e.target.value)} min="1" max="12" />
          </label>
          <label>
            Current Cases:
            <input type="number" value={currentCases} onChange={e => setCurrentCases(e.target.value)} />
          </label>
          <label>
            Active Cases:
            <input type="number" value={activeCases} onChange={e => setActiveCases(e.target.value)} />
          </label>
        </div>
        <div style={{ margin: '10px' }}>
          <button onClick={handlePredict}>Predict Cases</button>
          <button onClick={handlePredictTotalCases}>Predict Total Cases</button>
          <button onClick={handleGetModelInfo}>Get Model Info</button>
          <button onClick={handleGetProcessedData}>Get Processed Data</button>
        </div>
        {prediction && (
          <div>
            <h4>Prediction</h4>
            <pre>{JSON.stringify(prediction, null, 2)}</pre>
          </div>
        )}
        {totalCases && (
          <div>
            <h4>Total Cases Prediction</h4>
            <pre>{JSON.stringify(totalCases, null, 2)}</pre>
          </div>
        )}
        {modelInfo && (
          <div>
            <h4>Model Info</h4>
            <pre>{JSON.stringify(modelInfo, null, 2)}</pre>
          </div>
        )}
        {processedData && (
          <div>
            <h4>Processed Data (page 1, 5 items)</h4>
            <pre>{JSON.stringify(processedData, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;