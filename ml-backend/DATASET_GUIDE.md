# Phishing Dataset Guide

## Where to Download Datasets

### Option 1: Kaggle (Recommended - Most Up-to-Date) ⭐
**URL:** https://www.kaggle.com/datasets

**Search for:**
- "phishing URLs"
- "phishing websites"
- "malicious URLs"
- "phishing dataset"

**Good Kaggle Datasets:**
- Phishing URLs Dataset
- Malicious and Benign URLs
- Phishing Website Detection

**Steps:**
1. Create a free Kaggle account (if needed)
2. Search for "phishing URLs" or similar
3. Download the dataset (CSV format)
4. If multiple files, use the one with URLs
5. Save as `phishing_urls.csv` in `ml-backend` folder

**Pro Tip:** Look for datasets with:
- Recent upload dates (last 1-2 years)
- Large number of samples (1000+ URLs)
- Good ratings/reviews

---

### Option 2: UCI Machine Learning Repository
**URL:** https://archive.ics.uci.edu/dataset/327/phishing

**Steps:**
1. Visit the link above
2. Download the dataset (usually named `PhishingWebsites.csv` or similar)
3. Save it as `phishing_urls.csv` in the `ml-backend` folder

**Expected Format:**
- CSV file with a column named `url` (or we can rename it)
- May have other columns, that's fine - we only use the URL column

---

### Option 3: PhishTank
**URL:** https://www.phishtank.com/developer_info.php

**Steps:**
1. Create a free account on PhishTank
2. Get API access or download the data dump
3. Export to CSV with a `url` column
4. Save as `phishing_urls.csv` in `ml-backend` folder

---

### Option 4: Mendeley Dataset
**URL:** https://data.mendeley.com/datasets/n96ncsr5g4/1

**Steps:**
1. Download the dataset
2. Extract and find the CSV with URLs
3. Ensure it has a column named `url`
4. Save as `phishing_urls.csv` in `ml-backend` folder

---

## File Placement

```
phish-guard/
  └── ml-backend/
      ├── phishing_urls.csv    ← Place downloaded file here
      ├── collect_data.py
      ├── train_model.py
      └── app.py
```

---

## Required CSV Format

Your CSV file should look like this:

```csv
url
https://phishing-site1.com
http://malicious-site.net/login
https://fraud.example.com/verify
...
```

**Important:**
- Must have a column named `url` (case-insensitive)
- Each row should have a valid URL
- Can have other columns (they'll be ignored)

---

## After Downloading

1. **Place the file:**
   - Save as `phishing_urls.csv` in `ml-backend` folder

2. **Verify it works:**
   ```bash
   cd ml-backend
   python collect_data.py --use-datasets
   ```

3. **Retrain the model:**
   ```bash
   python train_model.py
   ```

4. **Restart Flask server:**
   ```bash
   python app.py
   ```

---

## Quick Test

If you're not sure about the format, you can check:

```python
import pandas as pd
df = pd.read_csv('phishing_urls.csv')
print("Columns:", df.columns.tolist())
print("First few URLs:")
print(df.head())
```

The column containing URLs should be named `url` (case doesn't matter).

