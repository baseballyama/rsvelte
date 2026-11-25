//! The Node.js binding. `rsvelte/compiler` wraps these into the official `svelte/compiler` API,
//! and the package's `rsvelte` command runs the command line's; `tests/javascript.rs` tests both
//! through Node.js.

pub mod command;
pub mod compiler;
pub mod exports;
