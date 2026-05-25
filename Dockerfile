# Development environment for svelte-compiler-rust
FROM rust:1.95-bookworm

# Install Node.js 22.x and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install wasm-pack for WASM builds
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install Rust nightly for edition 2024 support
# Note: edition 2024 and rust-version 1.90 require nightly as of early 2025
RUN rustup default nightly \
    && rustup component add rustfmt clippy

# Install additional development tools
RUN apt-get update && apt-get install -y \
    git \
    vim \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Default command
CMD ["bash"]
