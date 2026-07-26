//! Integration tests for the `rsvelte-fmt` CLI. The Svelte formatting path
//! and the batched `<style>` delegation path are exercised here; the latter
//! stands in a fake `oxfmt` (a `.cjs` run through `node`) so it needs no real
//! `oxfmt` on `$PATH`. Delegation of whole non-`.svelte` files to a real
//! `oxfmt` is covered by the corpus formatter-parity track (see
//! scripts/compat-corpus/README.md).

mod common;
mod config;
mod daemon;
mod delegation;
mod native;
mod stdin;
mod style;
mod tailwind;
mod write_check;
