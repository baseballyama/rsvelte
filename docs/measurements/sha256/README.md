# SHA-256 performance

The kernel now uses RustCrypto's accelerated compression, with short inputs
and padding in one call. This was the fastest candidate for the measured path
population on Apple M1 Pro. It does not claim to be fastest on every CPU or
for every input size.

## Measurement

- Date: 2026-10-02. CPU: Apple M1 Pro, arm64 macOS; SHA2 detected.
- Rust 1.98.1, release, thin LTO, one codegen unit.
- Baseline and HEAD: `a25573c64087dd1f417321f19139b3edd709bf03`.
- The working tree had other changes. Source, benchmark, binary, and diff
  hashes are in [native metadata](native-metadata.json).
- Libraries: sha2 0.11.0 and ring 0.17.14. Oracle: Node 26.7.0,
  OpenSSL 3.5.7. Dependency locks are saved beside the results.
- Population: [178 repository Vue input paths](paths.txt), 55–82 UTF-8 bytes,
  plus 16 fixed lengths from empty to 1 MiB, including padding boundaries.
- Each group has 16 forward/reverse/reverse/forward rounds. The table gives
  median ns per digest. All rounds and min/max values are saved.

| Implementation | Paths | 32 bytes | 64 bytes | 1 MiB |
|---|---:|---:|---:|---:|
| Original scalar | 660.3 | 329.2 | 718.7 | 6,488,011 |
| Kernel, accelerated and batched | **50.6** | **24.1** | **53.6** | 556,267 |
| sha2 digest API | 61.3 | 30.2 | 64.6 | 546,265 |
| sha2 compression, without batching | 59.4 | 24.3 | 66.9 | 556,144 |
| ring | 70.4 | 53.1 | 62.3 | **456,318** |

The kernel is 13.0 times faster on paths and 13.6 times faster at 32 bytes.
ring wins on large buffers. The current caller hashes paths, so we selected
the path winner and kept the implementation in Rust.

The official scope-id operation is Node's `createHash('sha256')`, hex output,
and the first eight characters. It measured 547.7 ns per path; raw Node digests
measured 738.4 ns. Those include JS/native calls and output allocation, so
they are not a comparison of compression instructions alone.

The old `main` tree, `5ed8ea3a3401b9fbbe780d3b18d6f90073291d6b`, has no
corresponding SHA-256 or Vue task: **UNMEASURED**, not zero.

## Other comparisons

Eight candidates were explored: scalar, digest API, unbatched compression,
a separate short-input return, combined padding below 120 bytes, batching only
64–119 bytes, the selected shared padding path, and ring. The selected version
avoids a second implementation for short inputs. [Exploration timings](exploration.csv)
and [the source snapshot](exploration-sources.zip) preserve that comparison.
Earlier runs had more timing noise; the table uses the final run.

With `sha2_backend="soft"`, the kernel took 392.0 ns per path versus 738.9 ns
for the scalar baseline: 1.9 times faster. Its digest API and unbatched
compression took 407.1 and 410.6 ns. The flag does not disable acceleration in
ring or Node; their rows do not represent software-only performance.

[Complete Vue compilation](integration.json) measured 26 inputs, 6,925 source
bytes, and 22,604 output bytes, with every task clean. Twelve ABBA batches each
contained 64 rounds per binary. Median batch medians were:

| Task over all 26 inputs | Before | After |
|---|---:|---:|
| Serial pipeline | 0.6273 ms | 0.6108 ms |
| Parallel pipeline | 0.2260 ms | 0.2250 ms |

The serial result improved by 2.6%; the parallel difference is small.
These are dirty-workspace binaries, whose hashes are recorded; they do not
prove that every whole-pipeline difference comes from hashing alone.
The official fixture task, Vue 3.5.43 and TypeScript 6.0.3, measured 7.586 ms
over the same inputs. Its wrapper also erases TypeScript and prints JavaScript.

## Correctness and limits

- All five final arms matched Node crypto on 4,099 binary inputs: every length
  0–4,096, 64 KiB, and 1 MiB. Native and forced-software runs both passed.
- The digest verifier rejected an injected wrong digest. The allocation
  counter detected an injected allocation. All measured hash arms allocated
  zero heap blocks after warmup.
- The kernel's known vectors and 13 binary padding-boundary cases passed.
  kernel and Vue tests passed: 66 tests, plus 26 fixture cases with 28 unchanged
  snapshots.
- Kernel Clippy passed with all targets/features. Wasm checks passed both
  without SIMD and with `simd128`. SHA instructions appear in the measured
  native binary's [assembly extract](assembly.txt).
- Workspace tests, Clippy, formatting, and structure checks found failures in
  other changed files. [Check logs](checks.json) record the failures.
- x86 and Wasm timings, instruction counts, peak RSS, and Vite/HMR:
  **UNMEASURED**. Wall time depends on machine load; retain the raw spread.

## Reproduce and inspect

Use [the comparison drivers](../../../tools/hashing/README.md).

| Evidence | Native | Forced software |
|---|---|---|
| All rounds | [CSV](native-timings.csv) | [CSV](soft-timings.csv) |
| Median and range | [CSV](native-summary.csv) | [CSV](soft-summary.csv) |
| Build identity | [JSON](native-metadata.json) | [JSON](soft-metadata.json) |
| Allocation counts | [Log](native-allocations.log) | [Log](soft-allocations.log) |
| Node oracle timing | [CSV](native-oracle.csv) | [CSV](soft-oracle.csv) |
