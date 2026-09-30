# The CI runner's environment (ubuntu-24.04, the pinned Rust, Node 26, valgrind), for recording the
# instruction baseline locally: `tools/perf/linux.sh [--update]` (python3 is for cg_annotate).
FROM ubuntu:24.04
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl build-essential git python3 valgrind xz-utils \
 && rm -rf /var/lib/apt/lists/*
ARG RUST=1.98.1
RUN curl -sSf https://sh.rustup.rs | sh -s -- -y --profile minimal --default-toolchain "$RUST"
ARG NODE=26.7.0
RUN arch=$(dpkg --print-architecture | sed s/amd64/x64/) \
 && curl -fsSL "https://nodejs.org/dist/v$NODE/node-v$NODE-linux-$arch.tar.xz" | tar -xJ -C /usr/local --strip-components=1
ENV PATH=/root/.cargo/bin:$PATH
WORKDIR /w
