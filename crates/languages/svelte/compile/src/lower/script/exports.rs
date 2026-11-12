//! The names the instance script exports, which become the component's exports.

use oxc_ast::ast::{
    Declaration, ExportFromDeclaration, ExportNamedDeclaration, ModuleExportName, Statement,
    VariableDeclarationKind,
};
use oxc_semantic::SymbolId;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution};
use rsvelte_svelte_semantic::warnings::{Phase, Raised, Section};

use super::super::paths::bound_names;
use super::super::special::error;
use super::super::{CompileInput, span_of, unsupported};

/// Upstream `module_illegal_default_export`, which its walk of either script raises at an
/// `export default` or an `export { … as default }`.
pub(in crate::lower) fn default_exports(
    input: &CompileInput<'_>,
) -> impl Iterator<Item = (Raised, Diagnostic)> {
    let component = input.component;
    [
        (Section::Module, component.module),
        (Section::Instance, component.instance),
    ]
    .into_iter()
    .filter_map(|(section, program)| Some((section, program?)))
    .flat_map(move |(section, program)| {
        (component.javascript.get_program(program).body.iter())
            .filter(|statement| match statement {
                Statement::ExportDefaultDeclaration(_) => true,
                Statement::ExportNamedDeclaration(export) => export
                    .specifiers
                    .iter()
                    .any(|specifier| specifier.exported.name() == "default"),
                _ => false,
            })
            .map(move |statement| {
                let span = span_of(statement);
                let raised = Raised {
                    phase: Phase::Walk,
                    section,
                    at: span.start_offset,
                };
                let message = "A component cannot have a default export";
                (
                    raised,
                    error("module_illegal_default_export", message, span),
                )
            })
    })
}

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
    unsupported("this export from the instance script", span_of(statement))
}

/// Pushes the names of `export { name as alias }`, which renders nothing in the component.
pub(super) fn push_specifiers<'t>(
    res: &Resolution,
    export: &'t ExportNamedDeclaration<'t>,
    exports: &mut Vec<Export<'t>>,
) {
    if export.export_kind.is_type() {
        return;
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
        exports.push(Export {
            name: local.name.as_str(),
            alias,
            symbol,
        });
    }
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
