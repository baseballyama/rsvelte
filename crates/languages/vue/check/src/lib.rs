//! Vue check.

pub(crate) mod project;

mod configuration;
mod extension;
pub use configuration::{Configuration, TypeCheckConfiguration};
pub use extension::EXTENSION;
mod registration;
pub use registration::{PLUGIN, register};
