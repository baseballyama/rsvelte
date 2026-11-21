//! The JavaScript errors acorn throws while upstream parses a component.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_typescript_tree::{Acorn, SyntaxError};

use crate::component_input;
use crate::computation::Resolved;
use crate::input::ComponentInput;
use crate::resolve::Resolution;

/// The first error acorn throws while upstream parses the scripts.
///
/// That is where it stops in syntax oxc parsed, a name it declares twice that oxc lets TypeScript
/// declare again, or what oxc's checker rejects after the parser, whichever comes first. Where
/// acorn stops is its own verdict, so it wins over a checker's error at the same place.
#[must_use]
pub fn first(res: &Resolution) -> Option<SyntaxError> {
    first_and_whether_redeclared(res).map(|(error, _)| error)
}

/// [`first`], and whether it is a name declared again: oxc's TS2300 or acorn's own.
fn first_and_whether_redeclared(res: &Resolution) -> Option<(SyntaxError, bool)> {
    let checked = res.javascript_syntax_error().cloned().map(|error| {
        let redeclared = error.typescript_code == Some(2300);
        (error, redeclared)
    });
    [
        res.tree().acorn_rejection().map(|error| (error, false)),
        checked,
        res.semantic()
            .acorn_redeclaration()
            .map(|error| (error, true)),
    ]
    .into_iter()
    .flatten()
    .min_by_key(|(error, _)| error.acorn_at())
}

/// The first JavaScript syntax error that upstream's parser raises in the component, as Svelte
/// reports it: in the scripts or in the template's expressions, whichever comes first.
#[must_use]
pub fn of_document(context: &DocumentContext<'_>) -> Option<Diagnostic> {
    let input = component_input(context)?;
    let res = context.get::<Resolved>().as_ref()?;
    parse_error(&input, res)
}

/// The [`first`] error that upstream raises as it parses, as Svelte reports it. A name the
/// template declares twice is not one: upstream's `declaration_duplicate`, raised later.
#[must_use]
pub fn parse_error(input: &ComponentInput<'_>, res: &Resolution) -> Option<Diagnostic> {
    first_and_whether_redeclared(res)
        .filter(|(error, redeclared)| {
            !(*redeclared && !clashes(error) && outside_scripts(input, &error.diagnostic))
        })
        .map(|(error, _)| rsvelte_svelte_syntax::parse::javascript_failure(error))
}

/// Whether `error` is two parameters of one function with the same name, which acorn rejects as
/// it parses, in the template too.
fn clashes(error: &SyntaxError) -> bool {
    matches!(
        &error.acorn,
        Some(Acorn::Fails { message, .. }) if message == "Argument name clash"
    )
}

/// Whether `error` is outside the scripts.
fn outside_scripts(input: &ComponentInput<'_>, error: &Diagnostic) -> bool {
    let javascript = input.javascript;
    let start = error.span.start_offset;
    !input
        .programs()
        .map(|program| javascript.get_program(program).span)
        .any(|span| span.start <= start && start < span.end)
}
