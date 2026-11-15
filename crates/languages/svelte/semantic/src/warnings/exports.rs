//! Legacy mode's exports: `export_let_unused` for those nothing reads or writes, and
//! `state_invalid_export` for a reassigned `export const` that the template reads.

use oxc_ast::AstKind;
use oxc_ast::ast::{Declaration, ModuleExportName, Statement};
use oxc_semantic::{ReferenceId, SymbolId};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Component, TemplateNode};
use rustc_hash::{FxHashMap, FxHashSet};

use super::found::{Found, Stage};
use super::{Phase, Raised, Section, error, span, warning};
use crate::resolve::Resolution;

/// `export_let_unused`: in legacy mode, an `export let` nothing reads or writes.
pub(super) fn unused_exports(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    out: &mut Found,
) {
    let Some(instance) = &component.instance else {
        return;
    };
    let scoping = resolution.scoping();
    // Legacy props: `export let` and `export var`, and a `let` or `var` an `export { … }` names.
    let mut props: Vec<SymbolId> = Vec::new();
    let mut specifiers: FxHashSet<ReferenceId> = FxHashSet::default();
    // Upstream declares a class as a `let`.
    let is_prop = |symbol| {
        scoping.symbol_scope_id(symbol) == resolution.instance_scope()
            && (resolution
                .variable_kind(symbol)
                .is_some_and(|kind| !kind.is_const())
                || matches!(resolution.declaration(symbol), AstKind::Class(_)))
    };
    let body = &component.javascript.get_program(instance.program).body;
    let annotated = annotation_ends(body);
    for statement in body {
        match statement {
            Statement::ExportDeclaration(export) => {
                let Declaration::VariableDeclaration(declaration) = &export.declaration else {
                    continue;
                };
                if declaration.kind.is_const() {
                    continue;
                }
                for declarator in &declaration.declarations {
                    for identifier in declarator.id.get_binding_identifiers() {
                        props.extend(identifier.symbol_id.get());
                    }
                }
            }
            Statement::ExportNamedDeclaration(export) if !export.export_kind.is_type() => {
                for specifier in &export.specifiers {
                    let ModuleExportName::IdentifierReference(local) = &specifier.local else {
                        continue;
                    };
                    if specifier.export_kind.is_type() {
                        continue;
                    }
                    specifiers.extend(local.reference_id.get());
                    props.extend(resolution.symbol(local).filter(|&s| is_prop(s)));
                }
            }
            // Upstream looks a re-exported name up in the instance as well.
            Statement::ExportFromDeclaration(export) if !export.export_kind.is_type() => {
                for specifier in &export.specifiers {
                    let ModuleExportName::IdentifierName(local) = &specifier.local else {
                        continue;
                    };
                    if specifier.export_kind.is_type() {
                        continue;
                    }
                    let symbol = scoping.get_binding(resolution.instance_scope(), local.name);
                    props.extend(symbol.filter(|&s| is_prop(s)));
                }
            }
            _ => {}
        }
    }
    // Declaration order, as the compiler walks the instance scope.
    props.sort_unstable();
    props.dedup();
    let subscribed: FxHashSet<&str> = resolution
        .unresolved_names()
        .filter_map(|name| name.strip_prefix('$'))
        .collect();
    let shadows = let_shadows(component, source);
    for symbol in props {
        let text = scoping.symbol_name(symbol);
        let used = scoping.get_resolved_reference_ids(symbol).iter().any(|&r| {
            let at = resolution.reference_span(r);
            !specifiers.contains(&r)
                && !shadows.get(text).is_some_and(|spans| {
                    spans
                        .iter()
                        .any(|s| s.start_offset <= at.start && at.end <= s.end_offset)
                })
        });
        if !used && !subscribed.contains(text) {
            let mut name = scoping.symbol_span(symbol);
            if let Some(&end) = annotated.get(&symbol) {
                name.end = end;
            }
            out.push(
                Stage::Bindings,
                0,
                warning(
                    "export_let_unused",
                    &format!(
                        "Component has unused export property '{text}'. If it is for external \
                        reference only, please consider using `export const {text}`"
                    ),
                    span(name),
                ),
            );
        }
    }
}

/// Where acorn-typescript ends the identifier of each top-level name `body` declares with a type
/// annotation: where the annotation does.
fn annotation_ends(body: &[Statement<'_>]) -> FxHashMap<SymbolId, u32> {
    let mut ends = FxHashMap::default();
    for statement in body {
        let declaration = match statement {
            Statement::VariableDeclaration(declaration) => &**declaration,
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::VariableDeclaration(declaration) => &**declaration,
                _ => continue,
            },
            _ => continue,
        };
        for declarator in &declaration.declarations {
            if let (Some(identifier), Some(annotation)) = (
                declarator.id.get_binding_identifier(),
                &declarator.type_annotation,
            ) && let Some(symbol) = identifier.symbol_id.get()
            {
                ends.insert(symbol, annotation.span.end);
            }
        }
    }
    ends
}

/// `state_invalid_export`: in legacy mode, upstream turns a reassigned top-level binding that the
/// template or a `$:` statement reads into state, and an exported state must not be reassigned.
pub(super) fn state_exports(
    component: &Component,
    resolution: &Resolution,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let Some(instance) = &component.instance else {
        return;
    };
    let scoping = resolution.scoping();
    let body = &component.javascript.get_program(instance.program).body;
    let promoted = |symbol: SymbolId| {
        scoping.get_resolved_reference_ids(symbol).iter().any(|&r| {
            let at = resolution.reference_span(r);
            let in_script = (component.module.iter().chain(&component.instance))
                .any(|s| s.span.start_offset <= at.start && at.end <= s.span.end_offset);
            // The statements are in source order, so the one that may hold `at` is found by halves.
            let statement = body.partition_point(|s| oxc_span::GetSpan::span(s).end <= at.start);
            !in_script
                || matches!(body.get(statement), Some(Statement::LabeledStatement(labeled))
                    if labeled.label.name == "$" && labeled.span.start <= at.start)
        })
    };
    for statement in body {
        let Statement::ExportDeclaration(export) = statement else {
            continue;
        };
        let Declaration::VariableDeclaration(declaration) = &export.declaration else {
            continue;
        };
        // `export let` and `export var` are props.
        if !declaration.kind.is_const() {
            continue;
        }
        let state = declaration.declarations.iter().any(|declarator| {
            declarator.id.any_binding_identifiers(&mut |identifier| {
                identifier
                    .symbol_id
                    .get()
                    .is_some_and(|symbol| resolution.reassigned(symbol) && promoted(symbol))
            })
        });
        if state {
            let raised = Raised {
                phase: Phase::Walk,
                section: Section::Instance,
                at: export.span.start,
            };
            let message = "Cannot export state from a module if it is reassigned. Either export a \
                function returning the state value or only mutate the state value's properties";
            out.push((
                raised,
                error("state_invalid_export", message, span(export.span)),
            ));
        }
    }
}

/// The children of each element with a shorthand `let:name`, by the name it declares there.
pub(super) fn let_shadows<'a>(
    component: &Component,
    source: &'a str,
) -> FxHashMap<&'a str, Vec<Span>> {
    let mut out: FxHashMap<&str, Vec<Span>> = FxHashMap::default();
    for node in &component.nodes {
        let TemplateNode::Element {
            attributes,
            children,
            span,
            ..
        } = *node
        else {
            continue;
        };
        for attribute in component.attributes(attributes) {
            if attribute.kind == AttributeKind::Let
                && matches!(attribute.value, AttributeValue::True)
                && let Some(name) = attribute.directive_name(&component.modifiers)
            {
                let inside = component.children(children).first().map_or(span, |&first| {
                    Span::new(component.node(first).span().start_offset, span.end_offset)
                });
                out.entry(name.text(source)).or_default().push(inside);
            }
        }
    }
    out
}
