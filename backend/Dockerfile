# Start from a lightweight Debian-based Node runtime
FROM node:18-slim

# Install openssl for Prisma (Required by Debian slim)
RUN apt-get update -y && apt-get install -y openssl

# Use production metadata
LABEL version="1.0" description="Inventora Backend API"

# Set internal directory
WORKDIR /app

# Copy dependency files and install
COPY package*.json ./
RUN npm install --omit=dev

# Include Prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code and expose API port
COPY . .
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
