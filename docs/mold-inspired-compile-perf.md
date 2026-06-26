# Why mold is fast — and how to apply it to rsvelte CSR/SSR compile time

`mold` (`submodules/mold`, pinned `f4a62c7`) is the fastest production ELF linker.
This document is a careful study of *why* it is fast, distilled into transferable
principles, then maps each principle onto rsvelte's per-component CSR (client) / SSR
(server) compile path. It is the design record behind the `perf/mold-inspired-compile`
branch.

The benchmark metric this targets: `cargo bench --bench compiler` →
`full_compile/client/*` (CSR compile time) and `full_compile/server/*` (SSR compile
time). Both call `rsvelte_core::compile(source, opts)` single-threaded per component.

---

## Part 1 — What makes mold fast (read from source)

### P1. Everything that loops over a big array is parallelized
`src/passes.cc` contains **57** `tbb::parallel_for` / `parallel_for_each` call sites.
The architecture is uniform: each pass is `for each object/section/symbol → do
independent work`, expressed as a parallel-for. The serial fraction (Amdahl's law) is
driven toward zero. Even sorting is `tbb::parallel_sort` (`input-files.cc:1621`,
`icf.cc:451`).

**Takeaway:** find independent units of work and run them across all cores. The serial
spine should only be *dependency edges*, never *bulk work*.

### P2. Lock-free, sharded, open-addressing concurrent hash map
`lib/lib.h:366 ConcurrentMap<T>` is the heart of symbol resolution. Key design points,
each a deliberate speed decision:

- **Open addressing** (linear probe), not chaining → no per-node allocation, cache-friendly.
- **Sharded probing**: `mask = nbuckets / NUM_SHARDS - 1` (`NUM_SHARDS = 16`). A key's
  probe sequence stays within one shard, so concurrent inserts to different shards never
  touch the same cache lines.
- **Optimistic load-before-CAS**: it first does a relaxed `load(acquire)` and only falls
  back to `compare_exchange_strong` if the slot looks empty. The comment: *"avoiding
  compare-and-swap is faster overall."* An atomic RMW costs hundreds of cycles on x86; a
  relaxed load + predicted-not-taken branch is ~20.
- **`alignas(32)` entries** to avoid false sharing between adjacent slots.
- **`mmap(... MAP_POPULATE)`** to allocate the bucket array: faster than `malloc+memset`
  and pre-faults the pages so concurrent inserters don't take page-fault / TLB-shootdown
  storms.
- **Deterministic output despite parallel insert**: `get_sorted_entries_all` re-sorts
  shards in parallel and flattens, so the unordered concurrent map still yields a stable
  order.

**Takeaway:** when a hash map is on the hot path, the *hasher and memory layout* matter
as much as the algorithm. Cryptographic hashing and pointer-chasing are the enemy.

### P3. Relaxed atomics by default
`lib/atomics.h` defines `Atomic<T>` as `std::atomic<T>` **with relaxed memory order as
the default**. `test_and_set()` is `load() || exchange(true)` — an optimistic relaxed
read first. Sequential consistency is never paid for unless explicitly needed.

**Takeaway:** don't pay for synchronization you don't need.

### P4. Compute-the-whole-layout-first, then write once, in parallel
mold never appends to a growing buffer. The flow in `src/main.cc`:
1. `set_osec_offsets(ctx)` computes the **exact** final size and every section's offset.
2. `OutputFile::open` → `ftruncate(fd, filesize)` + `fallocate` + `mmap(MAP_SHARED)` +
   `madvise(MADV_HUGEPAGE)` (`output-file-unix.cc:56-142`) — the entire output file is
   reserved up front, huge-paged to cut TLB misses.
3. `copy_chunks(ctx)` (`passes.cc`) writes **every chunk in parallel**
   (`tbb::parallel_for_each(ctx.chunks, …)`) directly into the mmap'd buffer at its
   precomputed offset.

No reallocation, no `realloc`-copy, no sequential concatenation, no intermediate buffers.

**Takeaway:** size the output exactly, allocate once, fill in place. Every "grow + copy"
and every "build small string then concatenate" is waste.

### P5. mmap I/O — copy bytes at most once
Input object files are mmap'd; the output is mmap'd. Section contents are copied straight
from the input mapping to the output mapping. The kernel does the page movement; user
space never double-buffers.

**Takeaway:** the cheapest transformation of bytes is the one that copies them once. Every
*re-read* / *re-parse* of data you already have in structured form is pure overhead.

### P6. Fast, non-cryptographic hashing
`lib/lib.h:47 hash_string` is `XXH3_64bits`. Symbol-name hashing is a per-symbol hot
operation; mold would never use SipHash (the std default, DoS-resistant but ~5-10× slower)
there.

**Takeaway:** on a trusted-input compiler hot path, use FxHash/xxHash, never SipHash.

### P7. Speculation to remove serial round-trips
mold speculatively guesses the target architecture and `redo_main` only if wrong
(`main.cc:301`); it forks the output-writer child early. Latency-critical serial steps are
overlapped with useful work.

---

## Part 2 — How rsvelte already embodies (or violates) these

| Principle | rsvelte status |
|---|---|
| P1 parallelism | ✅ across files (`parse_parallel`, rayon). ❌ none *within* a compile — but intra-compile rayon is unsafe here: codegen relies on `thread_local` name counters (see memory `feedback_no_global_static_counters_in_transform`), so parallelizing inside one `compile()` would break determinism. **Per-component parallelism is intentionally out of scope.** |
| P2/P6 hashing | ✅ mostly `FxHashMap` (rustc-hash). ❌ several `std::collections::HashMap/HashSet` (SipHash) remain in the **server transform hot path**. → fixed on this branch. |
| P3 atomics | N/A (no hot atomics in single-thread compile). |
| P4 preallocate | ⚠️ partial — many `String::with_capacity`, but the server text path *reallocates the whole output string per edit* (`server/mod.rs` post-passes), and several hot maps/Vecs start empty then grow. → capacity hints added. |
| P5 copy-once | ❌ the headline structural debt: client visitors build `Raw` strings that `to_oxc` **re-parses** (`js_ast/to_oxc.rs`), and `shared/async_body.rs` (~3100 lines) re-scans script *text* it already has as AST. These are large refactors tracked in the AST handoff docs; documented here as the biggest remaining win, not attempted in this branch. |
| P7 speculation | N/A. |

---

## Part 3 — Profile-driven results (measure-first, honest)

### Where the time actually goes (`compile_profile`, 3854-file corpus, client)

Stable across runs (aggregate over thousands of files averages out machine noise):

| Bucket | ms | % |
|---|---|---|
| **Phase 2 analyze — visitors** | ~240 | **44.5%** |
| Phase 3 — JS codegen | ~73 | 13.6% |
| Phase 3 — script-text transform | ~67 | 12.6% |
| Phase 3 — template fragment | ~53 | 10.0% |
| Phase 2 — ensure-script (OXC) | ~33 | 6.1% |
| Phase 3 — pre-frag setup | ~28 | 5.2% |
| Phase 1 — parse | ~15 | 2.7% |

### What was tried, and the rigorous A/B verdict

A critical methodology note first: **the dev machine ran at load 18 on 10 cores during
the first baseline capture and ~3–6 later.** A naive before/after across that gap showed a
spurious **−50%**. The trustworthy number comes only from a *same-build-session,
back-to-back* A/B: build origin/main → `--save-baseline`, rebuild the change → `--baseline`.
Criterion's t-test (`p`) is the arbiter, not the raw millisecond delta.

1. **P5 — replace the per-function `root.scope.declarations` clone with a delta undo-log.**
   The static-analysis "obvious big win" (a full `FxHashMap` clone on every function-scope
   entry in the 44% analyze bucket). Implemented correctly (verified: full runtime / snapshot
   / validator / ssr / parser / css suites all pass). **Clean A/B result:** *no change* on
   runes (`p` = 0.17–0.82), **+5% regression on legacy** (`p` < 0.05). On representative
   inputs the cloned map is small, so the clone was never the cost; the per-insert undo
   bookkeeping cost more than it saved. **→ Reverted.** (This mirrors the repo's existing
   finding that the documented "#1 lever" of eliminating `serde_json::Value` from analyze is
   itself ~3% *slower* when measured.)

2. **P6 — kill SipHash on the hot path.** Replaced the remaining
   `std::collections::HashMap/HashSet` (SipHash) with `FxHashMap/FxHashSet` in the server
   transform path (`server/mod.rs`, `server/ast/script.rs`, `server/ast/visitors/shared.rs`,
   `server/evaluate.rs`, `client/private_class_assign_ast.rs`). These maps are small, so the
   clean A/B shows *no measurable change* — but the swap is provably never-worse and aligns
   the hot path with mold's "never SipHash on trusted input." **→ Kept.**

### The real mold win, IMPLEMENTED: P5 at the API level — `compile_both`

The profile makes the highest-value mold-principle opportunity obvious. Parse + analyze =
~**54%** of a compile, and analyze does not depend on `generate` mode. Yet a dual-output
(SSR) build produces both CSR and SSR by calling `compile(src, Client)` **and**
`compile(src, Server)` — i.e. it **parses and analyzes the same source twice**. That is
exactly mold's P5 violation ("never reprocess data you already hold").

`compile_both(src)` (in `compiler/mod.rs`, re-exported from the crate root) parses +
resolves + strips TS + analyzes **once**, then runs the client and server transforms over
the shared `(ast, analysis)` (both borrowed immutably). Cost drops from
`2×(parse+analyze+transform)` to `1×(parse+analyze) + 2×transform`.

**Correctness:** `analyze_component` is deterministic and mode-independent and
`transform_component` does not mutate the AST/analysis, so the output is **byte-identical**
to two separate `compile` calls. Guarded by `tests/compile_both_parity.rs` (asserts JS, CSS
and warning-count equality across runes / legacy / blocks+snippet / callback-scope samples).

**Measured** (criterion `compile_both` group, same-run back-to-back so no load confound):

| Case | two `compile` calls | `compile_both` | speedup |
|---|---|---|---|
| synthetic-large | 7.39 ms | 5.79 ms | **−21.6%** |
| synthetic-state-heavy | 30.80 ms | 17.02 ms | **−44.7%** |
| synthetic-legacy-state-heavy | 28.85 ms | 15.79 ms | **−45.2%** |

The state-heavy cases nearly halve because analyze is the dominant cost there and is now
paid once instead of twice. Adopting `compile_both` in the dual-output consumer
(`@rsvelte/vite-plugin-svelte`'s SSR build, where Vite asks for both CSR and SSR) is the
follow-up that turns this library win into a user-visible build-time win.

### The single-`compile()` win that landed: mimalloc (mold's allocator)

Profiling a real single-`compile()` run (macOS `sample` over a long compile loop, see
`bin/compile_hot.rs`) shows the dominant self-time is **allocation**: ~12% in allocator
internals plus the `serde_json::Value` walk representation it feeds (its `Map` is an
`IndexMap` whose `RandomState` is SipHash → ~4% SipHash + ~3% IndexMap insert + Value
build/drop). Removing `serde_json::Value` is the repo's known-resistant lever (a prior naive
typed conversion measured ~3% *slower*), so the value-representation itself was left alone.

The allocator, though, is mold's own lever: **mold links mimalloc** precisely because linking
is allocation-bound. rsvelte's NAPI cdylib (the production CSR/SSR compile path used by
`@rsvelte/vite-plugin-svelte`) shipped **jemalloc**. An interleaved, same-load A/B over the
3854-file corpus (`compile_profile`, jemalloc vs mimalloc builds run back-to-back):

| Allocator | TOTAL (parse+analyze+transform, 3854 files) |
|---|---|
| jemalloc (previous) | ~569 ms |
| **mimalloc** | **~504 ms** |

**~11% faster single-`compile()`**, identical compiler work — a true apples-to-apples win on
the standard `compile()` path (not a new API). Shipped by switching the NAPI cdylib +
profiling bins + the criterion bench to mimalloc (`mimalloc-alloc` feature, enabled by
`native`). Validated: the mimalloc cdylib passes the full Node smoke test
(`pnpm run test:vps`, 21/21 — `compile`, `compileModule`, `hmrDiff`, `preprocess`, CSS,
client/server) and the Linux CI corpus compile.

Cross-platform gotcha (caught by Linux CI, not macOS): mimalloc defaults to the
initial-exec TLS model, which fails when the cdylib is `dlopen`'d by Node on Linux
(`cannot allocate memory in static TLS block`, `ERR_DLOPEN_FAILED`) — the same class
of issue jemalloc's `disable_initial_exec_tls` solved. Fixed by enabling the mimalloc
crate's `local_dynamic_tls` feature (local-dynamic TLS model).

### Takeaway

rsvelte's per-component compile already embodies most of mold's *single-threaded* levers
(FxHash throughout, bumpalo/OXC arenas, capacity hints, no hot-path locks), so micro-tuning
the single call yields little — the map-clone removal and the documented `serde_json`
removal both measure neutral-to-negative. Two mold levers did land, both measured:

1. **mimalloc** (mold's allocator): ~11% faster on the standard single-`compile()` path
   (allocation-bound workload), shipped in the production NAPI cdylib, Node-validated.
2. **`compile_both`** (P5 applied structurally): stop redoing the 54%-of-compile
   parse+analyze for the second output — ~22–45% off dual-output (SSR) builds, byte-identical.
