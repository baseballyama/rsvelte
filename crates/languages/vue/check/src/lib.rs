//! Vue check.

pub mod project;
pub use project::*;

mod configuration;
pub use configuration::{Configuration, TypeCheckConfiguration};
mod registration;
pub use registration::register;
