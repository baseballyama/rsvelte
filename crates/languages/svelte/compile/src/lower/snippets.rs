//! What both targets need to know about `{#snippet}` and `{@render}`, beside how they spell it.

use oxc_ast::ast::{Argument, CallExpression, ChainElement, Expression};
use oxc_semantic::{ReferenceId, ScopeId, SymbolFlags, SymbolId};
use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind, Snippet};
use rsvelte_svelte_semantic::resolve::{BindingKind, Resolution, TemplateScope};
use rsvelte_typescript_tree::Tree;
use rustc_hash::{FxHashMap, FxHashSet};

use crate::input::CompileInput;

/// A name that stays in the output once upstream erases the types.
pub(super) fn is_runtime(flags: SymbolFlags) -> bool {
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
pub(super) fn hoistable(
    input: &CompileInput<'_>,
    res: &Resolution,
    stores: &super::stores::StoreSubscriptions<'_>,
) -> FxHashSet<SymbolId> {
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
    // A subscription is upstream's binding in the instance scope.
    for reference in stores.subscription_references(res) {
        reads.judge(res, &scopes, reference, Read::Blocked, res.instance_scope());
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
