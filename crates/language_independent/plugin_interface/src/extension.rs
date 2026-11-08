use rsvelte_kernel::computation::registry::Registry;

use crate::{CallError, Settings};

#[cfg(test)]
mod tests;

/// A plugin as a host installs it.
#[derive(Debug)]
pub struct Extension {
    /// The plugin's identifier, which is also the key of its options.
    pub identifier: &'static str,
    /// Registers the plugin's artifacts and tasks, configured from `settings`.
    pub install: fn(&mut Registry, &mut Settings) -> Result<(), CallError>,
}

/// Installs `extensions` in order, then refuses options none of them read.
///
/// # Errors
///
/// A plugin's installation failed, or options name no installed plugin that reads them.
pub fn install(
    registry: &mut Registry,
    extensions: &[&Extension],
    settings: &mut Settings,
) -> Result<(), CallError> {
    for extension in extensions {
        (extension.install)(registry, settings)?;
    }
    let mut unread = settings.unread().peekable();
    if unread.peek().is_none() {
        return Ok(());
    }
    let names: Vec<String> = unread.map(|identifier| format!("`{identifier}`")).collect();
    Err(CallError(format!(
        "no installed plugin reads the options of {}",
        names.join(", ")
    )))
}
