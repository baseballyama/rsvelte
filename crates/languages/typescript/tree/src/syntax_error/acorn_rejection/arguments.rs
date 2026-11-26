//! acorn's errors for `arguments` where oxc reports its own.

use oxc_diagnostics::OxcDiagnostic;

use super::super::locator::{Find, Locator};
use super::super::word::Home;

pub(super) const ARGUMENTS_IN_STATIC_BLOCK: &str =
    "'arguments' is not allowed in static initialization block";

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
