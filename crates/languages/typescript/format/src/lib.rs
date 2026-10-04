//! TypeScript format.

pub mod format;
pub use format::*;

mod task;
pub use task::{Format, register};

pub use task::PLUGIN;
