use std::sync::Arc;

use rsvelte_kernel::computation::functions::CallError;

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
