# Development environment for rsvelte_core
# Pinned Rust toolchain — keep in sync with the CI pin (dtolnay `toolchain:`
# input in .github/workflows/*.yml). Both are Renovate-managed.
FROM rust:1.97.1-bookworm

# Install Node.js 22.x and pnpm
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install wasm-pack for WASM builds
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# Install rustfmt/clippy components and the wasm target for WASM builds.
# The toolchain version itself is fixed by the base image tag above.
RUN rustup component add rustfmt clippy \
    && rustup target add wasm32-unknown-unknown

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
