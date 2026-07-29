# rsvelte

`rsvelte` is the stable Rust facade for embedding the rsvelte Svelte compiler.
It exposes owned, compiler-neutral options, artifacts, diagnostics, and
component facts while keeping rsvelte's AST, OXC version, phase types, and
internal compiler errors out of an embedder's public dependency boundary.

The facade performs no filesystem access and owns no cache, scheduler, thread
pool, or global allocator. A prepared component borrows its source, can move to
one worker, and reuses one parse and analysis pass for client and server output.

```rust
use rsvelte::{ComponentOptions, Engine, RuntimeTarget};

let source = "<h1>Hello</h1>";
let engine = Engine::new();
let mut component = engine.prepare(
    source,
    ComponentOptions::new().filename("App.svelte"),
)?;
let client = component.compile(RuntimeTarget::Client)?;

assert!(client.javascript.code.contains("svelte/internal/client"));
# Ok::<(), rsvelte::CompileFailure>(())
```

The default feature set is intentionally empty. Higher-level products such as
formatting, linting, language-server support, file watching, and command-line
interfaces are separate rsvelte packages.

Enable the opt-in `projection` feature to generate TypeScript/TSX for editor
and type-checking integrations:

```rust
# #[cfg(feature = "projection")]
# {
use rsvelte::{Engine, ProjectionOptions};

let artifact = Engine::new().project(
    r#"<script lang="ts">export let name: string;</script>"#,
    ProjectionOptions::new()
        .filename("Greeting.svelte")
        .typescript(true),
)?;
assert!(artifact.code.contains("name"));
# }
# Ok::<(), Box<dyn std::error::Error>>(())
```

`ComponentOptions::fixed_css_scope` is the deterministic alternative to a
function-valued `cssHash` option. The facade always returns all diagnostics;
embedders apply warning policy after compilation so cached artifacts never
depend on a stateful filter callback.

For persistent caches, combine:

- `Engine::fingerprint()`;
- `ComponentOptions::cache_key()` or `ProjectionOptions::cache_key()`;
- the source-content identity; and
- the requested output target.

The option keys cover every public field using a versioned canonical encoding.
They intentionally do not hash source text or compiler versions.

This project is an independent implementation and is not affiliated with the
Svelte project.

API documentation is available on [docs.rs](https://docs.rs/rsvelte). The
[crates.io publication policy](https://github.com/baseballyama/rsvelte/blob/main/docs/crates-io-publishing.md)
documents the release and compatibility gates.

Licensed under the MIT License. See the
[license text](https://github.com/baseballyama/rsvelte/blob/main/LICENSE).
