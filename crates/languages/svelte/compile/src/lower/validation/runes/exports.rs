//! Upstream's `ExportNamedDeclaration` checks of an exported variable declaration.

use oxc_ast::ast::{
    ExportDeclaration, ExportNamedDeclaration, ModuleExportName, VariableDeclarationKind,
};
use oxc_semantic::SymbolId;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::BindingKind;
use rsvelte_typescript_tree::node_span;

use super::RuneWalk;
use crate::lower::invalid;
use crate::lower::paths::bound_names;

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
                if error.is_none() {
                    error = name
                        .symbol_id
                        .get()
                        .and_then(|symbol| self.invalid_export(symbol));
                }
            });
        }
        if let Some((code, message)) = error {
            return invalid(code, message, node_span(export));
        }
        if !self.root.module && declaration.kind == VariableDeclarationKind::Let {
            return invalid(
                "legacy_export_invalid",
                "Cannot use `export let` in runes mode — use `$props()` instead",
                node_span(export),
            );
        }
        Ok(())
    }

    /// Upstream's `ExportSpecifier`: outside an instance script, `export { name }` checks the
    /// binding as an exported declaration does.
    pub(super) fn check_specifiers(
        &self,
        export: &ExportNamedDeclaration<'_>,
    ) -> Result<(), Diagnostic> {
        if !self.root.module {
            return Ok(());
        }
        let scoping = self.res.scoping();
        for specifier in &export.specifiers {
            let ModuleExportName::IdentifierReference(local) = &specifier.local else {
                continue;
            };
            let symbol = (local.reference_id.get())
                .and_then(|reference| scoping.get_reference(reference).symbol_id());
            if let Some((code, message)) = symbol.and_then(|symbol| self.invalid_export(symbol)) {
                return invalid(code, message, node_span(specifier));
            }
        }
        Ok(())
    }

    /// Upstream's `validate_export`: a derived, or a state the script reassigns.
    fn invalid_export(&self, symbol: SymbolId) -> Option<(&'static str, &'static str)> {
        match self.res.binding(symbol).kind {
            BindingKind::Derived | BindingKind::DerivedBy => Some((
                "derived_invalid_export",
                "Cannot export derived state from a module. To expose the current derived value, \
                 export a function returning its value",
            )),
            BindingKind::State | BindingKind::RawState if self.res.reassigned(symbol) => Some((
                "state_invalid_export",
                "Cannot export state from a module if it is reassigned. Either export a function \
                 returning the state value or only mutate the state value's properties",
            )),
            _ => None,
        }
    }
}
