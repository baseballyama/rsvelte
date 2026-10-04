# Special elements

The shared HIR, semantic facts and render plan drive both targets. Head, title and global
targets are separate from DOM children. Options produce no DOM node. Validation and
custom element configuration are computed once per file. Lowering builds a fresh JavaScript
tree. It never prints and parses an intermediate result.

| Element | Lowering |
|---|---|
| `svelte:boundary` | Runtime boundary, reactive getters, pending and failed snippets, destructured and default parameters, SSR markers |
| `svelte:window`, `svelte:document`, `svelte:body` | Global events, `on:` modifiers and forwarding, property and function bindings, `bind:this` |
| `svelte:head` | Filename hash, head renderer and title updates from semantic facts |
| `svelte:element` | Dynamic tag, attributes, classes, `bind:this`, attachments and namespaces |
| `svelte:options` | Runes, whitespace, namespaces and custom elements: props, accessors, shadow, extend, CSS and `$host` |

General language features still limit compilation. Components, general snippets, render tags,
await blocks, actions, transitions and style directives return unsupported diagnostics.
Native legacy mode and experimental async compilation are not covered.
This change does not establish full corpus compatibility.

## Verification

```sh
cargo test -p rsvelte_svelte_compile --test fixtures -- special-elements
cargo test -p rsvelte_svelte_compile --test special_validation
mise exec -- node --test tools/fixtures/test/special-elements.test.ts
cargo run -p rsvelte_svelte_compile --example layout
```

The Node test compares accepted output with Svelte 5.57.1 as JavaScript ASTs. The Rust test
checks actual output against the accepted output. Changing a boundary runtime call is the
positive control. Official snapshots were not edited. The measurement report records the
populations and results, including unsupported files.

| Verification population | Result |
|---|---|
| 74 hand-written files, both targets | 148 outputs match the official AST |
| Special-tag spelling selection: 1,149 files, both targets | 304 matches, 1,994 unsupported outputs, 0 AST differences |
| Whole compile crate: 20,235 cases | No test failures; imported oracle differences are counted, not failed |

Format, strict Clippy and structure checks pass. The JSON report also records whole-crate
oracle differences. Passing the fixture harness does not mean all imported files match Svelte.

## Measurement

[Later CPU and memory tuning](special-elements-tuning.md) measures actual macOS CPU
cycles and records a smaller final render region. The Linux results below are the earlier
frozen build.

[Results](measurements/special-elements.json) include input hashes, raw instruction counts,
phase allocation counts, oracle versions and binary hashes.
The [source manifest](measurements/special-elements-source.json) identifies a frozen dirty
source tree. It includes concurrent parser and CSS changes. These measurements do not isolate
this change from that work.

The main population has 20 files and 40 client/server outputs. The additional population has
8 files and 16 outputs covering custom elements and destructured boundary parameters.
Cachegrind 3.22.0 on Linux ARM64 measured release builds without allocation instrumentation.
A warm round is two rounds minus one round. CPU cycles are **UNMEASURED** because the VM
has no PMU. Instructions do not measure cycles or elapsed time.

| Main population | Warm instructions | Allocations | Allocated bytes | Peak live growth |
|---|---:|---:|---:|---:|
| Rewrite | 3,479,527 | 4,241 | 224,071 | 36,960 |
| Old Rust | 10,436,564 | UNMEASURED | UNMEASURED | UNMEASURED |
| Svelte, Node `--jitless` | 157,969,377 | UNMEASURED | UNMEASURED | UNMEASURED |

The official arm disables JIT. This comparison does not predict production V8 performance.
The additional population uses 1,848,515 instructions, 2,192 allocations and 117,069 allocated
bytes. Its peak live growth is 19,590 bytes. Allocation counts come from a separate metrics build.

Hashing uses stack buffers. HTML-only files do not allocate a namespace side table. Headless
files do not compute a head hash. Hoisted identifiers use immutable boxed slices. Rest prop
read optimization asks the parent tree and caches the result; it never scans source text.

| ARM64 layout | Size | Alignment |
|---|---:|---:|
| HIR node | 56 bytes | 8 bytes |
| Attribute | 64 bytes | 8 bytes |
| Render item | 48 bytes | 8 bytes |
| Cleaned region | 48 bytes | 8 bytes |

HIR node field offsets are span 0, kind 8 and parent 48. These are observations from this
build, not a stable ABI. Client and server together invoke validation once per file.
