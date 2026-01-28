#!/bin/sh
echo "PORT is: $PORT"
if ! echo "$PORT" | grep -Eq '^[0-9]+$'; then
  echo "Invalid or missing PORT, defaulting to 5000"
  PORT=5000
fi
exec gunicorn --bind 0.0.0.0:$PORT app:app --workers 2
