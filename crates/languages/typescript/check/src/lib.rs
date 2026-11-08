//! TypeScript check.

pub mod check;
pub use check::*;

mod extension;
pub use extension::{EXTENSION, NEEDS_TYPE_CHECKER, type_checker};
mod registration;
pub use registration::{PLUGIN, register, register_service};
