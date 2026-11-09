//! Svelte compilation tasks.

pub(crate) mod computation;
pub(crate) mod input;
pub mod lower;
pub mod render_plan;
pub mod stylesheet;

mod compiler;
mod configuration;
mod emit;
mod extension;
mod identity;
mod markup;
mod task;
mod warnings;

pub use compiler::{
    CompileOptions, CompileResult, JavaScript, ModuleCompileOptions, VERSION, compile,
    compile_module,
};
pub use computation::{Identified, Planned, ScopedStylesheet};
pub use configuration::{Configuration, CssHash, CssHashInput};
pub use emit::LoweredModule;
pub use extension::EXTENSION;
pub use identity::OutputIdentity;
pub use input::{CompileInput, Target};
pub use render_plan::RenderPlan;
pub use task::{
    Compile, PLUGIN, compile_input, lower_document, register, register_with_configuration,
};
pub use warnings::Warn;
