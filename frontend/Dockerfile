# Stage 1: Build the React app
FROM node:lts-alpine AS builder

WORKDIR /app

# Define build args
ARG VITE_APP_URL

ENV VITE_API_URL=${VITE_APP_URL}
# Copy package files
COPY package*.json ./

RUN echo "VITE_APP_URL=${VITE_APP_URL}" > .env
# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# # Stage 2: Serve with lightweight nginx
# FROM nginx:alpine

# # Copy built assets
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy nginx config to serve SPA (handles client-side routing)
# # COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Expose port
# EXPOSE 80

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]