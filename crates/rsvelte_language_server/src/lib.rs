//! `rsvelte-language-server` — an LSP server exposing rsvelte's formatter and
//! linter to any LSP client (VS Code, Neovim, …).
//!
//! The message loop owns only protocol state; every analysis runs on the
//! [`worker`] thread, which is where the stack depth and panic isolation the
//! Svelte compiler needs are provided.

pub mod client;
pub mod diagnostics;
pub mod document;
pub mod format;
pub mod lint;
pub mod log;
pub mod server;
pub mod settings;
pub mod text;
pub mod uri;
pub mod worker;

pub use server::run_stdio;
