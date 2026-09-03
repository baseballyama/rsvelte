# Profile-guided optimization

`rsvelte.profdata` is the LLVM profile the shipped compiler is built with. It is
checked in rather than generated during a release because a profile generated on
the release runner would make the published binary a function of that run, and
because the training set needs corpus submodules a release job does not check
out.

## What it buys

Measured on the held-out slice (training `--skip 0`, evaluation `--skip 1` at the
same `--limit`, so the two file sets share no file), ten ABBA passes of 31 runs
each, both arms rebuilt from one tree, on a quiesced box. Each cell pairs the two
arms inside one time window and reports the median paired ratio; `wins` counts
the pairs favouring PGO out of 20 (10 passes × {median, min}).

| surface | parallel | wins | sign p | published | projected |
|---|---|---|---|---|---|
| client | 1.100x | 16/20 | 0.012 | 17.22x | 18.94x |
| server | 1.111x | 17/20 | 0.003 | 20.42x | 22.69x |
| client-dev | 1.139x | 17/20 | 0.003 | 14.63x | 16.67x |
| server-dev | 1.110x | 18/20 | 0.0004 | 19.64x | 21.80x |

Single-threaded, on the same arms: client 1.128x, server 1.103x, client-dev
1.119x, server-dev 1.107x — within-arm spread under 1.5%, so those four are
decidable on their own. `parse` measured 1.09-1.16x and `svelte2tsx` 1.02x, both
at n=6 and neither significant; they are here to show the two tasks added to the
training set do not *regress*, which is the risk the training set exists to
remove.

The projected column is the published number times the measured ratio. It is a
projection, not a measurement: the report re-measures on its own corpus.

## What it is NOT applied to

CI gate builds, and the formatter / linter / checker binaries.

`-Cprofile-use` treats a function with no counters as never executed, so handing
a profile to code it never trained on makes that code *colder* rather than merely
un-improved. The training set in `scripts/perf/pgo.sh` is therefore exactly the
set of workloads the flag is later applied to — the four compile surfaces plus
`parse` and `svelte2tsx` — and **adding a workload there and adding a build to
the PGO list are one change, not two.**

Gate builds are excluded for a different reason: `-Cprofile-use` roughly triples
the link time of a fat-LTO release build, this repository is already near its
Actions concurrency ceiling, and a gate compares outputs, which PGO does not
change (every arm above produced a byte-identical `sink`).

Cargo has no per-profile `rustflags` on stable — `-Zprofile-rustflags` is
nightly-only — so "release builds get PGO" cannot be written in
`[profile.release]`. It is set per workflow instead, and this file plus
`scripts/perf/pgo.sh` are where the design lives.

## The failure mode the guard exists for

rustc treats the two ways this can go wrong differently, and only one is loud. A
**missing** `-Cprofile-use` path is a hard error. A **corrupt or truncated** one
is a *warning*, and the build then succeeds and ships a binary with no profile
applied — a failure whose output is shaped exactly like success.
`scripts/perf/assert-pgo-profile.sh` runs before every shipped build and checks
the file's indexed-profile magic; it has both controls (a random file and an
empty file must fail it).

## Regenerating

```
scripts/perf/pgo.sh
```

A profile that is stale relative to the source degrades silently and correctly:
LLVM matches entries by function hash and ignores the ones that moved. So this
only needs re-running when a large share of the compiler has been rewritten —
and after re-running, **re-measure**, because a regenerated profile is a new arm
and its gain is not the previous arm's gain.

Two things the measurement has to keep, both of which cost real numbers when
they were skipped:

- **Held out.** Measured in-sample the same profile read 1.179x where held out it
  read 1.130x.
- **Both arms from one tree.** Rebuild the baseline immediately before the PGO
  arm; a baseline left from an earlier build differs by whatever landed in
  between, not by PGO. Assert the two artifacts' hashes differ (they were once
  the same file under two names) and that their `sink` agrees.

## Compatibility

The profile is an LLVM IR-level profile, so one file serves every target triple.
It is tied to the LLVM version instead, and only in one direction: a toolchain
whose LLVM is *older* than the writer's rejects it. This file was written by
1.96.0 and verified to be accepted by 1.97.1, the version
`.github/actions/setup-rust` pins — check that again when the pin moves
backwards, which is the only move that can break it.
