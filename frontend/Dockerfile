FROM node:20-alpine

WORKDIR /app

# Install dependencies first (caching layer)
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build step is optional if running dev mode in Docker, but we'll run dev for simplicity.
# For production, we would use Nginx.

EXPOSE 5173

# Expose Vite on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
