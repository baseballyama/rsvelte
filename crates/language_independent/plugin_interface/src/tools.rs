use crate::CallError;

#[cfg(test)]
mod tests;

/// An external program a plugin will run, as a measurement report names it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Tool {
    pub command: String,
    pub version: String,
}

/// The programs a run will run, each once.
#[derive(Debug, Default)]
pub(crate) struct Tools(Vec<Tool>);

impl Tools {
    pub(crate) fn record(
        &mut self,
        command: String,
        version: impl FnOnce() -> Result<String, CallError>,
    ) -> Result<(), CallError> {
        if !self.0.iter().any(|tool| tool.command == command) {
            let version = version()?;
            self.0.push(Tool { command, version });
        }
        Ok(())
    }

    pub(crate) fn as_slice(&self) -> &[Tool] {
        &self.0
    }
}
