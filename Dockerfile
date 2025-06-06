# Dockerfile pour une application Flask avec dépendances scientifiques
# 
# Nous utilisons une image Python officielle qui inclut déjà les outils de développement
# nécessaires pour compiler pandas et numpy
#
FROM python:3.11-slim

# Installation des packages nécessaires pour la compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    make \
    && rm -rf /var/lib/apt/lists/*

# Création du répertoire pour l'application
WORKDIR /app

# Installation des dépendances Python
RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    pandas \
    scikit-learn \
    numpy \
    python-multipart \
    mysql-connector-python

# Copie du code de l'application
COPY . .

# Exposition du port de l'application
EXPOSE 5000

# Exécution de l'application
CMD ["python", "app.py"]