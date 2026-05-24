# rsvelte_capi

Universal C ABI for the rsvelte Svelte compiler. The intent is one
shared library + one header that **any** language with a C FFI can call
— without forcing each language ecosystem onto a generated schema.

## Status

| Language          | Mechanism                                | Smoke verified locally | CI step |
| ----------------- | ---------------------------------------- | :--------------------: | :-----: |
| C                 | `rsvelte.h` + `cc`                       | ✅                     | ✅      |
| Go                | cgo                                      | ✅                     | ✅      |
| Python            | `ctypes`                                 | ✅                     | ✅      |
| Ruby              | stdlib `fiddle`                          | ✅                     | ✅      |
| Zig               | `@cImport`                               | ✅                     | ✅      |
| PHP (7.4+)        | built-in `FFI` extension                 | code shipped           | ✅      |
| Java (JDK 22+)    | `java.lang.foreign` (FFM API)            | code shipped           | ✅      |
| C++               | include `rsvelte.h` (extern "C" guarded) | covered by C smoke     | —       |
| Rust              | depend on `svelte-compiler-rust` direct  | —                      | —       |
| Kotlin / Scala    | same as Java (FFM)                       | code shipped           | —       |
| .NET (C# / F#)    | `[DllImport]` / `LibraryImport`          | applicable             | —       |
| Swift             | bridging header                          | applicable             | —       |

The CI workflow (`.github/workflows/rsvelte-capi.yml`) runs the entire
matrix on Linux, macOS, and Windows for every PR that touches the C ABI
or the compiler.

## Build

```bash
cargo build -p rsvelte_capi --release
# Produces:
#   target/release/librsvelte_capi.dylib   (macOS)
#   target/release/librsvelte_capi.so      (Linux)
#   target/release/rsvelte_capi.dll        (Windows)
#   target/release/librsvelte_capi.a       (static archive)
# Plus:
#   crates/rsvelte_capi/include/rsvelte.h  (regenerated via cbindgen)
```

## API at a glance

```c
typedef struct RsvelteBuf {
  uint8_t  *data;   // UTF-8 JSON bytes (may be NULL when len == 0)
  uintptr_t len;    // length in bytes
  uintptr_t cap;    // reserved for rsvelte_free / rsvelte_free_raw
} RsvelteBuf;

const char *rsvelte_version(void);                    // static string, do not free
void        rsvelte_free(RsvelteBuf buf);             // release any returned buffer (struct-by-value)
void        rsvelte_free_raw(uint8_t *data,           // out-of-band variant for hosts that can't
                             uintptr_t len,           //   pass structs by value (Ruby Fiddle, etc.)
                             uintptr_t cap);

// struct-by-value return — preferred when the host language supports it
RsvelteBuf  rsvelte_compile       (const uint8_t *src, uintptr_t src_len,
                                   const uint8_t *opts_json, uintptr_t opts_len);
RsvelteBuf  rsvelte_compile_module(const uint8_t *src, uintptr_t src_len,
                                   const uint8_t *opts_json, uintptr_t opts_len);

// out-parameter variants — write result through `out`
void        rsvelte_compile_into       (..., RsvelteBuf *out);
void        rsvelte_compile_module_into(..., RsvelteBuf *out);
```

### JSON envelope

Every call returns one of:

```json
{ "ok": true,  "result": { "js": {...}, "css": {...} | null, "warnings": [...], "metadata": { "runes": false } } }
{ "ok": false, "error":  { "message": "..." } }
```

`opts_json` is the same shape as the existing NAPI options object
(camelCase, all fields optional). Pass `NULL` / length 0 to use the
defaults.

### Memory ownership

- Inputs are **borrowed** for the duration of the call.
- Every non-empty `RsvelteBuf` returned by this library is **owned by
  the caller** and must be released exactly once with `rsvelte_free`
  (or `rsvelte_free_raw` for hosts that can't pass structs by value).
- A zero-initialised buffer (`{NULL, 0, 0}`) is safe to free.
- `rsvelte_version` returns a pointer into static storage — do **not**
  free it.

## Examples

| Language | Path                              | How to run                                              |
| -------- | --------------------------------- | ------------------------------------------------------- |
| C        | `examples/c/smoke.c`              | `cc -I include -L ../../../target/release …`            |
| Go       | `examples/go/smoke.go`            | `go run ./crates/rsvelte_capi/examples/go`              |
| Python   | `examples/python/smoke.py`        | `python3 crates/rsvelte_capi/examples/python/smoke.py`  |
| Ruby     | `examples/ruby/smoke.rb`          | `ruby crates/rsvelte_capi/examples/ruby/smoke.rb`       |
| Zig      | `examples/zig/smoke.zig`          | `zig build-exe … -I include -L target/release …`        |
| PHP      | `examples/php/smoke.php`          | `php -d ffi.enable=true crates/rsvelte_capi/examples/php/smoke.php` |
| Java     | `examples/java/Smoke.java`        | `java --enable-native-access=ALL-UNNAMED crates/rsvelte_capi/examples/java/Smoke.java` (JDK 22+) |

Each example exercises: default options, runes+dev, SSR generation,
`compile_module` with a `$state` rune, and the malformed-options error
path.

## Test infrastructure (breaking-change guard)

`crates/rsvelte_capi/tests/` contains five Rust integration test files
designed to make any breaking change to the FFI surface fail loudly in
CI:

| File                   | What it locks down                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `envelope.rs`          | The exact JSON envelope shape (`ok`, `result.js.code`, `warnings[].code`, etc.)           |
| `options_coverage.rs`  | Every documented `CompileOption` is accepted, and most have observable codegen effect     |
| `module.rs`            | `rsvelte_compile_module` envelope shape + runes / SSR variants                            |
| `header_invariants.rs` | Required exports are present in `include/rsvelte.h` AND it byte-matches fresh cbindgen    |
| `memory.rs`            | Free is no-op on empty buffer; 1000-iteration compile loop checks for double-free / leaks |

In addition, the build script panics when `RSVELTE_CAPI_CHECK_HEADER=1`
and the committed header would change — CI sets that env var. So if a
PR renames an exported function, changes the `RsvelteBuf` layout, or
re-shapes the envelope, **the build itself fails** with a clear
message, before any downstream wrapper smoke even runs.

## Design notes

- **JSON I/O instead of binary schema.** Keeps the surface stable
  across language ecosystems without forcing every consumer to depend
  on protobuf/flatbuffers code generation. The compile cost dominates;
  envelope serialisation is comparatively free.
- **`rsvelte_*` symbol prefix.** Avoids collisions when linked into
  larger processes.
- **No global error state.** Errors live in the JSON envelope so the
  ABI stays thread-safe by default.
- **Struct-by-value + decomposed-args duality.** The struct-return
  functions are the ergonomic path; the `*_into` and `*_free_raw`
  variants exist for hosts whose FFI can't construct struct-by-value
  ABI calls on every platform (Ruby Fiddle on AArch64, for instance).
- **`#[unsafe(no_mangle)]` + edition 2024.** Requires `cbindgen >= 0.28`
  to parse correctly.
