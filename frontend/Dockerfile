FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY vite.config.js ./

# Install dependencies
RUN npm install

# Copy source files
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve for static file serving
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start command
CMD ["serve", "-s", "dist", "-l", "3000"]

