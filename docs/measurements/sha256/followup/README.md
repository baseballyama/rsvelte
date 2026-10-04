# Further SHA-256 experiments

The production implementation stays unchanged. Eleven further variations did
not give a stable improvement for the actual operation: SHA-256 of a path,
then lowercase hex of the first four digest bytes.

Baseline: `d3fe0394b0b11ab70829fad9a544b2b03ac81618`. Apple M1 Pro,
SHA2 detected, Rust 1.98.1, sha2 0.11.0, release, thin LTO, one codegen unit.
The [metadata](metadata.json) records source and binary hashes. The benchmark
uses copies of the kernel source. It does not measure complete Vue compilation.

The population is the same [178 Vue paths](paths.txt), 55–82 bytes, as the
[first comparison](../README.md). Eight rounds use forward, reverse, reverse,
forward order. Each sample runs 2,000 and 4,000 sweeps in separate processes.
Their difference removes startup cost. The counters are actual process CPU
cycles and instructions from macOS `proc_pid_rusage`, with user-initiated QoS.
Each row is the median counter difference per operation.

| Variation | Digest cycles | Scope ID cycles | Scope ID instructions |
|---|---:|---:|---:|
| Current implementation | 163.3 | 203.9 | 667.6 |
| Inline annotations | 153.6 | 216.6 | 671.6 |
| Separate padding for 64–119 bytes | 154.9 | 235.2 | 683.2 |
| Separate padding below 56 bytes | 156.7 | 227.0 | 684.1 |
| Forced inline annotations | 160.3 | 201.3 | 666.5 |
| Zeroed byte buffer for hex | UNMEASURED | 249.3 | 748.0 |
| Byte-pair table and zeroed buffer | UNMEASURED | 219.2 | 731.7 |
| String-pair table | UNMEASURED | 203.0 | 661.3 |
| Byte-pair table and buffer extension | UNMEASURED | 220.1 | 723.4 |
| String table for individual digits | UNMEASURED | 220.7 | 679.8 |
| Stack buffer for four-byte hex | UNMEASURED | 236.6 | 764.3 |
| Arithmetic digit conversion | UNMEASURED | 195.0 | 688.8 |

Digest-only savings did not carry through to the scope ID. The string-pair
table saved about 1% of instructions, but added a 256-entry string table and
had no stable cycle advantage. Arithmetic conversion increased instructions;
an [earlier batch](hardware-arithmetic-summary.json) with the same binary
measured 225.0 cycles against 187.8 for the baseline. Its
[raw counters](hardware-arithmetic.json) are also saved.
These changing results do not justify a production change.

CPU time and wall time also varied with machine load and core frequency.
Do not treat the fastest time from one batch as proof of an improvement.
Cache profiles, other CPUs, Wasm timings, and whole-pipeline followup results
are **UNMEASURED**. The official Node and old `main` comparisons remain in
the first report; they were not repeated for this followup.

All five digest arms and twelve scope arms matched Node crypto on 4,099 binary
inputs each: lengths 0–4,096, 64 KiB, and 1 MiB. The verifier rejected a wrong
digest. [Verification](verification.json) records the population and oracle
versions. [Raw counters](comparison.json) preserve all 136 paired samples;
the [summary](comparison-summary.json) also records CPU time.

## Reproduce

Extract [the sources](sources.zip) into `target/sha256-followup`. On arm64 macOS:

```sh
clang -O2 -dynamiclib target/sha256-followup/macos-counters.c -o target/sha256-followup/counters.dylib
CARGO_TARGET_DIR=target/sha256-followup/build cargo build --offline --release --manifest-path target/sha256-followup/Cargo.toml
python3 target/sha256-followup/comparison.py target/sha256-followup/build/release/rsvelte-sha256-followup
target/sha256-followup/build/release/rsvelte-sha256-followup verify > target/sha256-followup/verification.csv
mise exec -- node target/sha256-followup/verify.mjs target/sha256-followup/verification.csv
```
