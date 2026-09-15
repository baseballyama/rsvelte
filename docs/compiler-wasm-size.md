# Compiler WebAssembly size

The compiler-only entry retains client and server compilation, rune modules,
diagnostics, source maps, callback options and `parse_svelte`. It does not link
the playground's lint and projection exports.

`parse_svelte().ast` uses compact JSON. This shares the AST serializer already
used by compilation instead of instantiating another serializer for pretty
printing. ASCII inputs still serialize directly; Unicode inputs still remap
positions to UTF-16. Consumers that need indentation can use
`JSON.stringify(JSON.parse(result.ast), null, 2)`.

The release build uses Rust `opt-level=z`, LTO and a single codegen unit, followed
by Binaryen `-Oz --converge`. Convergence repeats size optimization until the
module stops shrinking. No compiler features or runtime safety checks are
disabled by this change.

## Measurement

Measured on 2026-09-11 against the pristine tree
`fe1d1d5a4b95be36a7419bcdee9b475657846e9e`, using Rust 1.97.1 and wasm-pack
0.15.0 for both arms. These are local, matched builds, not a comparison between
different npm releases. Sizes refer to `rsvelte_compiler_bg.wasm`, not the npm
tarball, which also includes the playground.

| Build | Bytes | gzip level 9 bytes |
| --- | ---: | ---: |
| Before | 5,758,166 | 2,078,820 |
| Compact AST JSON | 5,703,347 | 2,068,633 |
| Compact AST JSON and converged optimization | 5,692,480 | 2,062,639 |

The combined reduction is 65,686 bytes (1.14%) raw and 16,181 bytes (0.78%)
compressed. Artifact SHA-256:

- Before: `9bfd065b3c9ffdfbeb4d685c99156809f026d017bc1db6c90dafdc85a26ede12`
- After: `e6c868239cfc068154e1e56b0fe05495db73135a229bb5b01b143cb9b9cd0789`

Reproduce each arm from its own checkout with the same tool versions:

```sh
CARGO_TARGET_DIR="$PWD/target" CARGO_PROFILE_RELEASE_OPT_LEVEL=z \
  wasm-pack build crates/rsvelte_compiler_wasm --out-dir ../../pkg \
  --target web --release
python3 - <<'PY'
from pathlib import Path
import gzip, hashlib
data = Path('pkg/rsvelte_compiler_bg.wasm').read_bytes()
print(len(data), len(gzip.compress(data, compresslevel=9, mtime=0)))
print(hashlib.sha256(data).hexdigest())
PY
```

Changing tool versions, dependencies or source changes the absolute sizes.

For a 300-element ASCII template, ten alternating baseline/candidate timing
rounds (100 calls per round, after warmup) measured a median parse time of
1.687 ms before and 0.888 ms after. The corresponding compile medians were
2.734 ms and 2.741 ms, within the observed round-to-round variation. Small ASCII
and Unicode compilation likewise stayed within that variation. These are
Node/V8 WASM microbenchmarks on a shared machine after the builds completed,
not a general compilation speed claim.

## Validation

The two matched artifacts were compared on the pinned Svelte source fixtures
(`7bc0a70fe64dbb3fa3848b741963f31d1e10a8dc`, Svelte 5.57.0):

- 4,536 components across client/server and development/production: 18,144
  outcomes compared, including complete successful JSON envelopes and errors.
  Each client configuration had 3,904 successes and 632 errors; each server
  configuration had 3,905 successes and 631 errors. No differences or traps.
- 61 rune modules across the same four configurations: 244 matching outcomes.
- Parsing all 4,536 components: 4,432 successful ASTs changed only JSON
  whitespace; 104 errors were unchanged. No data differences or traps.
- Chrome with Vite development and production builds: 16 scenarios covering
  main thread/Worker and default/explicit WASM URL initialization. Generated
  components mounted, updated on click, applied CSS and recovered after invalid
  input. Blocking the WASM request made the test fail as expected.
- The permanent compiler-only test compares ASCII, Unicode, TypeScript,
  comments and BOM inputs directly to the official modern parse API, for both
  compiler and playground bindings.

## Rejected alternatives

An earlier experiment routed AST serialization through `serde_json::Value` to
share still more code. It reduced raw size by 2.3% on a separate matched Rust
1.96.0/wasm-pack 0.13.1 pair, but nearly doubled parsing time for a large ASCII
input (300 repeated template elements, ten alternating rounds). That allocation
tradeoff is not in the final change. The native compiler is unchanged.

Rust `opt-level=s` produced a much larger artifact than `z` in the same
experiment. Disabling LLVM inlining saved little raw size and increased gzip
size. Neither setting was adopted. Removing SSR or public parsing would require
a separate feature-scope decision; neither is removed here.
