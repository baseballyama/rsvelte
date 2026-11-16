//! A component whose script does not parse: svelte2tsx blanks the scripts before Svelte parses
//! the markup, so TypeScript reports the script's syntax, reading it as TSX or JSX.

use std::sync::Arc;

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_typescript_projection::{Refusal, checked_as_typescript, unparsed_script};
use rsvelte_typescript_check::{TypeScriptDocument, TypeScriptEnv};

/// The document to check, or `None` when the markup does not parse either.
pub(super) fn view<'e>(
    source_text: &str,
    env: impl FnOnce() -> Result<&'e Arc<TypeScriptEnv>, Diagnostic>,
) -> Option<Result<TypeScriptDocument, Diagnostic>> {
    let component = rsvelte_svelte_syntax::parse::parse_without_scripts(source_text).ok()?;
    if let Some(Refusal::Thrown { message, span }) = component
        .module
        .as_ref()
        .and_then(|module| unparsed_script(source_text, module.content, true).refusal)
    {
        return Some(Ok(TypeScriptDocument::Rejected {
            message: message.to_owned(),
            span,
        }));
    }
    let typescript = checked_as_typescript(&component, source_text);
    let env = match env() {
        Ok(env) => env,
        Err(error) => return Some(Err(error)),
    };
    let mut projection = Emitter::new();
    if let Some(line) = super::directive::of(&component, source_text) {
        projection.push(line);
    }
    if let Some(module) = &component.module {
        projection.copy(source_text, module.content);
        projection.push("\n");
    }
    // The instance script runs in svelte2tsx's render function, after its imports.
    if let Some(instance) = &component.instance {
        let script = unparsed_script(source_text, instance.content, false);
        for &import in &script.imports {
            projection.copy(source_text, import);
            projection.push("\n");
        }
        projection.push("function $$render() {\n");
        let mut skipped: Vec<Span> = script.imports;
        skipped.extend(script.removed);
        skipped.sort_unstable_by_key(|at| at.start_offset);
        let mut from = instance.content.start_offset;
        for at in skipped {
            // An import and a removed export are never the same text.
            projection.copy(source_text, Span::new(from, at.start_offset));
            from = at.end_offset;
        }
        projection.copy(source_text, Span::new(from, instance.content.end_offset));
        // svelte2tsx ends the script with a `;` at its end tag, where a script cut short fails.
        let end = instance.content.end_offset;
        projection.push("\n");
        projection.atom(";", Span::new(end, end + 1));
        projection.push("\n}\n");
    }
    projection.push("export {};\n");
    Some(Ok(TypeScriptDocument::Checked {
        projection,
        map_back: Emitter::lookup_span,
        env: Arc::clone(env),
        extension: if typescript { ".tsx" } else { ".jsx" },
        imports: Vec::new(),
        store_reads: Vec::new(),
    }))
}
