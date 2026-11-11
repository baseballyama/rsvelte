//! What both targets need to know about `{#snippet}` and `{@render}`, beside how they spell it.

use oxc_ast::ast::{Argument, CallExpression, ChainElement, Expression};
use oxc_semantic::{ReferenceId, ScopeId, SymbolFlags, SymbolId};
use rsvelte_svelte_semantic::compiler_syntax_tree::{Node, Snippet};
use rsvelte_svelte_semantic::resolve::TemplateScope;
use rsvelte_typescript_tree::Tree;
use rustc_hash::{FxHashMap, FxHashSet};

use super::special::invalid;
use super::{
    AttributeValue, BindingKind, CompileInput, Diagnostic, ElementKind, NodeKind, Resolution,
    span_of,
};

/// Upstream's errors for a snippet or a render tag, in the order its analysis meets them.
pub(super) fn validate(input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    let component = input.component;
    let (tree, javascript) = (component.compiler_syntax_tree, component.javascript);
    for node in &tree.nodes {
        match &node.kind {
            NodeKind::Snippet(snippet) => validate_snippet(input, res, node, snippet)?,
            &NodeKind::Render { expression } => {
                let (call, _) = render_call(javascript.get_expression(expression));
                if let Some(Argument::SpreadElement(spread)) =
                    call.arguments.iter().find(|a| a.is_spread())
                {
                    return invalid(
                        "render_tag_invalid_spread_argument",
                        "cannot use spread arguments in `{@render ...}` tags",
                        span_of(&**spread),
                    );
                }
                // Upstream reads the property as an identifier, computed or not.
                let property = match call.callee.get_inner_expression() {
                    Expression::StaticMemberExpression(member) => {
                        Some(member.property.name.as_str())
                    }
                    Expression::ComputedMemberExpression(member) => match &member.expression {
                        Expression::Identifier(name) => Some(name.name.as_str()),
                        _ => None,
                    },
                    _ => None,
                };
                if matches!(property, Some("bind" | "apply" | "call")) {
                    return invalid(
                        "render_tag_invalid_call_expression",
                        "Calling a snippet function using apply, bind or call is not allowed",
                        node.span,
                    );
                }
            }
            _ => {}
        }
    }
    Ok(())
}

fn validate_snippet(
    input: &CompileInput<'_>,
    res: &Resolution,
    node: &Node,
    snippet: &Snippet,
) -> Result<(), Diagnostic> {
    let component = input.component;
    let (tree, javascript) = (component.compiler_syntax_tree, component.javascript);
    if let Some(rest) =
        (snippet.parameters).and_then(|p| javascript.get_parameters(p).rest.as_ref())
    {
        return invalid(
            "snippet_invalid_rest_parameter",
            "Snippets do not support rest parameters; use an array instead",
            span_of(&**rest),
        );
    }
    let name = snippet_name(javascript, snippet);
    let Some(parent) = node.parent else {
        // Upstream declares an import in the module's scope and strips the types first.
        let scoping = res.scoping();
        if component.instance.is_some()
            && scoping
                .get_binding(res.instance_scope(), name.into())
                .is_some_and(|symbol| scoping.symbol_flags(symbol).intersects(SymbolFlags::Value))
        {
            let name_span = span_of(javascript.get_expression(snippet.name));
            return invalid(
                "declaration_duplicate",
                &format!("`{name}` has already been declared"),
                name_span,
            );
        }
        return Ok(());
    };
    let NodeKind::Element(owner) = &tree.node(parent).kind else {
        return Ok(());
    };
    let source = component.source_text;
    if owner.kind == ElementKind::Component
        && tree.attributes(owner.attributes).iter().any(|a| {
            matches!(a.value, AttributeValue::Bind(_)) || !super::is_directive(&a.value)
        } && !matches!(a.value, AttributeValue::Spread(_)) && a.name.text(source) == name)
    {
        return invalid(
            "snippet_shadowing_prop",
            &format!("This snippet is shadowing the prop `{name}` with the same name"),
            node.span,
        );
    }
    let content = tree.children(owner.children).iter().any(|&child| {
        let kind = &tree.node(child).kind;
        !matches!(kind, NodeKind::Snippet(_) | NodeKind::Comment { .. })
            && !kind.is_blank_text(source)
    });
    if name == "children" && owner.kind.renders_component() && content {
        return invalid(
            "snippet_conflict",
            "Cannot use explicit children snippet at the same time as implicit children content. Remove either the non-whitespace content or the children snippet block",
            node.span,
        );
    }
    Ok(())
}

/// The name `{#snippet name()}` declares.
pub(super) fn snippet_name<'t>(javascript: &'t Tree, snippet: &Snippet) -> &'t str {
    match javascript
        .get_expression(snippet.name)
        .get_inner_expression()
    {
        Expression::Identifier(name) => name.name.as_str(),
        _ => unreachable!("a snippet is named by an identifier"),
    }
}

/// The call a `{@render}` tag makes, and whether it is written as an optional chain.
pub(super) fn render_call<'t>(expression: &'t Expression<'t>) -> (&'t CallExpression<'t>, bool) {
    match expression.get_inner_expression() {
        Expression::CallExpression(call) => (call, false),
        Expression::ChainExpression(chain) => match &chain.expression {
            ChainElement::CallExpression(call) => (call, true),
            _ => unreachable!("the parser keeps a render tag a call"),
        },
        _ => unreachable!("the parser keeps a render tag a call"),
    }
}

/// The arguments of a `{@render}` call, which the parser keeps free of spreads.
pub(super) fn render_arguments<'t>(
    call: &'t CallExpression<'t>,
) -> impl Iterator<Item = &'t Expression<'t>> {
    call.arguments.iter().map(|argument| match argument {
        Argument::SpreadElement(_) => unreachable!("validation rejects a spread argument"),
        argument => argument.to_expression().get_inner_expression(),
    })
}

/// Upstream `metadata.dynamic` of a render tag: anything but a plain name may change.
pub(super) fn is_dynamic_render(res: &Resolution, call: &CallExpression<'_>) -> bool {
    match call.callee.get_inner_expression() {
        Expression::Identifier(name) => !res
            .symbol(name)
            .is_some_and(|symbol| res.binding(symbol).kind == BindingKind::Normal),
        _ => true,
    }
}

/// Each nested snippet and the name it shadows, which upstream's client reads it as: its
/// `transform` is keyed by name, and a snippet adds none.
pub(super) fn shadows(input: &CompileInput<'_>, res: &Resolution) -> FxHashMap<SymbolId, SymbolId> {
    let scoping = res.scoping();
    let tree = input.component.compiler_syntax_tree;
    let mut shadows = FxHashMap::default();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        if let NodeKind::Snippet(_) = node.kind
            && node.parent.is_some()
            && let Some(symbol) = res.snippet(identifier)
            && let Some(outer) = scoping.scope_parent_id(scoping.symbol_scope_id(symbol))
            && let Some(shadowed) = scoping.find_binding(outer, scoping.symbol_ident(symbol))
        {
            shadows.insert(symbol, shadowed);
        }
    }
    shadows
}

/// Upstream `can_hoist_snippet` for each top-level snippet: what it reads is an import, declared
/// in the module script or inside the snippet, or another snippet that can hoist.
pub(super) fn hoistable(input: &CompileInput<'_>, res: &Resolution) -> FxHashSet<SymbolId> {
    let tree = input.component.compiler_syntax_tree;
    let mut scopes = FxHashMap::default();
    let mut symbols = FxHashMap::default();
    let mut top_level = Vec::new();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        if let NodeKind::Snippet(_) = node.kind
            && let Some(symbol) = res.snippet(identifier)
        {
            let index = symbols.len();
            symbols.insert(symbol, index);
            if let Some(scope) = res.template_scope(TemplateScope::Snippet(identifier)) {
                scopes.insert(scope, index);
            }
            if node.parent.is_none() {
                top_level.push((index, symbol));
            }
        }
    }
    if top_level.is_empty() {
        return FxHashSet::default();
    }
    let module = input
        .component
        .module
        .map(|p| input.component.javascript.get_program(p).span);
    let scoping = res.scoping();
    let mut reads = Reads {
        blocked: vec![false; symbols.len()],
        snippets: vec![Vec::new(); symbols.len()],
    };
    let mut judge = |reference: ReferenceId, read: Read, declared: Option<ScopeId>| {
        if scoping.get_reference(reference).flags().is_type_only() {
            return;
        }
        // Upstream judges a read in each snippet it is inside, until the scope that declares it.
        let mut scope = Some(res.reference_scope(reference));
        while let Some(current) = scope
            && Some(current) != declared
        {
            if let Some(&snippet) = scopes.get(&current) {
                match read {
                    Read::Blocked => reads.blocked[snippet] = true,
                    Read::Snippet(other) => reads.snippets[snippet].push(other),
                }
            }
            scope = scoping.scope_parent_id(current);
        }
    };
    for symbol in scoping.symbol_ids() {
        // Upstream declares every import in the module's scope.
        if scoping.symbol_flags(symbol).is_import()
            || module.is_some_and(|m| m.contains_inclusive(scoping.symbol_span(symbol)))
        {
            continue;
        }
        let read = symbols
            .get(&symbol)
            .map_or(Read::Blocked, |&i| Read::Snippet(i));
        let declared = Some(scoping.symbol_scope_id(symbol));
        for &reference in scoping.get_resolved_reference_ids(symbol) {
            judge(reference, read, declared);
        }
    }
    // A store subscription is an instance-level name upstream; other globals are not names.
    for (name, references) in scoping.root_unresolved_references() {
        if res.is_store_subscription(name.as_str()) {
            for &reference in references {
                judge(reference, Read::Blocked, None);
            }
        }
    }
    let blocked = reads.blocked_or_reaching_blocked();
    (top_level.into_iter())
        .filter(|&(index, _)| !blocked[index])
        .map(|(_, symbol)| symbol)
        .collect()
}

#[derive(Clone, Copy)]
enum Read {
    Blocked,
    Snippet(usize),
}

struct Reads {
    /// Per snippet: it reads a name declared outside it that is neither module-level nor a
    /// snippet.
    blocked: Vec<bool>,
    /// Per snippet: the snippets declared outside it that it reads.
    snippets: Vec<Vec<usize>>,
}

impl Reads {
    /// Upstream's recursion fails a snippet that reaches a blocked one through the snippets it
    /// reads, so this marks every snippet a blocked one is reachable from.
    fn blocked_or_reaching_blocked(&self) -> Vec<bool> {
        let mut readers = vec![Vec::new(); self.blocked.len()];
        for (reader, read) in self.snippets.iter().enumerate() {
            for &snippet in read {
                readers[snippet].push(reader);
            }
        }
        let mut blocked = self.blocked.clone();
        let mut queue: Vec<usize> = (0..blocked.len()).filter(|&i| blocked[i]).collect();
        while let Some(snippet) = queue.pop() {
            for &reader in &readers[snippet] {
                if !blocked[reader] {
                    blocked[reader] = true;
                    queue.push(reader);
                }
            }
        }
        blocked
    }
}
