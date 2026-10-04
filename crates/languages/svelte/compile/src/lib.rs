//! Svelte compilation tasks.

pub mod computation;
pub mod input;
pub mod lower;
pub mod render_plan;
pub mod stylesheet;

mod configuration;
mod emit;
mod identity;
mod markup;
mod task;

pub use computation::{Identified, Planned, ScopedStylesheet};
pub use configuration::{Configuration, CssHash, CssHashInput};
pub use emit::LoweredModule;
pub use identity::OutputIdentity;
pub use input::{CompileInput, Target};
pub use render_plan::RenderPlan;
pub use task::{
    Compile, PLUGIN, compile, compile_with_configuration, register, register_with_configuration,
};
