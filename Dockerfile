FROM eliza-base

WORKDIR /app
# Install runtime dependencies if needed
RUN npm install -g pnpm@9.4.0 && \
    apt-get update && \
    apt-get install -y git python3 python3-pip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install fastembed with required dependencies
RUN cd agent && pip3 install fastembed --break-system-packages && pnpm add fastembed

COPY packages/* ./packages/

# Set the command to run the application
CMD ["pnpm", "start"]