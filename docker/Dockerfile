# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY index.html ./
COPY src ./src
COPY public ./public

# Build the Vite app
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install a simple static file server
RUN npm install -g serve

# Copy built assets from builder
COPY --from=builder /app/dist ./dist

# Expose port (will be proxied through nginx)
EXPOSE 3000

# Serve the dist folder
CMD ["serve", "-s", "dist", "-l", "3000"]
