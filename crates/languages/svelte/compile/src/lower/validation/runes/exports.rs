//! Upstream's `ExportNamedDeclaration` checks of an exported variable declaration.

use oxc_ast::ast::{ExportDeclaration, VariableDeclarationKind};
use rsvelte_svelte_semantic::resolve::BindingKind;

use super::RuneWalk;
use crate::lower::paths::bound_names;
use crate::lower::special::invalid;
use crate::lower::{Diagnostic, span_of};

impl RuneWalk<'_> {
    /// Upstream raises these after it visits the declaration: an exported derived, an exported
    /// state the script reassigns, then an instance script's `export let`.
    pub(super) fn check_export(&self, export: &ExportDeclaration<'_>) -> Result<(), Diagnostic> {
        let oxc_ast::ast::Declaration::VariableDeclaration(declaration) = &export.declaration
        else {
            return Ok(());
        };
        let mut error = None;
        for declarator in &declaration.declarations {
            bound_names(&declarator.id, false, &mut |name, _| {
                let Some(symbol) = name.symbol_id.get() else {
                    return;
                };
                if error.is_some() {
                    return;
                }
                error = match self.res.binding(symbol).kind {
                    BindingKind::Derived | BindingKind::DerivedBy => Some((
                        "derived_invalid_export",
                        "Cannot export derived state from a module. To expose the current \
                         derived value, export a function returning its value",
                    )),
                    BindingKind::State | BindingKind::RawState if self.res.reassigned(symbol) => {
                        Some((
                            "state_invalid_export",
                            "Cannot export state from a module if it is reassigned. Either \
                             export a function returning the state value or only mutate the \
                             state value's properties",
                        ))
                    }
                    _ => None,
                };
            });
        }
        if let Some((code, message)) = error {
            return invalid(code, message, span_of(export));
        }
        if !self.root.module && declaration.kind == VariableDeclarationKind::Let {
            return invalid(
                "legacy_export_invalid",
                "Cannot use `export let` in runes mode — use `$props()` instead",
                span_of(export),
            );
        }
        Ok(())
    }
}
