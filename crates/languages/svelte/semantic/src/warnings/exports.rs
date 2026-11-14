//! `export_let_unused`: legacy mode's exports that nothing reads or writes.

use oxc_ast::ast::{Declaration, ModuleExportName, Statement};
use oxc_semantic::{ReferenceId, SymbolId};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Component, TemplateNode};
use rustc_hash::{FxHashMap, FxHashSet};

use super::found::{Found, Stage};
use super::{span, warning};
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
    // Acorn-typescript's identifier of a declared name ends where its type annotation does.
    let mut annotated: FxHashMap<SymbolId, u32> = FxHashMap::default();
    for statement in &component.javascript.get_program(instance.program).body {
        let declaration = match statement {
            Statement::VariableDeclaration(declaration) => Some(&**declaration),
            Statement::ExportDeclaration(export) => match &export.declaration {
                Declaration::VariableDeclaration(declaration) => Some(&**declaration),
                _ => None,
            },
            _ => None,
        };
        for declarator in declaration.iter().flat_map(|d| &d.declarations) {
            if let (Some(identifier), Some(annotation)) = (
                declarator.id.get_binding_identifier(),
                &declarator.type_annotation,
            ) && let Some(symbol) = identifier.symbol_id.get()
            {
                annotated.insert(symbol, annotation.span.end);
            }
        }
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
                    if let Some(symbol) = resolution.symbol(local)
                        && scoping.symbol_scope_id(symbol) == resolution.instance_scope()
                        && resolution
                            .variable_kind(symbol)
                            .is_some_and(|kind| !kind.is_const())
                    {
                        props.push(symbol);
                    }
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
