# Base image
FROM node:20 AS build
# Set working directory
WORKDIR /app

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy source code
COPY . .
# Copy .env file
COPY .env .env
# Build the app
RUN npm run build

# Production image
FROM nginx:alpine
# Copy built app from the previous stage
COPY --from=build /app/dist /usr/share/nginx/html
# Expose port
EXPOSE 80

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Debug step to check if entrypoint.sh is present and has correct permissions
RUN ls -l /entrypoint.sh

ENTRYPOINT ["/bin/sh", "/entrypoint.sh"]
