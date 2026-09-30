#!/bin/sh
# Runs the performance ratchet in the CI runner's environment (tools/perf/Dockerfile), with
# instruction counts: `tools/perf/linux.sh` checks, `tools/perf/linux.sh --update` records.
#
# The container builds a snapshot of the sources as staged (the index) when this starts: what is
# measured is what the next commit holds, and the working tree can be edited meanwhile. With
# --update the snapshot's baseline is copied back (stage it too). The fixtures are mounted
# read-only, the host's cargo registry is mounted (the build is --offline), and the Linux build has
# a target directory of its own.
set -eu
root=$(cd "$(dirname "$0")/../.." && pwd)
work="$root/target/linux"
rm -rf "$work/src"
mkdir -p "$work/src" "$work/target"
git -C "$root" ls-files -z -- Cargo.toml Cargo.lock rust-toolchain.toml crates tools/perf \
  | xargs -0 git -C "$root" checkout-index --force --prefix="$work/src/" --
docker build -q -t rsv-perf "$root/tools/perf" >/dev/null
docker run --rm \
  -v "$work/src:/w" \
  -v "$root/fixtures:/w/fixtures:ro" \
  -v "$work/target:/w/target" \
  -v "${CARGO_HOME:-$HOME/.cargo}/registry:/root/.cargo/registry" \
  rsv-perf node tools/perf/bin/perf.ts --instructions "$@"
case " $* " in
  *" --update "*) cp "$work/src/tools/perf/baseline.json" "$root/tools/perf/baseline.json" ;;
esac
