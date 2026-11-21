//! The scripts' first rune error, which upstream's analysis meets before the template.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_svelte_semantic::warnings::Section;

use super::{Awaits, walk_scripts, walk_template};
use crate::input::{CompileInput, Target};
use crate::lower::section_at;

/// The first upstream error the scripts raise, which upstream's analysis meets before the
/// template, with the script that raises it.
pub(in crate::lower) fn script_error(
    input: &CompileInput<'_>,
    res: &Resolution,
    custom_element: bool,
) -> Option<(Section, Diagnostic)> {
    let walk = walk_scripts(input, res, Target::Client, custom_element, Awaits::Here);
    let error = walk
        .error
        .filter(|error| error.code != crate::lower::UNSUPPORTED)?;
    Some(with_section(input, error))
}

fn with_section(input: &CompileInput<'_>, error: Diagnostic) -> (Section, Diagnostic) {
    (section_at(input, error.span.start_offset), error)
}

/// The scripts' first error as [`script_error`] gives it, and the template's as
/// [`check_runes`](super::check_runes) gives it for the client, from one walk over the scripts.
pub(in crate::lower) fn script_and_template_errors(
    input: &CompileInput<'_>,
    res: &Resolution,
    custom_element: bool,
) -> (Option<(Section, Diagnostic)>, Option<Diagnostic>) {
    let mut walk = walk_scripts(input, res, Target::Client, custom_element, Awaits::Here);
    match walk.error.take() {
        Some(error) if error.code == crate::lower::UNSUPPORTED => (None, None),
        Some(error) => (Some(with_section(input, error.clone())), Some(error)),
        None => (None, walk_template(input, walk).err()),
    }
}
