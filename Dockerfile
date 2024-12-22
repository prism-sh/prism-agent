FROM node:22.3.0-slim

# Install system dependencies first
RUN apt-get update && \
    apt-get install -y \
    git \
    python3 \
    make \
    g++ \
    gcc \
    libtool \
    autoconf \
    automake \
    pkg-config \
    libopus-dev \
    opus-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set Python 3 as the default python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Install global npm packages
RUN npm install -g pnpm@9.4.0
RUN npx -y playwright@1.49.1 install --with-deps chromium

WORKDIR /app

# Copy dependency files first
COPY package.json pnpm-lock.yaml* tsconfig.json ./

# Install dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy source code last
COPY src/ src/

EXPOSE 3000
ENV NODE_ENV=production

CMD ["pnpm", "start", "--character=/app/character.json"]