//! The scripts' first rune error, which upstream's analysis meets before the template.

use super::{Awaits, walk_scripts, walk_template};
use crate::lower::{CompileInput, Diagnostic, Resolution, Target};

/// The first upstream error the scripts raise, which upstream's analysis meets before the
/// template, and whether the module raises it.
pub(in crate::lower) fn script_error(
    input: &CompileInput<'_>,
    res: &Resolution,
    custom_element: bool,
) -> Option<(bool, Diagnostic)> {
    let walk = walk_scripts(input, res, Target::Client, custom_element, Awaits::Here);
    let error = walk.error.filter(|error| error.code != "unsupported")?;
    Some(in_module(input, error))
}

/// Whether the module raises `error`, with it.
fn in_module(input: &CompileInput<'_>, error: Diagnostic) -> (bool, Diagnostic) {
    let module = input.component.module.is_some_and(|module| {
        let span = input.component.javascript.get_program(module).span;
        (span.start..span.end).contains(&error.span.start_offset)
    });
    (module, error)
}

/// The scripts' first error as [`script_error`] gives it, and the template's as
/// [`check_runes`](super::check_runes) gives it for the client, from one walk over the scripts.
pub(in crate::lower) fn script_and_template_errors(
    input: &CompileInput<'_>,
    res: &Resolution,
    custom_element: bool,
) -> (Option<(bool, Diagnostic)>, Option<Diagnostic>) {
    let mut walk = walk_scripts(input, res, Target::Client, custom_element, Awaits::Here);
    match walk.error.take() {
        Some(error) if error.code == "unsupported" => (None, None),
        Some(error) => (Some(in_module(input, error.clone())), Some(error)),
        None => (None, walk_template(input, walk).err()),
    }
}
