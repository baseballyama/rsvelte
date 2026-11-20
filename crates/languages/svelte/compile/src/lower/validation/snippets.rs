//! Upstream's errors of `{#snippet}` and `{@render}`.

use oxc_ast::ast::{Argument, Expression, ModuleExportName, Statement};
use oxc_semantic::{ScopeId, SymbolId};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, CompilerNodeIdentifier, Element, ElementKind, NodeKind, Snippet,
};
use rsvelte_svelte_semantic::resolve::{Resolution, TemplateScope};
use rsvelte_svelte_semantic::warnings::Raised;
use rsvelte_typescript_tree::{document_span, node_span};
use rustc_hash::{FxHashMap, FxHashSet};

mod const_references;

use super::{raised_in_scopes, raised_in_walk};
use crate::input::CompileInput;
use crate::lower::attributes::is_directive;
use crate::lower::snippets::{is_runtime, render_call, snippet_name};
use crate::lower::{error, invalid};

/// Upstream's errors of snippets and render tags, with when it raises each: a duplicate name as
/// it builds the template's scopes, the others as its walk enters a node or, after a snippet's
/// body, leaves the snippet.
pub(super) fn errors(input: &CompileInput<'_>, res: &Resolution) -> Vec<(Raised, Diagnostic)> {
    let tree = input.component.compiler_syntax_tree;
    let javascript = input.component.javascript;
    let mut out = Vec::new();
    // The first snippet of each name in each scope.
    let mut declared = FxHashMap::default();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        match &node.kind {
            NodeKind::Snippet(snippet) => {
                snippet_errors(input, res, identifier, snippet, &mut declared, &mut out);
            }
            NodeKind::Element(owner) => child_snippet_errors(input, owner, &mut out),
            &NodeKind::Render { expression } => {
                let (call, _) = render_call(javascript.get_expression(expression));
                let at = raised_in_walk(node.span.start_offset);
                if let Some(Argument::SpreadElement(spread)) =
                    call.arguments.iter().find(|a| a.is_spread())
                {
                    let message = "cannot use spread arguments in `{@render ...}` tags";
                    let spread = node_span(&**spread);
                    out.push((
                        at,
                        error("render_tag_invalid_spread_argument", message, spread),
                    ));
                } else if let Expression::StaticMemberExpression(member) =
                    call.callee.get_inner_expression()
                    && matches!(member.property.name.as_str(), "bind" | "apply" | "call")
                {
                    let message =
                        "Calling a snippet function using apply, bind or call is not allowed";
                    out.push((
                        at,
                        error("render_tag_invalid_call_expression", message, node.span),
                    ));
                }
            }
            _ => {}
        }
    }
    out.extend(const_references::invalid_reference(input, res));
    out
}

/// Where upstream's walk is once it has walked the body of the node at `span`.
const fn after(span: Span) -> u32 {
    span.end_offset - 1
}

fn duplicate(name: &str, span: Span) -> Diagnostic {
    error(
        "declaration_duplicate",
        format!("`{name}` has already been declared"),
        span,
    )
}

fn snippet_errors<'a>(
    input: &CompileInput<'a>,
    res: &Resolution,
    identifier: CompilerNodeIdentifier,
    snippet: &Snippet,
    declared: &mut FxHashMap<(ScopeId, &'a str), Span>,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let component = input.component;
    let (tree, javascript) = (component.compiler_syntax_tree, component.javascript);
    let node = tree.node(identifier);
    if let Some(rest) = &javascript.get_parameters(snippet.parameters).rest {
        let message = "Snippets do not support rest parameters; use an array instead";
        let rest = node_span(&**rest);
        let at = raised_in_walk(node.span.start_offset);
        out.push((at, error("snippet_invalid_rest_parameter", message, rest)));
    }
    let name = snippet_name(javascript, snippet);
    let name_span = node_span(javascript.get_expression(snippet.name));
    let Some(symbol) = res.snippet(identifier) else {
        return;
    };
    let scoping = res.scoping();
    let scope = scoping.symbol_scope_id(symbol);
    if let Some(first) = declared.get_mut(&(scope, name)) {
        let later = if name_span.start_offset > first.start_offset {
            name_span
        } else {
            std::mem::replace(first, name_span)
        };
        out.push((raised_in_scopes(later.start_offset), duplicate(name, later)));
    } else {
        declared.insert((scope, name), name_span);
    }
    let Some(parent) = node.parent else {
        // Upstream declares an import in the module's scope.
        if component.instance.is_some()
            && let Some(other) = scoping.get_binding(res.instance_scope(), name.into())
            && !scoping.symbol_flags(other).is_import()
            && is_runtime(scoping.symbol_flags(other))
        {
            out.push((raised_in_walk(after(node.span)), duplicate(name, name_span)));
        }
        return;
    };
    // Upstream declares what the body of a block declares in the block's own scope, beside its
    // context, its value, its parameters or its `let:` names.
    let Some(block) = scoping.scope_parent_id(scope) else {
        return;
    };
    let Some(other) = scoping.get_binding(block, name.into()) else {
        return;
    };
    let opened = |scope| res.template_scope(scope) == Some(block);
    let parent_span = tree.node(parent).span;
    if opened(TemplateScope::Each(parent)) || opened(TemplateScope::Let(parent)) {
        out.push((
            raised_in_scopes(name_span.start_offset),
            duplicate(name, name_span),
        ));
    } else if opened(TemplateScope::Snippet(parent)) {
        out.push((
            raised_in_scopes(after(parent_span)),
            duplicate(name, name_span),
        ));
    } else if opened(TemplateScope::Then(parent)) || opened(TemplateScope::Catch(parent)) {
        // Upstream declares the value after it walks the branch.
        let value = scoping.symbol_span(other);
        let value = document_span(value);
        out.push((raised_in_scopes(after(parent_span)), duplicate(name, value)));
    }
}

/// Upstream's checks of the snippets a component holds, which it makes after each snippet's
/// body; once per component, so that many snippets cost no more than they are.
fn child_snippet_errors(
    input: &CompileInput<'_>,
    owner: &Element,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let component = input.component;
    let (tree, javascript, source) = (
        component.compiler_syntax_tree,
        component.javascript,
        component.source_text,
    );
    if !owner.kind.renders_component() {
        return;
    }
    let children = tree.children(owner.children);
    let props: FxHashSet<&str> = if owner.kind == ElementKind::Component {
        (tree.attributes(owner.attributes).iter())
            .filter(|a| {
                (matches!(a.value, AttributeValue::Bind(_)) || !is_directive(&a.value))
                    && !matches!(a.value, AttributeValue::Spread(_))
            })
            .map(|a| a.name.text(source))
            .collect()
    } else {
        FxHashSet::default()
    };
    let mut content = None;
    for &child in children {
        let node = tree.node(child);
        let NodeKind::Snippet(snippet) = &node.kind else {
            continue;
        };
        let name = snippet_name(javascript, snippet);
        let at = raised_in_walk(after(node.span));
        if props.contains(name) {
            let message = format!("This snippet is shadowing the prop `{name}` with the same name");
            out.push((at, error("snippet_shadowing_prop", &message, node.span)));
        } else if name == "children"
            && *content.get_or_insert_with(|| {
                children.iter().any(|&child| {
                    let kind = &tree.node(child).kind;
                    !matches!(kind, NodeKind::Snippet(_) | NodeKind::Comment { .. })
                        && !kind.is_blank_text(source)
                })
            })
        {
            let message = "Cannot use explicit children snippet at the same time as implicit \
                children content. Remove either the non-whitespace content or the children snippet \
                block";
            out.push((at, error("snippet_conflict", message, node.span)));
        }
    }
}

/// Upstream `snippet_invalid_export` and `export_undefined`, which it raises after the template's
/// walk: the module script exports a snippet that is not hoisted beside it, or a name nothing
/// declares.
pub(super) fn check_exports(
    input: &CompileInput<'_>,
    res: &Resolution,
    hoistable: &FxHashSet<SymbolId>,
) -> Result<(), Diagnostic> {
    let component = input.component;
    let Some(module) = component.module else {
        return Ok(());
    };
    let (tree, javascript) = (component.compiler_syntax_tree, component.javascript);
    let scoping = res.scoping();
    // Per snippet name: whether a top-level snippet of that name is hoisted.
    let mut snippets: Option<FxHashMap<&str, bool>> = None;
    for statement in &javascript.get_program(module).body {
        let Statement::ExportNamedDeclaration(export) = statement else {
            continue;
        };
        for specifier in &export.specifiers {
            let ModuleExportName::IdentifierReference(local) = &specifier.local else {
                continue;
            };
            if (scoping.get_binding(scoping.root_scope_id(), local.name)).is_some() {
                continue;
            }
            let snippets = snippets.get_or_insert_with(|| {
                let mut snippets = FxHashMap::default();
                for (identifier, node) in tree.nodes.iter_enumerated() {
                    if let NodeKind::Snippet(snippet) = &node.kind {
                        let hoisted = node.parent.is_none()
                            && res
                                .snippet(identifier)
                                .is_some_and(|s| hoistable.contains(&s));
                        *snippets
                            .entry(snippet_name(javascript, snippet))
                            .or_default() |= hoisted;
                    }
                }
                snippets
            });
            match snippets.get(local.name.as_str()) {
                Some(true) => {}
                Some(false) => {
                    return invalid(
                        "snippet_invalid_export",
                        "An exported snippet can only reference things declared in a `<script \
                            module>`, or other exportable snippets",
                        node_span(specifier),
                    );
                }
                None => {
                    return invalid(
                        "export_undefined",
                        format!("`{}` is not defined", local.name),
                        node_span(specifier),
                    );
                }
            }
        }
    }
    Ok(())
}
