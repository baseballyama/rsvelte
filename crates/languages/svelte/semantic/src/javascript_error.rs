//! The JavaScript errors acorn throws while upstream parses a component.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_syntax::Parsed;
use rsvelte_svelte_syntax::syntax_tree::{Component, Style};
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::{Acorn, SyntaxError, Tree};

use crate::computation::Resolved;
use crate::resolve::Resolution;

/// The first error acorn throws while upstream parses the scripts.
///
/// That is where it stops in syntax oxc parsed, a name it declares twice that oxc lets TypeScript
/// declare again, or what oxc's checker rejects after the parser, whichever comes first. Where
/// acorn stops is its own verdict, so it wins over a checker's error at the same place.
#[must_use]
pub fn first(res: &Resolution) -> Option<SyntaxError> {
    first_of(res.tree(), [res.semantic()], |_, _| true)
}

/// The [`first`] error that upstream raises as it parses, as Svelte reports it.
#[must_use]
pub fn parse_error(res: &Resolution) -> Option<Diagnostic> {
    raised_first(res.tree(), [res.semantic()], |_| true)
}

/// The first JavaScript syntax error upstream's parser raises in the component, of those `keep`
/// keeps.
///
/// It is in the scripts or in the template's expressions, whichever comes first, as Svelte reports
/// it. In a component the parser rejects, it is the first raised before the parser's own error.
#[must_use]
pub fn of_document(
    context: &DocumentContext<'_>,
    keep: impl Fn(&Diagnostic) -> bool,
) -> Option<Diagnostic> {
    match context.get::<Parsed>() {
        Ok(_) => {
            let res = context.get::<Resolved>().as_ref()?;
            raised_first(res.tree(), [res.semantic()], |error| {
                keep(&error.diagnostic)
            })
        }
        Err(error) => {
            let parts = Semantic::of_each_part(error.read());
            // Acorn has read the token the parser stops at.
            raised_first(error.read(), &parts, |javascript| {
                javascript.acorn_raised_at() <= error.raised_at() && keep(&javascript.diagnostic)
            })
        }
    }
}

/// [`rsvelte_svelte_syntax::fully_parsed`], whose error is the one upstream raises first.
///
/// Acorn throws in a part as the parser reads it: before the parser stops, and before the style
/// sheet's error when the part comes before the sheet.
///
/// # Errors
///
/// The first error upstream's parser raises.
pub fn fully_parsed<'a>(context: &'a DocumentContext<'_>) -> Result<&'a Component, Diagnostic> {
    let error = match rsvelte_svelte_syntax::fully_parsed(context) {
        Ok(component) => return Ok(component),
        Err(error) => error,
    };
    // A parsed component's error is its style sheet's; [`of_document`] knows where the parser
    // raised a parse error.
    let raised_at = (context.get::<Parsed>().as_ref().ok())
        .and_then(|component| component.style.as_ref())
        .map_or(u32::MAX, Style::raised_at);
    let javascript = of_document(context, |javascript| {
        javascript.span.start_offset < raised_at
    });
    Err(javascript.unwrap_or_else(|| error.clone()))
}

/// The [`first_of`] error that upstream raises as it parses, as Svelte reports it. A name the
/// template declares twice is not one: upstream's `declaration_duplicate`, raised later.
fn raised_first<'s>(
    tree: &Tree,
    semantics: impl IntoIterator<Item = &'s Semantic>,
    keep: impl Fn(&SyntaxError) -> bool,
) -> Option<Diagnostic> {
    first_of(tree, semantics, |error, redeclared_by| {
        let template = redeclared_by.is_some_and(|semantic| {
            !clashes(error)
                && outside_programs(tree, &error.diagnostic)
                && semantic.redeclares_in_host_scope(error.acorn_at())
        });
        !template && keep(error)
    })
    .map(rsvelte_svelte_syntax::parse::javascript_failure)
}

/// The first error acorn throws in `tree`'s parts, which `semantics` analyze, of those `keep`
/// keeps, given the analysis of a name declared again: oxc's TS2300 or acorn's own.
fn first_of<'s>(
    tree: &Tree,
    semantics: impl IntoIterator<Item = &'s Semantic>,
    keep: impl Fn(&SyntaxError, Option<&Semantic>) -> bool,
) -> Option<SyntaxError> {
    let analyzed = semantics.into_iter().flat_map(|semantic| {
        // Every error: one upstream raises later than parsing can hide the next.
        let checked = semantic
            .javascript_syntax_errors()
            .iter()
            .map(move |error| {
                let redeclared = error.typescript_code == Some(2300);
                (error.clone(), redeclared.then_some(semantic))
            });
        let redeclared = (semantic.acorn_redeclaration()).map(|error| (error, Some(semantic)));
        checked.chain(redeclared)
    });
    (tree
        .acorn_rejection()
        .map(|error| (error, None))
        .into_iter())
    .chain(analyzed)
    .filter(|(error, redeclared_by)| keep(error, *redeclared_by))
    .min_by_key(|(error, _)| error.acorn_raised_at())
    .map(|(error, _)| error)
}

/// Whether `error` is two parameters of one function with the same name, which acorn rejects as
/// it parses, in the template too.
fn clashes(error: &SyntaxError) -> bool {
    matches!(
        &error.acorn,
        Some(Acorn::Fails { message, .. } | Acorn::FailsLater { message, .. })
            if message == "Argument name clash"
    )
}

/// Whether `error` is outside the programs of `tree`, the component's scripts.
fn outside_programs(tree: &Tree, error: &Diagnostic) -> bool {
    let start = error.span.start_offset;
    !tree
        .programs()
        .any(|(_, program)| program.span.start <= start && start < program.span.end)
}

#[cfg(test)]
mod tests;
