use std::sync::Arc;

use rsvelte_kernel::computation::functions::CallError;
use serde::Deserialize;

#[cfg(test)]
mod tests;

/// A function the configuration names in a plugin's options, by the backend that runs it.
#[derive(Clone, Debug, Deserialize)]
#[serde(tag = "backend", rename_all = "lowercase", deny_unknown_fields)]
pub enum FunctionReference {
    /// A function the configuration's own runtime holds, by its handle.
    Runtime { handle: String },
    /// A symbol of a native library, relative to the configuration file.
    Native { library: String, symbol: String },
}

/// Turns a function reference into a function a plugin can call.
pub trait FunctionResolver: std::fmt::Debug + Send + Sync {
    /// # Errors
    /// The backend does not support the requested contract or function.
    fn resolve(
        &self,
        reference: &FunctionReference,
        contract: &'static TextContract,
    ) -> Result<TextFunction, CallError>;
}

/// Resolves no function: for a host with no configuration file.
#[derive(Debug)]
pub struct NoFunctions;

impl FunctionResolver for NoFunctions {
    fn resolve(
        &self,
        _: &FunctionReference,
        contract: &'static TextContract,
    ) -> Result<TextFunction, CallError> {
        Err(CallError(format!(
            "`{}` needs a configuration file to resolve its function",
            contract.identifier
        )))
    }
}

/// What a plugin and a backend agree a function takes: named text arguments, and text back.
#[derive(Debug)]
pub struct TextContract {
    pub identifier: &'static str,
    pub version: u32,
    /// The arguments' names, in the order they are passed.
    pub arguments: &'static [&'static str],
}

type Implementation = dyn Fn(&[&str]) -> Result<String, CallError> + Send + Sync;

/// A resolved function. A backend may rely on every call passing exactly the contract's
/// arguments.
#[derive(Clone)]
pub struct TextFunction {
    contract: &'static TextContract,
    implementation: Arc<Implementation>,
}

impl std::fmt::Debug for TextFunction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("TextFunction")
            .field("contract", &self.contract)
            .finish_non_exhaustive()
    }
}

impl TextFunction {
    pub fn new(
        contract: &'static TextContract,
        implementation: impl Fn(&[&str]) -> Result<String, CallError> + Send + Sync + 'static,
    ) -> Self {
        Self {
            contract,
            implementation: Arc::new(implementation),
        }
    }

    /// # Errors
    /// `arguments` is not as many as the contract names, or the backend failed.
    pub fn call(&self, arguments: &[&str]) -> Result<String, CallError> {
        // Native backends size their argument buffers from the contract, so this guards memory.
        let expected = self.contract.arguments.len();
        if arguments.len() != expected {
            return Err(CallError(format!(
                "`{}` takes {expected} arguments, not {}",
                self.contract.identifier,
                arguments.len()
            )));
        }
        (self.implementation)(arguments)
    }
}
