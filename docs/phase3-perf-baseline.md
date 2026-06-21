# Phase-3 transform performance baseline (measured)

This note turns the hypotheses in
[`phase3-ast-refactor-plan.md`](./phase3-ast-refactor-plan.md) into **measured
facts**: where does Phase-3 (`3_transform`) actually spend its time? The answer
determines which refactor is a performance win and which is just cleanup.

**TL;DR — the bottleneck is the string surgery itself, not parsing.** On a
state-heavy component, ~68% of client-transform self-time is string
search/move + the allocation churn those operations create; oxc parsing +
semantic building together are under 3%. Eliminating the
parse → string-rewrite → re-parse pipeline (the plan's AST-rebuild + printer
target) is therefore a _performance_ change, not only a readability one.

## Method (reproducible)

The `bench` profile (fat LTO) is slow to build and irrelevant to _relative_
hotspot attribution, so profile under the faster `profiling` profile and
sample with the OS profiler (low overhead, text output):

```bash
# Build the criterion bench binary under the profiling profile (thin LTO).
cargo build --bench compiler --profile profiling
BIN=$(find target/profiling/deps -maxdepth 1 -type f -perm +111 -name 'compiler-*' \
        | grep -vE '\.(o|d|rcgu)$' | head -1)

# Run one representative hot case in a tight loop (criterion --profile-time
# skips statistical analysis) and sample it for 12s with macOS `sample`.
"$BIN" --bench --profile-time 25 \
  'phase3_transform_client/transform_client/synthetic-state-heavy' &
sample "$(pgrep -n -f 'compiler-.*profile-time')" 12 -f /tmp/phase3_sample.txt
```

Workload: `create_state_var_heavy_file()` from `benches/compiler.rs` — 40
functions, each doing simple/compound/update assignments + reads over five
runes-mode `$state` vars. This is the path that exercises the client
`*_ast.rs` collect-and-splice passes hardest.

Caveat: local wall-clock numbers on this bench are noisy (observed ±30% across
samples on a laptop) — the **self-time _shape_** below is stable and is what we
act on. For trustworthy before/after deltas use CodSpeed CI (Valgrind
simulation, low variance), which the `phase3_transform_*` benches already feed.

## Result — self-time buckets

Collapsed top-of-stack self-time (samples with ≥5 hits; 8,585 total):

| bucket                   | samples |     share | what it is                                                                                                                                                           |
| ------------------------ | ------: | --------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **string search / move** |   4,274 |  **~50%** | `str::contains`/`find` (`TwoWaySearcher`), `memmove` (`String::replace_range`/insert), `memcmp`, `trim_matches`, `Iterator::partition`, `StrSearcher::new`, `memmem` |
| **allocation churn**     |   1,559 |  **~18%** | `malloc`/`free`/`realloc`/`RawVec::finish_grow` — overwhelmingly the per-pass `source.to_string()` clones + needle `format!`s                                        |
| parse + semantic         |     242 | **~2.8%** | `oxc_parser` lexer/statements + `SemanticBuilder`                                                                                                                    |
| everything else          |   2,510 |      ~29% | codegen (`js_ast::codegen::emit_*`), `Memoizer::generate_id`, formatting post-passes, hashing, etc.                                                                  |

Hottest single frames (self): `TwoWaySearcher::next` 1,238 · `memmove` 919 ·
`free` 593 · `memcmp` 521 · `Iterator::partition` 403 ·
`CharSearcher::next_match` 350 · `trim_matches` 311 ·
`transform_instance_script_for_visitors` 302 · `StrSearcher::new` 278.

The dominant subtree is `transform_instance_script_for_visitors` (~2,380
cumulative of the captured samples) — the instance-script orchestration hub
that threads the script through the ~600 `transform_*_ast(&result, …)` call
sites as `result = transform_X(&result).unwrap_or(result)`.

## Interpretation

1. **Parsing is cheap; re-string-ifying is not.** oxc parses the instance
   script in well under 3% of the budget. The cost is everything built _around_
   parsing: scanning the script text with `str::contains`/`find`, splicing
   edits with `replace_range` (`memmove`), and re-allocating a fresh `String`
   at each pass that changes anything. The `*_ast.rs` passes are "AST-driven"
   only on the read side — they still **apply** edits to source text and hand a
   new `String` to the next pass.

2. **The pipeline shape is the cost, not any one function.** The hot leaf
   functions are already micro-optimized (`generate_id` has a fast path;
   `is_variable_reassigned_in_text` is byte/SIMD-based; the dynamic regexes are
   `LazyLock`/cached). There is no single hot call site whose local rewrite
   moves the needle — the ~68% is spread across hundreds of small
   scan-and-splice operations inherent to threading a `String` through ~600
   passes.

3. **Therefore the win is architectural and already specified.** Parse the
   instance script **once**, run the transforms as AST mutations/visitors over
   that one tree, and print **once** with the esrap-port printer
   (`phase3-ast-refactor-plan.md`, steps 2–3). That removes per-pass
   re-parsing, per-pass `String` cloning, and the `str::contains`/`replace`
   scans wholesale — i.e. it collapses the entire ~68% bucket, not a slice of
   it. It is the same change the plan prescribes for _correctness_ (comment /
   quoting / number-spelling divergences), now with a measured performance
   mandate behind it.

## What this rules out

- Micro-optimizing individual scanners or swapping hash functions: each touches
  a few percent at most and cannot reach the structural 68%.
- "Parse faster": parsing is not the bottleneck here.

## Next measurable step

Land the server-side AST script transform (plan step 2) behind the existing
byte-exact suites + corpus, and re-run this profile on the same workload. The
expected signature of success: the `string search/move` and `allocation churn`
buckets shrink toward the `parse + semantic` floor, and CodSpeed shows a
`phase3_transform_*` improvement rather than noise.
