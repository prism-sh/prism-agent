# Use the same base image as in devcontainer.json
FROM mcr.microsoft.com/devcontainers/universal:2

# Install dependencies (curl, git, etc.) if needed:
RUN apt-get update && \
    apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install -y golang-go

# --- Install ctlptl ---
RUN go install github.com/tilt-dev/ctlptl/cmd/ctlptl@latest

# --- Install Kind ---
# For AMD64 / x86_64
RUN [ $(uname -m) = x86_64 ] && \
    curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.26.0/kind-linux-amd64 || true
# For ARM64
RUN [ $(uname -m) = aarch64 ] && \
    curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.26.0/kind-linux-arm64 || true

RUN chmod +x ./kind && mv ./kind /usr/local/bin/kind

# --- Install Tilt ---
RUN curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash