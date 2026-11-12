//! A script's top-level statements: each is kept, hoisted, dropped or lowered for its rune.

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{Declaration, Program, Statement, VariableDeclaration, VariableDeclarator};
use oxc_ast_visit::VisitMut;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_compile::strip::is_type_only;

use super::statements::{Inspect, inspect, is_effect};
use super::{Export, ScriptRewrite, declarators, exports, props};
use crate::lower::names::Names;
use crate::lower::{Target, span_of, unsupported};

/// Which script is lowered; the instance's exports are collected while it is.
pub(in crate::lower) enum ScriptContext<'e, 't> {
    Instance {
        exports: &'e mut Vec<Export<'t>>,
    },
    Module,
    /// A `.svelte.js` module, which keeps its imports where they are and its types for
    /// TypeScript's emit.
    File,
}

/// Upstream `analysis.props_id`: the name `const id = $props.id()` declares.
pub(in crate::lower) fn props_id(program: &Program<'_>, res: &Resolution) -> Option<String> {
    program.body.iter().find_map(|statement| {
        let d = match statement {
            Statement::VariableDeclaration(d) => d,
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::VariableDeclaration(d) => d,
                _ => return None,
            },
            _ => return None,
        };
        d.declarations.iter().find_map(|d| {
            let init = d.init.as_ref()?;
            (res.rune(init)?.0 == "$props.id")
                .then(|| d.id.get_binding_identifier())
                .flatten()
                .map(|id| id.name.to_string())
        })
    })
}

/// Script statements share rune lowering; imports go to `hoisted`.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] for an export the instance script cannot lower, and
/// upstream's errors for the exports it can.
pub(in crate::lower) fn lower_script<'t, 'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    program: &'t Program<'t>,
    hoisted: &mut Vec<Statement<'o>>,
    names: &Names<'_>,
    mut context: ScriptContext<'_, 't>,
) -> Result<Vec<Statement<'o>>, Diagnostic> {
    let instance = matches!(context, ScriptContext::Instance { .. });
    let mut out = Vec::with_capacity(program.directives.len() + program.body.len());
    // Upstream's parser reads a prologue as statements, which it keeps where they are.
    if !matches!(context, ScriptContext::File) {
        out.extend(
            (program.directives.iter()).map(|d| rw.b.statement(rw.b.string(d.directive.as_str()))),
        );
    }
    for statement in &program.body {
        // Upstream erases the types before it analyzes the component.
        // A module's types are TypeScript's emit to erase, once it is lowered.
        if is_type_only(statement) && !matches!(context, ScriptContext::File) {
            continue;
        }
        match statement {
            Statement::ExportDeclaration(export)
                if let ScriptContext::Instance { exports } = &mut context =>
            {
                exports::check_declaration(rw.res, statement, &export.declaration, exports)?;
                match &export.declaration {
                    Declaration::VariableDeclaration(d) => {
                        lower_declaration(rw, d, true, &mut out, hoisted, names);
                    }
                    declaration => {
                        let mut declaration =
                            declaration.clone_in_with_semantic_ids(rw.b.allocator());
                        rw.visit_declaration(&mut declaration);
                        out.push(Statement::from(declaration));
                    }
                }
            }
            Statement::ExportNamedDeclaration(export)
                if let ScriptContext::Instance { exports } = &mut context =>
            {
                exports::push_specifiers(rw.res, export, exports);
            }
            // TypeScript keeps an export of types only as `export {}`, which oxc's emit drops.
            Statement::ExportNamedDeclaration(export)
                if matches!(context, ScriptContext::File)
                    && !export.export_kind.is_type()
                    && !export.specifiers.is_empty()
                    && is_type_only(statement) =>
            {
                let mut kept = rw.statement(statement);
                if let Statement::ExportNamedDeclaration(export) = &mut kept {
                    export.specifiers.clear();
                }
                out.push(kept);
            }
            Statement::ImportDeclaration(_) if matches!(context, ScriptContext::File) => {
                out.push(rw.statement(statement));
            }
            Statement::ImportDeclaration(_) => hoisted.push(rw.statement(statement)),
            // Upstream drops a re-export of everything, which names nothing the component can
            // export.
            Statement::ExportAllDeclaration(_) if instance => {}
            Statement::ExportFromDeclaration(export)
                if let ScriptContext::Instance { exports } = &mut context =>
            {
                exports::check_reexports(export, exports)?;
            }
            // Upstream turns these into the component's exports; copying them would put an
            // `export` inside the component function.
            Statement::ExportDefaultDeclaration(_) if instance => {
                return unsupported("an export from the instance script", span_of(statement));
            }
            Statement::VariableDeclaration(d) => {
                lower_declaration(rw, d, instance, &mut out, hoisted, names);
            }
            // Upstream server `ExpressionStatement`: an effect renders nothing.
            Statement::EmptyStatement(_) => {}
            _ if rw.target == Target::Server && is_effect(rw.res, statement) => {}
            _ if let Some(inspect) = inspect(rw.res, statement) => {
                if inspect == Inspect::Value {
                    let span = oxc_span::GetSpan::span(statement);
                    let empty = || Statement::new_empty_statement(span, rw.b);
                    out.extend([empty(), empty()]);
                }
            }
            _ => out.push(rw.statement(statement)),
        }
    }
    Ok(out)
}

/// Upstream `DeclarationTag`: the tag's declaration, lowered as the script's would be.
pub(in crate::lower) fn lower_declaration_tag<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    declaration: &VariableDeclaration<'_>,
    names: &Names<'_>,
) -> Vec<Statement<'o>> {
    let mut out = Vec::with_capacity(1);
    let mut hoisted = Vec::new();
    lower_declaration(rw, declaration, false, &mut out, &mut hoisted, names);
    out
}

/// A top-level declaration. Upstream's instance gives each declarator its own declaration.
fn lower_declaration<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    declaration: &VariableDeclaration<'_>,
    split: bool,
    out: &mut Vec<Statement<'o>>,
    hoisted: &mut Vec<Statement<'o>>,
    names: &Names<'_>,
) {
    let b = rw.b;
    let mut lowered = Vec::with_capacity(declaration.declarations.len());
    for (i, d) in declaration.declarations.iter().enumerate() {
        lower_declarator(rw, d, &mut lowered, hoisted, names);
        if (split || i + 1 == declaration.declarations.len()) && !lowered.is_empty() {
            let mut statement = b.declaration(declaration.kind, std::mem::take(&mut lowered));
            if let Statement::VariableDeclaration(d) = &mut statement {
                d.span = declaration.span;
            }
            out.push(statement);
        }
    }
}

fn lower_declarator<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    d: &VariableDeclarator<'_>,
    out: &mut Vec<VariableDeclarator<'o>>,
    hoisted: &mut Vec<Statement<'o>>,
    names: &Names<'_>,
) {
    let rune = d
        .init
        .as_ref()
        .and_then(|init| rw.res.rune(init))
        .map(|(rune, _)| rune);
    // Upstream declares `$props.id()` first in the component instead.
    if rune == Some("$props.id") {
        return;
    }
    if !d.id.is_binding_identifier() {
        match rune {
            Some("$derived" | "$derived.by") => {
                return declarators::lower_destructured_derived(rw, d, out, names);
            }
            Some("$state" | "$state.raw") => {
                return declarators::lower_destructured_state(rw, d, out, names);
            }
            _ => {}
        }
    }
    if rune != Some("$props") {
        out.push(rw.declarator(d));
        return;
    }
    match rw.target {
        Target::Server => {
            let pattern = props::server_props_pattern(rw, &d.id);
            let mut declarator = rw.b.declarator(pattern, Some(rw.b.id("$$props")));
            declarator.span = d.span;
            out.push(declarator);
        }
        Target::Client => props::lower_client_props(rw, &d.id, out, hoisted, names),
    }
}
