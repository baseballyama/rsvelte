//! The JavaScript errors acorn throws while upstream parses a component.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_typescript_tree::SyntaxError;

use crate::input::ComponentInput;
use crate::resolve::Resolution;

/// The first error acorn throws while upstream parses the scripts.
///
/// That is where it stops in syntax oxc parsed, a name it declares twice that oxc lets TypeScript
/// declare again, or what oxc's checker rejects after the parser, whichever comes first. Where
/// acorn stops is its own verdict, so it wins over a checker's error at the same place.
#[must_use]
pub fn first(res: &Resolution) -> Option<SyntaxError> {
    [
        res.tree().acorn_rejection(),
        res.javascript_syntax_error().cloned(),
        res.semantic().acorn_redeclaration(),
    ]
    .into_iter()
    .flatten()
    .min_by_key(SyntaxError::acorn_at)
}

/// The [`first`] error that upstream raises as it parses, as Svelte reports it. A name the
/// template declares twice is not one: upstream's `declaration_duplicate`, raised later.
#[must_use]
pub fn parse_error(input: &ComponentInput<'_>, res: &Resolution) -> Option<Diagnostic> {
    first(res)
        .filter(|error| !redeclares_in_template(input, &error.diagnostic))
        .map(rsvelte_svelte_syntax::parse::javascript_failure)
}

/// Whether oxc's `error` is a name declared again outside the scripts.
fn redeclares_in_template(input: &ComponentInput<'_>, error: &Diagnostic) -> bool {
    let javascript = input.javascript;
    let start = error.span.start_offset;
    error.message.ends_with("has already been declared")
        && !(input.module.into_iter().chain(input.instance))
            .map(|program| javascript.get_program(program).span)
            .any(|span| span.start <= start && start < span.end)
}
