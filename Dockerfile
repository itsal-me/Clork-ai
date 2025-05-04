# --------- Stage 1: Frontend Build ---------
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm install && npm run build

# --------- Stage 2: Backend (Django) ---------
FROM python:3.10-slim

# Set environment vars
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Working directory
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy backend code
COPY backend/ ./

# Copy built frontend files (optional: served by Django manually or via nginx)
COPY --from=frontend-build /app/frontend/dist /app/frontend_dist/


# Start Gunicorn server
CMD ["sh", "-c", "python manage.py makemigrations && python manage.py migrate && exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000"]
