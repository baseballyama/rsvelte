# Binary-Size Reduction Plan

Goal: ship the smallest practical artifacts to npm users without sacrificing
rsvelte's "100x performance" mandate. This document is the **enumeration of
everything we can do**, with measured data, prioritized into tiers by
risk/reward. Research base: oxc's own build setup, napi-rs docs, `min-sized-rust`,
the Rust Performance Book.

Worktree: `rsvelte-binsize` (branch `perf/binary-size`).

---

## 1. What we actually ship (the artifacts that matter)

| Artifact | Crate / build | Measured size (release, macOS arm64) | Distribution |
|---|---|---|---|
| `.node` NAPI addon (`rsvelte.node`) | `rsvelte_core` cdylib `--features napi` | **10.1 MB** (`librsvelte_core.dylib`) | `@rsvelte/vite-plugin-svelte-native-*` (5 platforms) |
| `svelte_check` CLI | `rsvelte_core` `--bin svelte_check` | **10.9 MB** | `@rsvelte/svelte-check-*` (5 platforms) |
| `rsvelte-lint` CLI | `rsvelte_lint --bin rsvelte-lint` | **10.3 MB** | (lint distribution) |
| `rsvelte-fmt` CLI | `rsvelte_fmt --bin rsvelte-fmt` | **5.7 MB** | `@rsvelte/fmt-*` (5 platforms) |
| WASM (`@rsvelte/compiler`) | `rsvelte_core` cdylib, `wasm-pack` | not yet measured (wasm-opt **disabled**) | npm + playground |
| `rsvelte_capi` cdylib/staticlib | `rsvelte_capi` | (per-OS, GitHub Releases) | C-ABI consumers |

Because every CLI + the `.node` statically links `rsvelte_core`, **anything that
shrinks `rsvelte_core` shrinks all of them at once.** That is where the leverage is.

### Current build config (`Cargo.toml` workspace root)

```toml
[profile.release]
lto = "fat"          # good for size (cross-crate DCE) and speed
codegen-units = 1    # good for size and speed
opt-level = 3        # speed (NOT size)
strip = false        # ⚠️ ships full symbol tables — the #1 easy win
debug = false
panic = "abort"      # good for size (no unwind tables)
```

`[package.metadata.wasm-pack.profile.release] wasm-opt = false` in
`crates/rsvelte_core/Cargo.toml:203` — ⚠️ **wasm-opt is explicitly off.**

---

## 2. Headline finding from researching oxc

**oxc does not optimize for size — it optimizes for speed and then strips.** Its
shipped `[profile.release]` is `opt-level = 3, lto = "fat", codegen-units = 1,
panic = "abort", debug = false, strip = "symbols"`. The *only* place oxc uses
`opt-level = "z"` is the WASM playground binding
(`[profile.release.package.oxc_playground_napi]`). No `build-std`, no
`panic_immediate_abort`, no `wasm-opt`, no `--gc-sections`.

So the realistic target for rsvelte's **native** artifacts is "oxc-shaped":
keep `opt-level = 3` for speed, and claw back size via **stripping** + dependency
discipline. Size-at-all-costs tricks (`opt-level=z`, nightly `build-std`) are only
worth it for the **WASM** artifact, where bytes are downloaded per page-load.

The single most important config delta vs oxc today: **rsvelte has `strip = false`,
oxc has `strip = "symbols"`.** (Git history shows rsvelte originally had
`strip = "symbols"`; commit `3a1e31dd` "feat: add napi feature" flipped it to
`false`. That flip is the regression to revisit — see Tier 1.)

---

## 3. Measured composition (cargo-bloat on `rsvelte-fmt`, 5.7 MB, .text = 3.8 MB)

```
12.3% 18.7% 719.5KiB oxc_formatter        (needed — the formatter engine)
10.3% 15.7% 604.5KiB std                  (incl. backtrace: gimli+addr2line+demangle ≈ 63KiB)
 9.2% 14.0% 537.9KiB rsvelte_core         (compiler core; pulled in transitively)
 6.2%  9.5% 365.2KiB oxc_parser
 4.2%  6.5% 248.7KiB rsvelte_formatter
 4.1%  6.3% 243.0KiB regex_automata  ┐
 2.8%  4.2% 161.6KiB clap_builder    │   regex stack = 243+131+96 = 470 KiB (12% of .text)
 2.8%  4.3% 165.6KiB markdown        │   pulled by `ignore`/`globset` (gitignore) + `markdown`
 2.2%  3.4% 131.1KiB regex_syntax    │
 1.6%  2.5%  96.1KiB aho_corasick    ┘
 0.7%  1.1%  41.4KiB ignore
 0.5%  0.8%  29.6KiB globset
 0.4%  0.6%  24.8KiB num_bigint
 0.5%/0.2%/0.5% gimli/addr2line/rustc_demangle  (panic backtrace symbolization)
```

(`cargo-bloat` numbers are guesswork under fat-LTO, but the ranking is reliable.)
Per-crate analysis for the `.node`/`svelte_check` build should be re-run with
`RUSTFLAGS="-C debuginfo=2 -C strip=none" cargo bloat -p rsvelte_core --crates`
(this mirrors oxc's `.github/workflows/bloat.yml`).

---

## 4. The plan — tiered by risk/reward

### Tier 1 — Free wins, no perf cost, do first

| # | Action | Where | Expected | Risk |
|---|---|---|---|---|
| 1.1 | **Strip symbols from shipped artifacts.** Add a dedicated `[profile.dist]` (`inherits = "release"`, `strip = "symbols"`) and point the `release.yml` `cargo build` steps (`svelte_check`, `rsvelte-fmt`, vps-native `--lib`) at `--profile dist`. *Don't* flip the shared `[profile.release]` — CodSpeed/profiling rely on its symbols. | `Cargo.toml`, `.github/workflows/release.yml` | **−13% to −16%** measured (`strip -x` locally: 10.9→9.3 / 10.3→8.8 / 5.7→4.8 / 10.1→8.8 MB) | Verify the `.node` still loads after strip — `strip="symbols"` keeps the dynamic export table, so napi registration survives (oxc ships stripped `.node`). |
| 1.2 | **Enable `wasm-opt` for WASM.** Set `wasm-opt = ['-Oz']` in `[package.metadata.wasm-pack.profile.release]` (currently `false`). | `crates/rsvelte_core/Cargo.toml:203` | **−15% to −40%** on the `.wasm` (the largest single WASM win) | None functional; adds Binaryen step to wasm-pack (already a wasm-pack pipeline). |
| 1.3 | **Add a WASM size profile.** `[profile.release.package.rsvelte_core]`/`rsvelte_fmt_wasm` with `opt-level = "s"` (matching oxc's playground `'z'` trick), `lto = true`. WASM only — does not touch native opt-level. | `Cargo.toml` | stacks with 1.2 | Measure `s` vs `z` (non-monotonic). |
| 1.4 | **Gate `console_error_panic_hook` + `getrandom/wasm_js` to debug WASM only.** The panic hook drags in all of `std::fmt`/`std::panicking`. | `rsvelte_fmt_wasm`, `rsvelte_core` wasm feature | meaningful KB on WASM | Lose pretty panics in release WASM (acceptable; gate by feature). |

### Tier 2 — Dependency discipline (EXECUTED + measured)

**Key empirical result that reframes this whole tier:** under `lto = "fat"`, the
linker already dead-strips every dependency whose code no path references. We
proved this by building the `.node` two ways:

- full (`--features napi`, i.e. default `native` + napi): **10,330,440 bytes**
- lean (`--no-default-features --features napi`, which drops svelte_check, `clap`,
  `notify`/`kqueue`, `chrono`, `oxc_resolver`, the `miette/fancy` stack and one
  allocator from *compilation*): **10,330,440 bytes — byte-identical.**

So **feature-gating unused deps out of an artifact does not shrink it** (it only
speeds up compilation / shrinks the dep surface). This kills the naive size case
for 2.3 and 2.4 below. The only things that shrink a fat-LTO binary are (a)
stripping symbols (Tier 1) and (b) reducing code that is *actually linked and
reachable*. That makes the regex Unicode tables the one real Tier-2 size lever.

| # | Action | Status | Measured | Notes |
|---|---|---|---|---|
| **2.1** | **Trim the `regex` Unicode feature set.** `rsvelte_core` + `rsvelte_lint` pulled `regex` with default features (all Unicode tables). Our patterns use only `(?i)` / `(?m)` / `(?s)` and `\w \s \d \b` — no `\p{…}`/script/category classes, no `\X`. Set `default-features = false, features = ["std","perf","unicode-perl","unicode-case"]`, dropping the large `unicode-age/-bool/-gencat/-script/-segment` tables. (`string_wizard` 1.1.3 already requests exactly this minimal set, so feature unification keeps it effective.) | ✅ **done** | **−242 KiB** on the stripped `rsvelte-fmt` (5,038,512 → 4,790,920 B, −4.9%). Applies to **every** artifact (all link `regex`). | Behavior preserved by construction (`unicode-perl`+`unicode-case` retained); validated against the fixture suite. |
| 2.2 | `clap` → `lexopt`/`pico-args` for the CLIs (~161 KiB `clap_builder`, *used* code). | ⏳ candidate | est. 100–250 KiB/CLI | Loses derive/help/completions UX. Real used-code, so it *would* shrink — but a UX/maintenance trade. Deferred. |
| 2.3 | Drop the dual allocator from `native`. | ❌ **no size benefit** | 0 (dead-stripped per binary; each bin already `cfg`-selects one allocator). | Worth doing only as a build-time/cleanliness change, not for size. |
| 2.4 | Gate `miette/fancy` / svelte_check out of the `.node`. | ❌ **no size benefit** | 0 (the lean-`.node` experiment above was byte-identical). | Same dead-strip reason. A separate *compile-time* win if desired. |
| 2.5 | Trim `chrono`/`im`/`sourcemap`/`notify` default features. | ⏳ low priority | only the *reachable* portion matters; unused parts already stripped. | Marginal; measure per-crate before touching. |

### Tier 3 — Aggressive / nightly (WASM, or a dedicated `min` build only)

| # | Action | Expected | Risk |
|---|---|---|---|
| 3.1 | Nightly `-Z build-std=std,panic_abort -Z build-std-features="optimize_for_size"` for WASM. Rebuilds std with size algorithms. | large on WASM | nightly-only; ~2x build time; pin nightly (a Sept-2025 regression exists, rust#147257). |
| 3.2 | `-C panic=immediate-abort` (replaces panic runtime with `ud2`, kills panic-message formatting). | further WASM/size cut | nightly; suppresses all panic messages → only for a dedicated min artifact. |
| 3.3 | `opt-level = "z"`/`"s"` on **native** artifacts. | single-digit–25% | **slower** — violates the 100x mandate. Only if a specific artifact is size-critical and cold. Measure perf regression first. |
| 3.4 | Linker GC / ICF: `-Wl,--gc-sections` + `-Wl,--icf=safe` (lld/mold on Linux), `-Wl,-dead_strip` (macOS). | low single-digit % on top of LTO | `--icf=all` can break fn-pointer identity; use `safe`. |

### Explicitly rejected

- **UPX compression** of the `.node`/WASM: antivirus false-positives, decompress-to-RAM
  on every load (worse cold start + RSS, no page sharing), npm already gzips the
  tarball. Fine only for a standalone CLI we fully control; **not** for the npm
  native addon or WASM. For WASM ship `.br`/`.gz` via the CDN instead.
- **`wee_alloc`**: unmaintained, known leak. Use the default dlmalloc on WASM (or `talc`).

---

## 5. Recommended first PR (lowest risk, highest measured payoff)

1. Add `[profile.dist]` (inherits release + `strip = "symbols"`), wire `release.yml`
   build steps to `--profile dist`. (Tier 1.1)
2. Enable `wasm-opt = ['-Oz']`. (Tier 1.2)
3. Add WASM `opt-level = "s"` package override + gate the panic hook to debug. (1.3/1.4)

Expected: native artifacts **−13–16%** (e.g. svelte_check 10.9 → ~9.3 MB,
`.node` 10.1 → ~8.8 MB), WASM **−30%+**, with **zero** native runtime-perf cost
and no nightly toolchain. Tier 2 (dependency trimming) is the follow-up campaign
that shrinks `rsvelte_core` for every artifact simultaneously.

## 6. How to measure (repeatable)

```bash
# per-crate composition (mirrors oxc's bloat.yml)
RUSTFLAGS="-C debuginfo=2 -C strip=none" cargo bloat --release -p rsvelte_core --crates -n 30
# strip delta on an existing build
strip -x target/release/svelte_check && ls -l
# WASM
twiggy top -n 20 pkg/rsvelte_core_bg.wasm
cargo tree -i regex   # who pulls the heavy crate
```

---

### Sources
- oxc local checkout `~/.cargo/git/checkouts/oxc-.../Cargo.toml`, `.cargo/config.toml`,
  `napi/parser/{Cargo.toml,package.json}`, `.github/workflows/bloat.yml`.
- [min-sized-rust](https://github.com/johnthagen/min-sized-rust),
  [Rust Performance Book — Build Configuration](https://nnethercote.github.io/perf-book/build-configuration.html),
  [rustwasm Shrinking .wasm](https://rustwasm.github.io/docs/book/reference/code-size.html),
  [napi.rs build CLI](https://napi.rs/docs/cli/build).
