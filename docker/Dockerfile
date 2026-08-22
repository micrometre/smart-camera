# Backend server stage
FROM node:22-alpine AS backend

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy server files
COPY server.js ./

# Create public directory structure (will be mounted as volume)
RUN mkdir -p public

# Expose backend port
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]

# Frontend stage (static files)
FROM node:22-alpine AS frontend

WORKDIR /app

# Install a simple static file server
RUN npm install -g serve

# Copy HTML files
COPY index.html ./
COPY landing.html ./
COPY dashboard.html ./

# Copy public directory
COPY public ./public

# Expose port
EXPOSE 8080

# Serve the current directory
CMD ["serve", ".", "-l", "8080"]
