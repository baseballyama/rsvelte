use std::sync::Arc;

use rsvelte_kernel::computation::functions::CallError;
use serde::Deserialize;

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

#[derive(Debug)]
pub struct TextContract {
    pub identifier: &'static str,
    pub version: u32,
    pub arguments: &'static [&'static str],
}

type Implementation = dyn Fn(&[&str]) -> Result<String, CallError> + Send + Sync;

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
    /// Input does not match the contract or the backend failed.
    pub fn call(&self, arguments: &[&str]) -> Result<String, CallError> {
        if arguments.len() != self.contract.arguments.len() {
            return Err(CallError(
                "function argument count does not match its contract".into(),
            ));
        }
        (self.implementation)(arguments)
    }
}
