#!/bin/sh
# Runs the performance ratchet in the CI runner's environment (tools/performance/Dockerfile), with
# instruction counts: `tools/performance/linux.sh` checks, `tools/performance/linux.sh --update` records.
#
# The container builds a snapshot of the sources and the fixtures as staged (the index) when this
# starts: what is measured is what the next commit holds, as CI's clean checkout does, and the
# working tree can be edited meanwhile. (Loading walks the fixture tree, so outputs a local run
# left in it would count.) With --update the snapshot's baseline is copied back (stage it too).
# The host's cargo registry is mounted (the build is --offline), and the Linux build has a target
# directory of its own.
set -eu
root=$(cd "$(dirname "$0")/../.." && pwd)
work="$root/target/linux"
rm -rf "$work/src"
mkdir -p "$work/src" "$work/target"
git -C "$root" ls-files -z -- Cargo.toml Cargo.lock rust-toolchain.toml crates tools/performance fixtures \
  | xargs -0 git -C "$root" checkout-index --force --prefix="$work/src/" --
docker build -q -t rsvelte-performance "$root/tools/performance" >/dev/null
docker run --rm \
  -v "$work/src:/w" \
  -v "$work/target:/w/target" \
  -v "${CARGO_HOME:-$HOME/.cargo}/registry:/root/.cargo/registry" \
  rsvelte-performance node tools/performance/bin/performance.ts --instructions "$@"
case " $* " in
  *" --update "*) cp "$work/src/tools/performance/baseline.json" "$root/tools/performance/baseline.json" ;;
esac
