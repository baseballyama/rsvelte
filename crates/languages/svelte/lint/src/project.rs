//! The facts about a document's project that a host with a file system finds next to it, as
//! `svelte-eslint-parser` and `eslint-plugin-svelte` find them.

use std::path::{Path, PathBuf};

use rsvelte_kernel::computation::registry::Registry;

use crate::SvelteConfig;
use crate::computation::SvelteConfiguration;

#[cfg(test)]
mod tests;

/// Answers [`SvelteConfiguration`] from the files around each document. Each answer is read when
/// a rule first asks for it.
pub fn register_file_system(registry: &mut Registry) {
    registry.provide::<SvelteConfiguration>(
        "svelte.lint.file_system",
        |_| true,
        |context| svelte_config_near(Path::new(&context.document.path)),
    );
}

/// The document's path as `ESLint` names it: absolute, from the current directory.
fn absolute(path: &Path) -> PathBuf {
    std::path::absolute(path).unwrap_or_else(|_| path.to_owned())
}

/// The nearest `svelte.config.js` above the document, statically evaluated
/// (`resolveSvelteConfig`); the default without one. A document that is not a file is looked up
/// from the current directory, as upstream does.
fn svelte_config_near(document: &Path) -> Result<SvelteConfig, String> {
    let file = absolute(document);
    let start = match file.parent() {
        Some(directory) if file.is_file() => directory.to_owned(),
        _ => std::env::current_dir().map_err(|e| format!("the current directory: {e}"))?,
    };
    // Upstream stops before the file system's root.
    let Some(config) = start
        .ancestors()
        .filter(|directory| directory.parent().is_some())
        .map(|directory| directory.join("svelte.config.js"))
        .find(|candidate| candidate.is_file())
    else {
        return Ok(SvelteConfig::default());
    };
    let source =
        std::fs::read_to_string(&config).map_err(|e| format!("{}: {e}", config.display()))?;
    crate::svelte_config::parse(&source).map_err(|e| format!("{}: {e}", config.display()))
}
