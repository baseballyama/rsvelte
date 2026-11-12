//! A component whose script does not parse: svelte2tsx blanks the scripts before Svelte parses
//! the markup, so TypeScript reports the script's syntax, reading it as TSX or JSX.

use std::sync::Arc;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_typescript_check::{TypeScriptDocument, TypeScriptEnv};

/// The document to check, or `None` when the markup does not parse either.
pub(super) fn view<'e>(
    source_text: &str,
    env: impl FnOnce() -> Result<&'e Arc<TypeScriptEnv>, Diagnostic>,
) -> Option<Result<TypeScriptDocument, Diagnostic>> {
    let component = rsvelte_svelte_syntax::parse::parse_without_scripts(source_text).ok()?;
    let scripts = [&component.module, &component.instance];
    let typescript = scripts
        .iter()
        .copied()
        .flatten()
        .any(|script| script.typescript);
    let env = match env() {
        Ok(env) => env,
        Err(error) => return Some(Err(error)),
    };
    let mut projection = Emitter::new();
    if let Some(module) = &component.module {
        projection.copy(source_text, module.content);
        projection.push("\n");
    }
    // The instance script runs in svelte2tsx's render function.
    if let Some(instance) = &component.instance {
        projection.push("function $$render() {\n");
        projection.copy(source_text, instance.content);
        projection.push("\n}\n");
    }
    projection.push("export {};\n");
    Some(Ok(TypeScriptDocument::Checked {
        projection,
        map_back: Emitter::lookup_span,
        env: Arc::clone(env),
        placement: Vec::new(),
        extension: if typescript { ".tsx" } else { ".jsx" },
    }))
}
