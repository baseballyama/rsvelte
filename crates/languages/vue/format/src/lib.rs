//! Vue format.

pub mod format;
pub use format::*;

mod task;
pub use task::{Format, PLUGIN, register};
