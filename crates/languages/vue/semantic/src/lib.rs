//! The Vue template as compiler-core reads it, and the facts the compiler and the tools share.
//!
//! | artifact | output |
//! |---|---|
//! | [`Lowered`] | the template as compiler-core reads it ([`compiler_syntax_tree`]) |
//! | [`Resolved`] | one scope analysis, compileScript's binding types ([`resolve::Resolution`]) |

pub mod compiler_syntax_tree;
pub mod expressions;
pub mod resolve;

pub(crate) mod computation;
pub use computation::{Lowered, PLUGIN, Resolved, register};
