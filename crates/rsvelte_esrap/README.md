# rsvelte_esrap

`rsvelte_esrap` prints an [OXC](https://oxc.rs/) JavaScript AST using the layout
of [esrap](https://github.com/Rich-Harris/esrap). It is the low-level printer
used by rsvelte's Svelte code generator.

> [!IMPORTANT]
> rsvelte is an independent implementation and is not affiliated with or
> endorsed by the Svelte project.

## API boundary

The crate accepts `oxc_ast::ast::Program` values and can return JavaScript plus
decoded source-map mappings. Because OXC AST types cross the public boundary,
the OXC version used by a release is part of its compatibility contract.
Consumers should align their `oxc_*` dependencies with the versions declared
by `rsvelte_esrap`.

The public API is limited to printer inputs, outputs, and options. Printer
visitors, command buffers, and layout state are implementation details.

## Compatibility and MSRV

- Minimum supported Rust version: **1.95**
- The crate is currently pre-1.0. Breaking API changes require a minor version
  bump and release notes.
- Output compatibility is covered by rsvelte's esrap and Svelte snapshot
  conformance suites.

## Documentation

- [API documentation](https://docs.rs/rsvelte_esrap)
- [Repository](https://github.com/baseballyama/rsvelte)
- [crates.io publication policy](https://github.com/baseballyama/rsvelte/blob/main/docs/crates-io-publishing.md)

## License

MIT. See [LICENSE](LICENSE).
