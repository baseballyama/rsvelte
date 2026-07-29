# rsvelte_projection

`rsvelte_projection` lowers Svelte components to TypeScript/TSX for editors,
language servers, and type-checking tools. It is part of
[rsvelte](https://github.com/baseballyama/rsvelte), an independent Rust
implementation targeting compatibility with Svelte 5.56.8.

Most embedders should depend on the higher-level `rsvelte` facade. This crate
is the lower-level projection engine and follows the `0.x` compatibility
policy: its data model may change between minor releases as language-tools
compatibility improves.

The minimum supported Rust version is 1.95.

External-import rewriting is a final, potentially length-changing text pass.
When it is enabled, projection artifacts deliberately omit source maps and
exact forward mappings rather than returning stale pre-rewrite coordinates.

API documentation is available on
[docs.rs](https://docs.rs/rsvelte_projection). The
[crates.io publication policy](https://github.com/baseballyama/rsvelte/blob/main/docs/crates-io-publishing.md)
documents the release and compatibility gates.

Licensed under the MIT License. See [LICENSE](LICENSE).
