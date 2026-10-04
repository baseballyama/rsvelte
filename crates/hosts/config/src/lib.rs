//! Configuration evaluation belongs to hosts, not the kernel.

pub mod native;
pub mod process;
pub mod text;
mod wire;

use std::collections::BTreeMap;
use std::path::Path;
use std::sync::Arc;

use rsvelte_kernel::computation::functions::CallError;
use serde::Deserialize;
use serde_json::value::RawValue;
pub use text::{TextContract, TextFunction};

#[derive(Debug, Default, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Configuration {
    #[serde(default)]
    pub plugins: BTreeMap<String, Box<RawValue>>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(tag = "backend", rename_all = "lowercase", deny_unknown_fields)]
pub enum FunctionReference {
    Runtime { handle: String },
    Native { library: String, symbol: String },
}

pub trait FunctionResolver: std::fmt::Debug + Send + Sync {
    /// # Errors
    /// The backend does not support the requested contract or function.
    fn resolve(
        &self,
        reference: &FunctionReference,
        contract: &'static TextContract,
    ) -> Result<TextFunction, CallError>;
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
        Ok(LoadedConfiguration {
            configuration,
            functions: Arc::new(native::Resolver::new(
                path.parent().expect("canonical file has a parent"),
            )),
        })
    }
}
