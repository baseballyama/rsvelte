use rsvelte_svelte_syntax::syntax_tree::Component;

use super::{Result, lower};
use crate::syntax_tree::SyntaxTree;

/// [`lower`] outside the artifact database: it analyzes the component itself, when it must.
///
/// # Errors
///
/// As [`lower`].
pub fn lower_alone(component: &Component, source: &str, path: &str) -> Result<SyntaxTree> {
    let resolution = std::cell::OnceCell::new();
    let resolve = || {
        Some(resolution.get_or_init(|| {
            let lowered = rsvelte_svelte_semantic::compiler_syntax_tree::lower(component, source);
            rsvelte_svelte_semantic::resolve_component(component, &lowered)
        }))
    };
    lower(component, source, path, &resolve)
}
