# Frontend Dockerfile for React + Vite application
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 5000

# Run Vite dev server
CMD ["npm", "run", "dev"]
