//! TypeScript lint.

pub mod lint;
pub use lint::*;

mod task;
pub use task::{Lint, register};

pub use task::PLUGIN;
