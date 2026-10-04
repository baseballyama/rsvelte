//! TypeScript check.

pub mod check;
pub use check::*;

mod registration;
pub use registration::register;

pub use registration::PLUGIN;
pub use registration::register_service;
