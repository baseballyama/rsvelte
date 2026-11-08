//! Typed function contracts. Hosts own runtime and library lifetimes.

#[cfg(test)]
mod tests;

use std::sync::Arc;

pub trait Contract: 'static {
    type Input<'a>;
    type Output;
    const IDENTIFIER: &'static str;
    const VERSION: u32;
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct CallError(pub String);

impl std::fmt::Display for CallError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.0)
    }
}

impl std::error::Error for CallError {}

type Outcome<C> = Result<<C as Contract>::Output, CallError>;
type Implementation<C> = dyn for<'a> Fn(<C as Contract>::Input<'a>) -> Outcome<C> + Send + Sync;

pub struct Function<C: Contract>(Arc<Implementation<C>>);

impl<C: Contract> Clone for Function<C> {
    fn clone(&self) -> Self {
        Self(Arc::clone(&self.0))
    }
}

impl<C: Contract> std::fmt::Debug for Function<C> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("Function")
            .field("contract", &C::IDENTIFIER)
            .field("version", &C::VERSION)
            .finish_non_exhaustive()
    }
}

impl<C: Contract> Function<C> {
    pub fn new(
        implementation: impl for<'a> Fn(C::Input<'a>) -> Result<C::Output, CallError>
        + Send
        + Sync
        + 'static,
    ) -> Self {
        Self(Arc::new(implementation))
    }

    /// # Errors
    /// The implementation rejected the input or its runtime failed.
    pub fn call(&self, input: C::Input<'_>) -> Result<C::Output, CallError> {
        (self.0)(input)
    }
}
