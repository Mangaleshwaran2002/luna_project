# Use Node.js LTS image
FROM node:lts-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port (used internally, mapped via docker-compose)
EXPOSE 5000

# Create uploads directory (if not exists in repo)
RUN mkdir -p uploads

# Start the server
CMD ["node", "server.js"]