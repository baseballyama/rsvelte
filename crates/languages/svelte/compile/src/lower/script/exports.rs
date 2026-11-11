//! The names the instance script exports, which become the component's exports.

use oxc_ast::ast::{
    Declaration, ExportFromDeclaration, ExportNamedDeclaration, ModuleExportName, Statement,
    VariableDeclaration, VariableDeclarationKind,
};
use oxc_semantic::SymbolId;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};

use super::super::paths::bound_names;
use super::super::{span_of, unsupported};

/// One of upstream's `analysis.exports`: the local `name`, exported as `alias`.
pub(in crate::lower) struct Export<'t> {
    pub name: &'t str,
    pub alias: &'t str,
    pub symbol: Option<SymbolId>,
}

/// Pushes the names an exported declaration gives the component's exports, when it is one this
/// port lowers: a `const`, a named function or a class. Upstream raises an error for an exported
/// `let`, and reads an exported signal through accessors.
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
        Declaration::VariableDeclaration(d) if d.kind == VariableDeclarationKind::Const => {
            for declarator in &d.declarations {
                bound_names(&declarator.id, false, &mut |name, _| push(name));
            }
            true
        }
        Declaration::FunctionDeclaration(f) => f.id.as_ref().is_some_and(|name| {
            push(name);
            true
        }),
        Declaration::ClassDeclaration(c) => c.id.as_ref().is_some_and(|name| {
            push(name);
            true
        }),
        _ => false,
    };
    let plain = named
        && exports[start..].iter().all(|export| {
            export.symbol.is_some_and(|symbol| {
                // A `const` state is never reassigned, so its value is the proxy itself.
                matches!(
                    res.binding(symbol).kind,
                    BindingKind::Normal
                        | BindingKind::RestProperty
                        | BindingKind::State
                        | BindingKind::RawState
                )
            })
        });
    if plain {
        return Ok(());
    }
    if let Declaration::VariableDeclaration(d) = declaration {
        check_exported_state(res, statement, d)?;
    }
    unsupported("this export from the instance script", span_of(statement))
}

/// Upstream's errors for an exported declaration of a derived, or of a state the script
/// reassigns, which the importer could not read through.
pub(super) fn check_exported_state(
    res: &Resolution,
    statement: &Statement<'_>,
    declaration: &VariableDeclaration<'_>,
) -> Result<(), Diagnostic> {
    let mut error = None;
    for declarator in &declaration.declarations {
        bound_names(&declarator.id, false, &mut |name, _| {
            let Some(symbol) = name.symbol_id.get() else {
                return;
            };
            if error.is_some() {
                return;
            }
            error = match res.binding(symbol).kind {
                BindingKind::Derived | BindingKind::DerivedBy => Some((
                    "derived_invalid_export",
                    "Cannot export derived state from a module. To expose the current derived \
                     value, export a function returning its value",
                )),
                BindingKind::State | BindingKind::RawState if res.reassigned(symbol) => Some((
                    "state_invalid_export",
                    "Cannot export state from a module if it is reassigned. Either export a \
                     function returning the state value or only mutate the state value's \
                     properties",
                )),
                _ => None,
            };
        });
    }
    error.map_or(Ok(()), |(code, message)| {
        super::super::special::invalid(code, message, span_of(statement))
    })
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

/// Pushes the names of `export { name as alias } from 'module'`. Upstream drops the statement and
/// exports `name` as the instance reads it, an import of that name or nothing.
pub(super) fn check_reexports<'t>(
    export: &'t ExportFromDeclaration<'t>,
    exports: &mut Vec<Export<'t>>,
) -> Result<(), Diagnostic> {
    if export.export_kind.is_type() {
        return Ok(());
    }
    for specifier in &export.specifiers {
        if specifier.export_kind.is_type() {
            continue;
        }
        let alias = specifier.exported.name().as_str();
        // Upstream raises `module_illegal_default_export`.
        if alias == "default" {
            return unsupported("this export from the instance script", span_of(specifier));
        }
        exports.push(Export {
            name: specifier.local.name().as_str(),
            alias,
            symbol: None,
        });
    }
    Ok(())
}
