//! What both targets need to know about `{#snippet}` and `{@render}`, beside how they spell it.

use oxc_ast::ast::{
    Argument, CallExpression, ChainElement, Expression, ModuleExportName, Statement,
};
use oxc_semantic::{ReferenceId, ScopeId, SymbolFlags, SymbolId};
use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, Element, Snippet};
use rsvelte_svelte_semantic::resolve::TemplateScope;
use rsvelte_svelte_semantic::warnings::{Phase, Raised, Section};
use rsvelte_typescript_tree::Tree;
use rustc_hash::{FxHashMap, FxHashSet};

use super::special::{error, invalid};
use super::{
    AttributeValue, BindingKind, CompileInput, Diagnostic, ElementKind, NodeKind, Resolution, Span,
    span_of,
};

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
                let at = walk(node.span.start_offset);
                if let Some(Argument::SpreadElement(spread)) =
                    call.arguments.iter().find(|a| a.is_spread())
                {
                    let message = "cannot use spread arguments in `{@render ...}` tags";
                    let spread = span_of(&**spread);
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
    out
}

const fn walk(at: u32) -> Raised {
    Raised {
        phase: Phase::Walk,
        section: Section::Template,
        at,
    }
}

const fn scopes(at: u32) -> Raised {
    Raised {
        phase: Phase::Scopes,
        section: Section::Template,
        at,
    }
}

/// Where upstream's walk is once it has walked the body of the node at `span`.
const fn after(span: Span) -> u32 {
    span.end_offset - 1
}

fn duplicate(name: &str, span: Span) -> Diagnostic {
    error(
        "declaration_duplicate",
        &format!("`{name}` has already been declared"),
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
    if let Some(rest) =
        (snippet.parameters).and_then(|p| javascript.get_parameters(p).rest.as_ref())
    {
        let message = "Snippets do not support rest parameters; use an array instead";
        let rest = span_of(&**rest);
        let at = walk(node.span.start_offset);
        out.push((at, error("snippet_invalid_rest_parameter", message, rest)));
    }
    let name = snippet_name(javascript, snippet);
    let name_span = span_of(javascript.get_expression(snippet.name));
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
        out.push((scopes(later.start_offset), duplicate(name, later)));
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
            out.push((walk(after(node.span)), duplicate(name, name_span)));
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
        out.push((scopes(name_span.start_offset), duplicate(name, name_span)));
    } else if opened(TemplateScope::Snippet(parent)) {
        out.push((scopes(after(parent_span)), duplicate(name, name_span)));
    } else if opened(TemplateScope::Then(parent)) || opened(TemplateScope::Catch(parent)) {
        // Upstream declares the value after it walks the branch.
        let value = scoping.symbol_span(other);
        let value = Span::new(value.start, value.end);
        out.push((scopes(after(parent_span)), duplicate(name, value)));
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
                (matches!(a.value, AttributeValue::Bind(_)) || !super::is_directive(&a.value))
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
        let at = walk(after(node.span));
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
            let message = "Cannot use explicit children snippet at the same time as implicit children content. Remove either the non-whitespace content or the children snippet block";
            out.push((at, error("snippet_conflict", message, node.span)));
        }
    }
}

/// Upstream `snippet_invalid_export`, which it raises after the template's walk: the module
/// script exports a snippet that is not hoisted beside it.
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
            if snippets.get(local.name.as_str()) == Some(&false) {
                return invalid(
                    "snippet_invalid_export",
                    "An exported snippet can only reference things declared in a `<script module>`, or other exportable snippets",
                    span_of(specifier),
                );
            }
        }
    }
    Ok(())
}

/// A name that stays in the output once upstream erases the types.
fn is_runtime(flags: SymbolFlags) -> bool {
    flags.intersects(SymbolFlags::Value | SymbolFlags::Import)
        && !flags.contains(SymbolFlags::Ambient)
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

/// Each snippet a component holds and the outer name it shadows, which upstream's client reads it
/// as: its `transform` is keyed by name, and a component's children enter no scope that drops it.
pub(super) fn component_child_shadows(
    input: &CompileInput<'_>,
    res: &Resolution,
) -> FxHashMap<SymbolId, SymbolId> {
    let scoping = res.scoping();
    let tree = input.component.compiler_syntax_tree;
    let mut shadows = FxHashMap::default();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        if let NodeKind::Snippet(_) = node.kind
            && let Some(parent) = node.parent
            && matches!(&tree.node(parent).kind, NodeKind::Element(e) if e.kind.renders_component())
            && let Some(symbol) = res.snippet(identifier)
            && let Some(outer) = scoping.scope_parent_id(scoping.symbol_scope_id(symbol))
            && let Some(shadowed) = scoping.find_binding(outer, scoping.symbol_ident(symbol))
        {
            shadows.insert(symbol, shadowed);
        }
    }
    shadows
}

/// Where a snippet is declared.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Place {
    /// In the block that holds it.
    Block,
    /// Beside the component, after the imports.
    Module,
    /// At the top of the component, before the instance script.
    Instance,
}

/// Upstream `SnippetBlock`: a top-level snippet is declared in the component's own scope, so that
/// the script can read it, and beside the component when it can hoist.
pub(super) fn place(
    tree: &rsvelte_svelte_semantic::compiler_syntax_tree::CompilerSyntaxTree,
    res: &Resolution,
    hoistable: &FxHashSet<SymbolId>,
    identifier: CompilerNodeIdentifier,
) -> Place {
    if tree.node(identifier).parent.is_some() {
        Place::Block
    } else if res
        .snippet(identifier)
        .is_some_and(|s| hoistable.contains(&s))
    {
        Place::Module
    } else {
        Place::Instance
    }
}

/// Upstream `can_hoist_snippet` for each top-level snippet: what it reads is an import, declared
/// in the module script or inside the snippet, or another snippet that can hoist.
///
/// A snippet named like an import or a module-level name stays in the component, where it
/// shadows that name; upstream hoists it beside it, which declares the name twice.
pub(super) fn hoistable(input: &CompileInput<'_>, res: &Resolution) -> FxHashSet<SymbolId> {
    let tree = input.component.compiler_syntax_tree;
    let scoping = res.scoping();
    let module_level = |symbol: SymbolId| {
        scoping.symbol_flags(symbol).is_import()
            || (input.component.module.is_some()
                && scoping.symbol_scope_id(symbol) == scoping.root_scope_id())
    };
    let mut scopes = FxHashMap::default();
    let mut symbols = FxHashMap::default();
    let mut top_level = Vec::new();
    let mut count = 0;
    for (identifier, node) in tree.nodes.iter_enumerated() {
        if let NodeKind::Snippet(_) = node.kind
            && let Some(symbol) = res.snippet(identifier)
        {
            symbols.insert(symbol, count);
            if let Some(scope) = res.template_scope(TemplateScope::Snippet(identifier)) {
                scopes.insert(scope, count);
            }
            if node.parent.is_none() {
                top_level.push((count, symbol));
            }
            count += 1;
        }
    }
    if top_level.is_empty() {
        return FxHashSet::default();
    }
    let mut reads = Reads {
        blocked: vec![false; count],
        snippets: vec![Vec::new(); count],
    };
    for &(index, symbol) in &top_level {
        let name = scoping.symbol_ident(symbol);
        reads.blocked[index] = [scoping.root_scope_id(), res.instance_scope()]
            .into_iter()
            .filter_map(|scope| scoping.get_binding(scope, name))
            .any(|other| module_level(other) && is_runtime(scoping.symbol_flags(other)));
    }
    for symbol in scoping.symbol_ids() {
        if module_level(symbol) {
            continue;
        }
        let read = symbols
            .get(&symbol)
            .map_or(Read::Blocked, |&i| Read::Snippet(i));
        let declared = scoping.symbol_scope_id(symbol);
        for &reference in scoping.get_resolved_reference_ids(symbol) {
            reads.judge(res, &scopes, reference, read, declared);
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
    /// Upstream judges a read in each snippet it is inside, until the scope that declares it.
    fn judge(
        &mut self,
        res: &Resolution,
        scopes: &FxHashMap<ScopeId, usize>,
        reference: ReferenceId,
        read: Read,
        declared: ScopeId,
    ) {
        let scoping = res.scoping();
        if scoping.get_reference(reference).flags().is_type_only() {
            return;
        }
        let mut scope = Some(res.reference_scope(reference));
        while let Some(current) = scope
            && current != declared
        {
            if let Some(&snippet) = scopes.get(&current) {
                match read {
                    Read::Blocked => self.blocked[snippet] = true,
                    Read::Snippet(other) => self.snippets[snippet].push(other),
                }
            }
            scope = scoping.scope_parent_id(current);
        }
    }

    /// Upstream's recursion fails a snippet that reaches a blocked one through the snippets it
    /// reads, so this marks every snippet a blocked one is reachable from.
    fn blocked_or_reaching_blocked(self) -> Vec<bool> {
        let mut readers = vec![Vec::new(); self.blocked.len()];
        for (reader, read) in self.snippets.iter().enumerate() {
            for &snippet in read {
                readers[snippet].push(reader);
            }
        }
        let mut blocked = self.blocked;
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
