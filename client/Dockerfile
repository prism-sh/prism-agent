# Build stage
FROM --platform=$BUILDPLATFORM node:20-alpine as build

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM caddy:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/caddy

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Expose port 80
EXPOSE 80


# Start Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
