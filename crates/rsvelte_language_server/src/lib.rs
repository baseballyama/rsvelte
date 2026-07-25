//! `rsvelte-language-server` — an LSP server exposing rsvelte's formatter and
//! linter to any LSP client (VS Code, Neovim, …).
//!
//! Scope: document formatting and push diagnostics, both run in process
//! against the `rsvelte_fmt` / `rsvelte_lint` crates. Type checking stays with
//! `rsvelte-check`.

pub mod diagnostics;
pub mod document;
pub mod format;
pub mod lint;
pub mod server;
pub mod settings;
pub mod text;
pub mod uri;

pub use server::run_stdio;
