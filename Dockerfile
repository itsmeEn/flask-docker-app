FROM python:3.9-slim-bullseye

# Create a non-root user
RUN useradd -m -r -u 1001 appuser

WORKDIR /app

# Install security updates and clean up
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ .
COPY frontend/ /app/frontend/

# Set proper permissions
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

ENV MONGO_URI=mongodb://mongo:27017/
ENV JWT_SECRET_KEY=your-secret-key-here
ENV FLASK_APP=main.py
ENV FLASK_ENV=development

EXPOSE 5000

CMD ["python", "main.py"]