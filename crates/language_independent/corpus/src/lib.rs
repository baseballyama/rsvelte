//! The corpus (`corpus/`): real Svelte files in packs, the official tools' output for them, and
//! the conformance run that compares rsvelte with it and keeps the parity ledger. See
//! `corpus/README.md`.

#![expect(
    clippy::print_stderr,
    reason = "a test runner reports on stderr, as libtest does"
)]

mod compare;
mod ledger;
pub mod pack;
mod run;
mod sources;

pub use run::Conformance;
pub use sources::{Source, sources};
