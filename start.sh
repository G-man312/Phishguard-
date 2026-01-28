#!/bin/sh
if [ -z "$PORT" ]; then
  export PORT=5000
fi
exec gunicorn --bind 0.0.0.0:$PORT app:app --workers 2
