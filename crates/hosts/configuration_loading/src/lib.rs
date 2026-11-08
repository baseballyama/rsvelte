//! Configuration evaluation belongs to hosts, not the kernel; each plugin decodes its own
//! options through `rsvelte_plugin_interface`.

// Loading native libraries and running processes need an operating system.
#[cfg(not(target_arch = "wasm32"))]
pub mod native;
#[cfg(not(target_arch = "wasm32"))]
pub mod process;
mod wire;

use std::collections::BTreeMap;
use std::path::Path;
use std::sync::Arc;

use rsvelte_kernel::computation::functions::CallError;
use rsvelte_plugin_interface::FunctionResolver;
#[cfg(target_arch = "wasm32")]
use rsvelte_plugin_interface::NoFunctions;
use serde::Deserialize;
use serde_json::value::RawValue;

#[derive(Debug, Default, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Configuration {
    /// Each plugin's options, by plugin identifier; the plugin decodes them.
    #[serde(default)]
    pub plugins: BTreeMap<String, Box<RawValue>>,
}

#[derive(Debug)]
pub struct LoadedConfiguration {
    pub configuration: Configuration,
    pub functions: Arc<dyn FunctionResolver>,
}

pub trait Loader: std::fmt::Debug {
    /// # Errors
    /// Configuration evaluation or decoding failed.
    fn load(&self, path: &Path) -> Result<LoadedConfiguration, CallError>;
}

#[derive(Debug)]
pub struct JsonLoader;

impl Loader for JsonLoader {
    fn load(&self, path: &Path) -> Result<LoadedConfiguration, CallError> {
        let path = std::fs::canonicalize(path).map_err(|error| CallError(error.to_string()))?;
        let text = wire::read(&path)?;
        let configuration = serde_json::from_str(&text)
            .map_err(|error| CallError(format!("{}: {error}", path.display())))?;
        #[cfg(not(target_arch = "wasm32"))]
        let functions: Arc<dyn FunctionResolver> = Arc::new(native::Resolver::new(
            path.parent().expect("canonical file has a parent"),
        ));
        #[cfg(target_arch = "wasm32")]
        let functions: Arc<dyn FunctionResolver> = Arc::new(NoFunctions);
        Ok(LoadedConfiguration {
            configuration,
            functions,
        })
    }
}
