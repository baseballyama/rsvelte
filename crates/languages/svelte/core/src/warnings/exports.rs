//! `export_let_unused`: legacy mode's exports that nothing reads or writes.

use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::semantic::resolve::{Resolution, for_each_pattern_identifier};
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, AttributeValue, Component, TemplateNode};
use rsvelte_typescript::NodeIdentifier;
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::scope::DeclarationKind;
use rsvelte_typescript::syntax_tree::{Control, Kind, flag};
use rustc_hash::{FxHashMap, FxHashSet};

use super::found::{Found, Stage};
use super::warning;

/// In runes mode, each binding the instance's `export { … }` names, with where the specifier
/// starts: upstream's `ExportSpecifier` visitor marks it reassigned from there on.
pub(super) fn exported_by_specifier(
    component: &Component,
    resolution: &Resolution,
) -> FxHashMap<BindingIdentifier, u32> {
    let mut out = FxHashMap::default();
    let javascript = &component.javascript;
    let Some(instance) = &component.instance else {
        return out;
    };
    let Kind::Program(statements) = javascript.kind(instance.program) else {
        return out;
    };
    for &statement in statements {
        let Kind::Control(Control::ExportList { specifiers, .. }) = javascript.kind(statement)
        else {
            continue;
        };
        for &specifier in specifiers {
            if let Kind::Control(Control::ExportSpecifier { local, .. }) =
                javascript.kind(specifier)
                && let Some(binding) = resolution.sem.binding_of(local)
                && let Some(span) = javascript.source_location(specifier).span()
            {
                out.entry(binding).or_insert(span.start_offset);
            }
        }
    }
    out
}

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
    let javascript = &component.javascript;
    let sem = &resolution.sem;
    let Kind::Program(statements) = javascript.kind(instance.program) else {
        return;
    };
    // Legacy props: `export let` and `export var`, and a `let` or `var` an `export { … }` names.
    let mut props: Vec<BindingIdentifier> = Vec::new();
    let mut specifiers: FxHashSet<NodeIdentifier> = FxHashSet::default();
    for &statement in statements {
        match javascript.kind(statement) {
            Kind::ExportNamed(declaration) => {
                let Kind::VariableDeclaration { kind, declarations } = javascript.kind(declaration)
                else {
                    continue;
                };
                if kind & 3 == flag::CONST {
                    continue;
                }
                for &declarator in declarations {
                    if let Kind::Declarator { identifier, .. } = javascript.kind(declarator) {
                        for_each_pattern_identifier(javascript, identifier, &mut |name| {
                            props.extend(sem.binding_of(name));
                        });
                    }
                }
            }
            Kind::Control(Control::ExportList {
                specifiers: list,
                source: None,
                ..
            }) => {
                for &specifier in list {
                    let Kind::Control(Control::ExportSpecifier {
                        local,
                        type_only: false,
                        ..
                    }) = javascript.kind(specifier)
                    else {
                        continue;
                    };
                    specifiers.insert(local);
                    if let Some(binding) = sem.binding_of(local)
                        && sem.scopes[sem.bindings[binding].scope].node == instance.program
                        && matches!(
                            sem.bindings[binding].kind,
                            DeclarationKind::Let | DeclarationKind::Variable
                        )
                        && sem.bindings[binding].declaration.is_some()
                    {
                        props.push(binding);
                    }
                }
            }
            _ => {}
        }
    }
    // Declaration order, as the compiler walks the instance scope.
    props.sort_unstable();
    props.dedup();
    let subscribed: FxHashSet<&str> = sem
        .references
        .iter()
        .filter(|r| r.binding.is_none())
        .filter_map(|r| javascript.name(r.node).strip_prefix('$'))
        .collect();
    let shadows = let_shadows(component, source);
    for binding in props {
        let node = sem.bindings[binding].node;
        let text = javascript.name(node);
        let used = sem.references_to(binding).any(|r| {
            r.node != node
                && !specifiers.contains(&r.node)
                && !javascript.source_location(r.node).span().is_some_and(|at| {
                    shadows.get(text).is_some_and(|spans| {
                        spans.iter().any(|s| {
                            s.start_offset <= at.start_offset && at.end_offset <= s.end_offset
                        })
                    })
                })
        });
        if !used
            && !subscribed.contains(text)
            && let Some(span) = javascript.source_location(node).span()
        {
            out.push(Stage::Bindings, 0, warning(
                "export_let_unused",
                &format!(
                    "Component has unused export property '{text}'. If it is for external reference only, please consider using `export const {text}`"
                ),
                span,
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
