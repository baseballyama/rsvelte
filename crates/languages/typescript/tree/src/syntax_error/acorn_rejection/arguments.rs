//! acorn's errors for `arguments` where oxc reports its own.

use oxc_diagnostics::OxcDiagnostic;

use super::super::Acorn;
use super::super::locator::{Find, Locator};
use super::super::word::Home;
use super::fails;

/// oxc's errors for `arguments` in a class field initializer and in a class static block.
const ARGUMENTS_IN_INITIALIZER: &str = "'arguments' is not allowed in class field initializer";
pub(super) const ARGUMENTS_IN_STATIC_BLOCK: &str =
    "'arguments' is not allowed in static initialization block";

/// acorn's wording for oxc's error about `arguments` at `start`.
pub(super) fn arguments_misused(error: &OxcDiagnostic, start: u32) -> Option<Acorn> {
    match error.message.as_ref() {
        ARGUMENTS_IN_INITIALIZER => Some(fails(
            "Cannot use 'arguments' in class field initializer",
            start,
        )),
        ARGUMENTS_IN_STATIC_BLOCK => Some(fails(
            "Cannot use arguments in class static initialization block",
            start,
        )),
        _ => None,
    }
}

/// Whether acorn reads the name `error` labels in a class static block: oxc also refuses
/// `arguments` in an arrow function there, which acorn reads as a function of its own.
pub(super) fn in_static_block(error: &OxcDiagnostic, visit: impl FnOnce(&mut Locator)) -> bool {
    let Some(label) = error.labels.first() else {
        return true;
    };
    let mut locator = Locator::new(label.offset(), label.offset() + label.len(), Find::Home);
    visit(&mut locator);
    locator.home == Some(Home::StaticBlock)
}
