#!/bin/sh
echo "Starting Gunicorn on port 5000 (Railway default)"
exec gunicorn --bind 0.0.0.0:5000 app:app --workers 2
