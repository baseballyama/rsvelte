# `@rsvelte/capi` — version carrier, not a package

Nothing here is published. The C ABI ships as the per-OS/arch archives on
[GitHub Releases](https://github.com/baseballyama/rsvelte/releases) under the
`capi-v*` tags, built by
[`release-capi.yml`](../../../.github/workflows/release-capi.yml).

This directory exists so **Changesets owns the C ABI's version**: Changesets
versions workspace packages, and the C ABI is a Rust crate. A changeset naming
`@rsvelte/capi` bumps the version here, `scripts/release/sync-version.mjs`
mirrors it into `crates/rsvelte_capi/Cargo.toml` (the same way every other crate
tracks the npm package it ships in), and merging the Version PR lets
[`capi-autotag.yml`](../../../.github/workflows/capi-autotag.yml) cut
`capi-v<version>` and start the release.

So the release procedure for the C ABI is: **write a changeset**. Do not edit
`crates/rsvelte_capi/Cargo.toml`'s version by hand: a hand edit below this
version is overwritten at the next release, and one above it makes
`sync-version.mjs` refuse to run at all rather than walk the C ABI backwards.

The version here starts at the crate's own, which #4274 takes to 0.2.0.
