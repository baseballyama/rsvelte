#!/bin/sh
# Runs the performance ratchet in the CI runner's environment (tools/perf/Dockerfile), with
# instruction counts: `tools/perf/linux.sh` checks, `tools/perf/linux.sh --update` records.
# The host's cargo registry is mounted (the build is --offline) and the Linux build gets a target
# directory of its own, so neither side's artifacts are rebuilt by the other.
set -eu
root=$(cd "$(dirname "$0")/../.." && pwd)
docker build -q -t rsv-perf "$root/tools/perf" >/dev/null
mkdir -p "$root/target/linux"
exec docker run --rm \
  -v "$root:/w" \
  -v "$root/target/linux:/w/target" \
  -v "${CARGO_HOME:-$HOME/.cargo}/registry:/root/.cargo/registry" \
  rsv-perf node tools/perf/bin/perf.ts --instructions "$@"
