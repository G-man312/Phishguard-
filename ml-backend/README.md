# PhishGuard ML Backend

## Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Collect Training Data (Optional - for retraining)
```bash
python collect_data.py
```

### 3. Train Model (if you collected new data)
```bash
python train_model.py
```

### 4. Start Flask API Server
```bash
python app.py
```

The API will run at: `http://localhost:5000`

## API Endpoints

### `POST /predict`
Predict if a URL is suspicious.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "suspicious": true,
  "probability": 0.85,
  "prediction": 1,
  "features": {...},
  "url": "https://example.com"
}
```

### `GET /health`
Check if the server and model are loaded.

### `GET /`
API information.

## Integration with Chrome Extension

The Chrome extension (`background.js`) will automatically call the ML API for suspicious/unknown URLs.

**To disable ML predictions:**
Set `ML_ENABLED = false` in `background.js`

**To change API URL:**
Update `ML_API_URL` in `background.js`

## Adding Real Datasets

1. Download phishing datasets from:
   - UCI: https://archive.ics.uci.edu/dataset/327/phishing
   - Mendeley: https://data.mendeley.com/datasets/n96ncsr5g4/1

2. Save as `phishing_urls.csv` in this folder

3. Run with datasets:
   ```bash
   python collect_data.py --use-datasets
   ```

4. Retrain:
   ```bash
   python train_model.py
   ```


