# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files first to leverage cache
COPY package.json package-lock.json ./

# Install dependencies (using npm ci for deterministic builds)
RUN npm ci

# Copy the rest of the application source
COPY . .

# Build the application
# Note: Docusaurus outputs to 'build/' by default
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy the built artifacts from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
