# Deploying `ml-backend` to Fly.io

This file contains quick steps to deploy the Flask ML backend to Fly.io using the repository you connected.

1) Commit & push these files to the GitHub repository you connected to Fly.

   ```bash
   git add ml-backend/Dockerfile ml-backend/.dockerignore ml-backend/DEPLOY_TO_FLY.md
   git commit -m "Add Dockerfile and deployment notes for Fly.io"
   git push origin main
   ```

2) In Fly.io web UI: select the GitHub repository and the branch you pushed (e.g. `main`).
   - If your repo root contains the whole project, set "Current Working Directory" to the repository root (leave blank).
   - If `ml-backend` is the subfolder you want to deploy, set "Current Working Directory" to `ml-backend`.
   - Fly will detect the `Dockerfile` and build the container.

3) Alternatively, use `flyctl` locally (recommended for more control):

   - Install `flyctl`: https://fly.io/docs/hands-on/install-flyctl/

   - Login and create an app (from repo root):
     ```bash
     flyctl auth login
     cd ml-backend
     flyctl launch --name phishguard --region iad
     ```

   - Deploy:
     ```bash
     flyctl deploy
     ```

4) After deploy, Fly will provide an HTTPS URL (e.g. `https://phishguard.fly.dev`).
   - Update `ML_API_URL` in `background.js` and `popup.js` to `https://<your-app>.fly.dev/predict` and `/report` accordingly.

5) Notes:
   - Ensure `ml-backend/requirements.txt` includes all dependencies (Flask, gunicorn, scikit-learn, joblib, bs4, requests, pandas, flask-cors, etc.).
   - If your model file `phishguard_model.pkl` is large or you prefer persistence, consider storing model and reports in a volume or object storage. Fly has persistent volumes but may require paid plan.
   - For quick testing you can keep using `localhost` with an ngrok tunnel, but Fly provides a persistent HTTPS endpoint.
