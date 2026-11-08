//! How a host installs a plugin without knowing what it is: the plugin reads its own options,
//! learns which of its tasks will run, and records the external programs it will run.

mod extension;
mod functions;
mod options;
mod program;
mod selection;
mod settings;
mod tools;

pub use extension::{Extension, install};
pub use functions::{FunctionReference, FunctionResolver, NoFunctions, TextContract, TextFunction};
pub use options::PluginOptions;
pub use program::program_path;
pub use selection::{Selection, TaskKind};
pub use settings::Settings;
pub use tools::Tool;
