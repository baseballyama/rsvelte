# Compiler throughput on small components: where the time actually goes

A speedup ratio that is 9.43× on one application and 3.56× on another, where the low one has
smaller components, reads like a cost that does not scale with file size. This measures that
claim instead of inferring it.

The instrument is `crates/rsvelte_devtools/src/bin/fixed_cost_split.rs`:

```bash
cargo build --release -p rsvelte_devtools --bin fixed_cost_split
./target/release/fixed_cost_split                 # six shipped corpora, client prod
./target/release/fixed_cost_split --dev
./target/release/fixed_cost_split --server
./target/release/fixed_cost_split --dir=…         # any checkout
```

5,836 `.svelte` files / 9.5 MB from `bits-ui`, `flowbite-svelte`, `layerchart`, `shadcn-svelte`,
`skeleton`, `svelte-ux`; mean file 1,636 B; M1 Pro.

## Result 1 — there is no per-call fixed cost worth naming

Fitting `t = a + b·bytes` returns an intercept of **101 µs**, which would be 50% of the mean
per-file compile. That number is wrong, and the table beside it is what shows it is wrong:

| bytes | files | compile µs | parse | analyze | transform | plumbing |
|---|---:|---:|---:|---:|---:|---:|
| 0–1,024 | 3,178 | **75.3** | 2.8 | 24.0 | 42.2 | 8.5 |
| 1,024–2,048 | 1,433 | 179.1 | 6.5 | 54.6 | 106.8 | 15.8 |
| 2,048–4,096 | 807 | 349.1 | 11.5 | 106.2 | 217.0 | 22.0 |
| 4,096–8,192 | 308 | 723.5 | 20.8 | 227.4 | 477.7 | 25.1 |
| 8,192–16,384 | 86 | 1,377.4 | 36.9 | 415.0 | 954.6 | 35.2 |
| 16,384+ | 24 | 2,863.3 | 64.3 | 723.2 | 2,083.6 | 90.2 |

**The fitted intercept is larger than the mean of the smallest bucket (101 > 75.3), and 19× the
fastest single compile in the population (5.4 µs).** A per-call floor cannot exceed the mean of
the files nearest to zero. The intercept is an artefact of fitting a *linear* model to a
*superlinear* curve: `transform` grows ~49× (42.2 → 2,083.6) across a bucket range whose mean
size grows ~16×, an exponent near 1.4 — the same superlinearity already recorded for
`script_text`.

Two consequences. Any future report of a "fixed cost" from a linear fit on this corpus should be
treated as this artefact until a bucket table says otherwise. And **hypothesis 1 of the issue
(allocator/arena setup, option validation, per-pass construction, non-scaling assembly) is
falsified**: whatever is left of it is under 5.4 µs, i.e. under 7% of a small-file compile.

## Result 2 — the runes/legacy dialect is not the driver either, and the first denominator lied

Against **whole-file** bytes, legacy components looked 0.51–0.73× the cost of runes ones — a
large, clean-looking effect in the direction that would explain everything, since shipped
applications are legacy-heavy and component libraries are not.

It is a denominator artefact. A markup-only wrapper has no script, is legacy by default, and is
nearly free per byte. Re-normalising to **script** bytes and bucketing by script size:

| script bytes | runes n | runes µs/KB | legacy n | legacy µs/KB | legacy/runes |
|---|---:|---:|---:|---:|---:|
| 0–1,024 | 2,480 | 320.2 | 2,549 | 396.5 | **1.24×** |
| 1,024–2,048 | 391 | 324.8 | 103 | 276.8 | 0.85× |
| 2,048–4,096 | 184 | 278.6 | 29 | 264.2 | 0.95× |
| 4,096–8,192 | 67 | 273.7 | 10 | 255.7 | 0.93× |

The effect is small and changes sign across buckets. It is not what separates a 9.43× app from a
3.56× one.

## Result 3 — the decomposition the issue asked for

Share of an end-to-end `compile()`, client production target:

| phase | small files (0–1 KB) | large files (16 KB+) |
|---|---:|---:|
| parse | 3.7% | 2.2% |
| analyze | 31.9% | 25.3% |
| transform + codegen | 56.0% | 72.8% |
| plumbing — warnings, CSS assembly, source map, per-file setup (residual) | 11.3% | 3.2% |

Measured on the same population by `ast_handoff_sizing` (see
[ast-handoff-sizing.md](ast-handoff-sizing.md)), inside those buckets:

| | share of compile |
|---|---:|
| IR → OXC conversion | 6.7% |
| re-parse of the printed output, as a bundler consumer pays it | 7.5% |

By target, on the same files (OLS slope, which is the part of the fit that is not an artefact):

| target | b (ns/KB) | mean compile µs/file |
|---|---:|---:|
| client, prod | 63,868 | 101 |
| client, dev | 76,199 | 122 |
| server, prod | 50,590 | 83 |
| server, dev | 53,562 | 86 |

`plumbing` is a **residual**, not a measurement: it is the end-to-end `compile()` minus the three
phases timed by re-running the pipeline's idempotent prefix. It therefore also absorbs any
double-counting the re-run introduces, and should not be quoted as "the cost of warnings + CSS +
source maps" on its own.

## What is left unexplained, stated as such

The issue's observation stands and this corpus cannot resolve it: Appwrite Console has *smaller*
components than Open WebUI (≈4.6 KB vs ≈5.6 KB) and rsvelte is *slower per file* on it
(0.60 ms vs 0.49 ms). Neither result above explains that — a superlinear size curve predicts the
**opposite** sign, and the dialect effect is too small and too unstable.

So the remaining explanation is content-dependent and lives in those two repositories, not in a
component-library corpus. `fixed_cost_split --dir=<checkout>` runs the whole decomposition on
either of them; that is the measurement that should come next, and it is the reason the bin takes
a path at all. Until it is run, "many small components" should not be repeated as the cause —
this measurement rules out the two mechanisms that were proposed for it.
