//! Workspace-internal support for out-of-process bindings.
//!
//! These wire formats and Vite helpers are deliberately excluded from the
//! public compiler API.

pub(crate) mod ast {
    pub use rsvelte_core::ast::*;
}

pub(crate) mod compiler {
    pub use rsvelte_core::compiler::*;
}

pub mod napi_raw;
pub mod napi_raw_parse;
pub mod vps;
