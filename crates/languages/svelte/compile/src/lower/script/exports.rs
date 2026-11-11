//! The names the instance script exports, which become the component's exports.

use oxc_ast::ast::{
    Declaration, ExportNamedDeclaration, ModuleExportName, Statement, VariableDeclarationKind,
};
use oxc_semantic::SymbolId;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};

use super::super::{span_of, unsupported};

/// One of upstream's `analysis.exports`: the local `name`, exported as `alias`.
pub(in crate::lower) struct Export<'t> {
    pub name: &'t str,
    pub alias: &'t str,
    pub symbol: Option<SymbolId>,
}

/// Pushes the names an exported declaration gives the component's exports, when it is one this
/// port lowers: a `const` of plain names, or a named function. Upstream raises an error for an
/// exported `let`, and reads an exported signal or class through accessors.
pub(super) fn check_declaration<'t>(
    res: &Resolution,
    statement: &Statement<'t>,
    declaration: &'t Declaration<'t>,
    exports: &mut Vec<Export<'t>>,
) -> Result<(), Diagnostic> {
    let start = exports.len();
    let mut push = |name: &'t oxc_ast::ast::BindingIdentifier<'t>| {
        exports.push(Export {
            name: name.name.as_str(),
            alias: name.name.as_str(),
            symbol: name.symbol_id.get(),
        });
    };
    let named = match declaration {
        Declaration::VariableDeclaration(d) if d.kind == VariableDeclarationKind::Const => d
            .declarations
            .iter()
            .all(|d| match d.id.get_binding_identifier() {
                Some(identifier) if d.id.is_binding_identifier() => {
                    push(identifier);
                    true
                }
                _ => false,
            }),
        Declaration::FunctionDeclaration(f) => f.id.as_ref().is_some_and(|name| {
            push(name);
            true
        }),
        _ => false,
    };
    let plain = named
        && exports[start..].iter().all(|export| {
            export.symbol.is_some_and(|symbol| {
                matches!(
                    res.binding(symbol).kind,
                    BindingKind::Normal | BindingKind::RestProperty
                )
            })
        });
    if plain {
        return Ok(());
    }
    unsupported("this export from the instance script", span_of(statement))
}

/// Pushes the names of `export { name as alias }`, which renders nothing in the component.
pub(super) fn check_specifiers<'t>(
    res: &Resolution,
    export: &'t ExportNamedDeclaration<'t>,
    exports: &mut Vec<Export<'t>>,
) -> Result<(), Diagnostic> {
    if export.export_kind.is_type() {
        return Ok(());
    }
    for specifier in &export.specifiers {
        if specifier.export_kind.is_type() {
            continue;
        }
        let ModuleExportName::IdentifierReference(local) = &specifier.local else {
            unreachable!("a local export name is a reference")
        };
        let alias = specifier.exported.name().as_str();
        let symbol = res.symbol(local);
        // Upstream raises `module_illegal_default_export`.
        if alias == "default" {
            return unsupported("this export from the instance script", span_of(specifier));
        }
        exports.push(Export {
            name: local.name.as_str(),
            alias,
            symbol,
        });
    }
    Ok(())
}
