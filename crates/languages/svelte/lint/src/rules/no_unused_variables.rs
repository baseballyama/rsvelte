use oxc_ast::AstKind;
use oxc_ast::ast::{BindingIdentifier, BindingPattern, Expression, Statement};
use oxc_semantic::{AstNodes, NodeId, Reference, ReferenceId, ScopeId, Scoping, SymbolId};
use oxc_span::GetSpan;
use rsvelte_kernel::source::positions::Span;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, NodeKind};
use rsvelte_svelte_semantic::legacy::{TopLevel, Variable};
use rsvelte_svelte_semantic::resolve::TemplateScope;
use rustc_hash::{FxHashMap, FxHashSet};

use super::legacy_reactivity::legacy;
use super::nodes;
use super::runes::runes;
use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

#[cfg(test)]
mod tests;

/// `ESLint`'s core rule over a component; `typescript.lint` owns it for modules.
pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "no-unused-vars",
    files: Files::Components,
    configure,
};

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    options.none()?;
    Ok(Box::new(NoUnusedVariables))
}

#[derive(Debug)]
struct NoUnusedVariables;

impl SvelteRule for NoUnusedVariables {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        check(file, reporter);
    }
}

/// The core rule, without the names `svelte-eslint-parser` marks used: `$bindable()` props,
/// subscribed stores, snippets passed to a component, and one of two top-level names the scripts
/// share. Its reads include the scripts' references to top-level snippets.
fn check(file: &File<'_>, reporter: &mut Reporter<'_>) {
    let mut skipped = FxHashSet::default();
    let runes = runes(file) != Some(false);
    if runes {
        bindable_props(file, &mut skipped);
    }
    let mut reads = subscribed_stores(file, runes, &mut skipped);
    script_snippets(file, &mut reads);
    component_snippets(file, &mut skipped);
    shared_names(file, &mut skipped);
    let bodies = snippet_bodies(file);
    rsvelte_typescript_lint::no_unused_variables(
        file.semantic(),
        |symbol| !skipped.contains(&symbol),
        |symbol| reads.get(&symbol).map_or(&[], Vec::as_slice),
        |symbol| bodies.get(&symbol).copied(),
        reporter,
    );
    reactive_declarations(file, reporter);
}

/// `analyzeReactiveScope`: a top-level `$: name = …` that assigns an undeclared name declares it,
/// with the first assigned identifier as its definition.
fn reactive_declarations(file: &File<'_>, reporter: &mut Reporter<'_>) {
    // Most components have no `$:`, and then need no legacy facts.
    let tree = file.javascript();
    let reactive = file.programs().into_iter().any(|program| {
        tree.get_program(program).body.iter().any(|statement| {
            matches!(statement, Statement::LabeledStatement(labeled) if labeled.label.name == "$")
        })
    });
    if !reactive {
        return;
    }
    let legacy = legacy(file);
    if legacy.implicit.is_empty() {
        return;
    }
    let semantic = file.semantic();
    let (scoping, nodes) = (semantic.scoping(), semantic.nodes());
    let mut used = vec![false; legacy.implicit.len()];
    let mut last_write: Vec<Option<oxc_span::Span>> = vec![None; legacy.implicit.len()];
    for (index, top) in legacy.references.iter().enumerate() {
        let Some(TopLevel {
            variable: Variable::Implicit(variable),
            ..
        }) = *top
        else {
            continue;
        };
        let variable = variable as usize;
        let reference = scoping.get_reference(ReferenceId::from_usize(index));
        let node = reference.node_id();
        let at = nodes.kind(node).span();
        if at == legacy.implicit[variable].identifier {
            continue;
        }
        if reference.is_write() && last_write[variable].is_none_or(|w| w.start < at.start) {
            last_write[variable] = Some(at);
        }
        used[variable] |= reference.is_read() && !updates_itself(nodes, node);
    }
    for ((implicit, used), write) in legacy.implicit.iter().zip(used).zip(last_write) {
        if used {
            continue;
        }
        let (action, at) = write.map_or(("defined", implicit.identifier), |w| {
            ("assigned a value", w)
        });
        reporter.range(
            format!("'{}' is {action} but never used.", implicit.name),
            Span::new(at.start, at.end),
        );
    }
}

/// `isReadForItself`: `x += 1` or `x++` as a statement, or `x` in the value of `x = …`.
fn updates_itself(nodes: &AstNodes<'_>, identifier: NodeId) -> bool {
    let name = match nodes.kind(identifier) {
        AstKind::IdentifierReference(reference) => reference.name,
        _ => return false,
    };
    let parent = nodes.parent_id(identifier);
    match nodes.kind(parent) {
        AstKind::AssignmentExpression(_) | AstKind::UpdateExpression(_) => {
            return matches!(nodes.parent_kind(parent), AstKind::ExpressionStatement(_));
        }
        _ => {}
    }
    nodes.ancestor_kinds(identifier).any(|kind| {
        matches!(
            kind,
            AstKind::AssignmentExpression(assignment)
                if assignment.left.get_identifier_name() == Some(name.as_str())
        )
    })
}

/// The scope of each snippet's parameters and body, where `svelte-eslint-parser`'s function for
/// it makes a reference to it a self-reference.
fn snippet_bodies(file: &File<'_>) -> FxHashMap<SymbolId, ScopeId> {
    let (Some(tree), Some(resolution)) = (file.normalized(), file.resolution()) else {
        return FxHashMap::default();
    };
    tree.nodes
        .iter_enumerated()
        .filter(|(_, node)| matches!(node.kind, NodeKind::Snippet(_)))
        .filter_map(|(identifier, _)| {
            Some((
                resolution.snippet(identifier)?,
                resolution.template_scope(TemplateScope::Snippet(identifier))?,
            ))
        })
        .collect()
}

/// `svelte-eslint-parser` declares a top-level snippet in the scripts' scope, where Svelte's
/// scopes leave a script's reference to it unresolved.
fn script_snippets(file: &File<'_>, reads: &mut FxHashMap<SymbolId, Vec<ReferenceId>>) {
    let (Some(tree), Some(resolution)) = (file.normalized(), file.resolution()) else {
        return;
    };
    let scoping = resolution.scoping();
    let mut top_level = FxHashMap::default();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        if matches!(node.kind, NodeKind::Snippet(_))
            && node.parent.is_none()
            && let Some(symbol) = resolution.snippet(identifier)
        {
            top_level.insert(scoping.symbol_name(symbol), symbol);
        }
    }
    if top_level.is_empty() {
        return;
    }
    for (name, references) in scoping.root_unresolved_references() {
        if let Some(&symbol) = top_level.get(name.as_str()) {
            reads.entry(symbol).or_default().extend(references);
        }
    }
}

/// `let { a = $bindable() } = $props()` at the top level gets a virtual read of the top-level
/// `a`, found by name as upstream finds it.
fn bindable_props(file: &File<'_>, out: &mut FxHashSet<SymbolId>) {
    let Some(resolution) = file.resolution() else {
        return;
    };
    let scoping = resolution.scoping();
    let scopes = [resolution.instance_scope(), scoping.root_scope_id()];
    let tree = file.javascript();
    for program in file.programs() {
        for statement in &tree.get_program(program).body {
            let Statement::VariableDeclaration(declaration) = statement else {
                continue;
            };
            for declarator in &declaration.declarations {
                if let Some(Expression::CallExpression(call)) = &declarator.init
                    && nodes::is_named(&call.callee, "$props")
                    && matches!(declarator.id, BindingPattern::ObjectPattern(_))
                {
                    bindable_names(&declarator.id, &mut |identifier| {
                        out.extend(
                            scopes
                                .iter()
                                .find_map(|&scope| scoping.get_binding(scope, identifier.name)),
                        );
                    });
                }
            }
        }
    }
}

/// Every `name = $bindable(…)` in `pattern`, at any depth.
fn bindable_names<'a>(pattern: &BindingPattern<'a>, out: &mut impl FnMut(&BindingIdentifier<'a>)) {
    match pattern {
        BindingPattern::BindingIdentifier(_) => {}
        BindingPattern::ObjectPattern(object) => {
            for property in &object.properties {
                bindable_names(&property.value, out);
            }
            if let Some(rest) = &object.rest {
                bindable_names(&rest.argument, out);
            }
        }
        BindingPattern::ArrayPattern(array) => {
            for element in array.elements.iter().flatten() {
                bindable_names(element, out);
            }
            if let Some(rest) = &array.rest {
                bindable_names(&rest.argument, out);
            }
        }
        BindingPattern::AssignmentPattern(assignment) => {
            if let BindingPattern::BindingIdentifier(identifier) = &assignment.left
                && let Expression::CallExpression(call) = &assignment.right
                && nodes::is_named(&call.callee, "$bindable")
            {
                out(identifier);
            }
            bindable_names(&assignment.left, out);
        }
    }
}

/// `analyzeStoreScope`: each unresolved `$name` becomes a plain read of the top-level `name` it
/// subscribes to, in either script. A store whose only references are such reads that the code
/// writes (`$name = v`) is marked used.
fn subscribed_stores(
    file: &File<'_>,
    runes: bool,
    used: &mut FxHashSet<SymbolId>,
) -> FxHashMap<SymbolId, Vec<ReferenceId>> {
    let mut stores: FxHashMap<SymbolId, Vec<ReferenceId>> = FxHashMap::default();
    let Some(resolution) = file.resolution() else {
        return stores;
    };
    let scoping = resolution.scoping();
    // The root fragment's names are top-level names to `svelte-eslint-parser`.
    let root = file
        .normalized()
        .and_then(|tree| resolution.template_scope(TemplateScope::Fragment(tree.root)));
    let scopes = [
        Some(resolution.instance_scope()),
        Some(scoping.root_scope_id()),
        root,
    ];
    for (name, references) in scoping.root_unresolved_references() {
        let name = name.as_str();
        let Some(store) = name.strip_prefix('$') else {
            continue;
        };
        if SVELTE_GLOBALS.contains(&name) || (runes && RUNE_GLOBALS.contains(&name)) {
            continue;
        }
        for symbol in scopes
            .iter()
            .flatten()
            .filter_map(|&scope| scoping.get_binding(scope, store.into()))
        {
            stores.entry(symbol).or_default().extend(references);
        }
    }
    let write_only = |&id: &ReferenceId| {
        let reference = scoping.get_reference(id);
        reference.is_write() && !reference.is_read()
    };
    // Marking is a set insertion, so the map's order does not matter.
    used.extend(
        stores
            .iter()
            .filter(|(symbol, references)| {
                references.iter().all(write_only)
                    && scoping.get_resolved_reference_ids(**symbol).is_empty()
            })
            .map(|(&symbol, _)| symbol),
    );
    stores
}

/// `svelte-eslint-parser`'s globals, which subscribe to nothing.
const SVELTE_GLOBALS: [&str; 3] = ["$$slots", "$$props", "$$restProps"];
/// Its globals outside legacy mode.
const RUNE_GLOBALS: [&str; 7] = [
    "$state",
    "$derived",
    "$effect",
    "$props",
    "$bindable",
    "$inspect",
    "$host",
];

/// A `{#snippet}` directly inside a component, `<svelte:component>` or `<svelte:boundary>` is a
/// prop of it.
fn component_snippets(file: &File<'_>, out: &mut FxHashSet<SymbolId>) {
    let (Some(tree), Some(resolution)) = (file.normalized(), file.resolution()) else {
        return;
    };
    let source = file.source();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        let NodeKind::Snippet(_) = node.kind else {
            continue;
        };
        let Some(NodeKind::Element(parent)) = node.parent.map(|parent| &tree.nodes[parent].kind)
        else {
            continue;
        };
        let passed = parent.kind == ElementKind::Component
            || matches!(
                parent.name.text(source),
                "svelte:component" | "svelte:boundary"
            );
        if passed && let Some(symbol) = resolution.snippet(identifier) {
            out.insert(symbol);
        }
    }
}

/// `svelte-eslint-parser` reads some scopes that Svelte keeps apart as one: the scripts' and the
/// root fragment's top level, and a block's parameters with its body. A name two of them declare
/// is one variable: unused only when neither is used, and then reported once.
fn shared_names(file: &File<'_>, out: &mut FxHashSet<SymbolId>) {
    let Some(resolution) = file.resolution() else {
        return;
    };
    let scoping = resolution.scoping();
    let (module, instance) = (scoping.root_scope_id(), resolution.instance_scope());
    let fragment = |children| resolution.template_scope(TemplateScope::Fragment(children));
    let mut pairs = Vec::new();
    if module != instance {
        pairs.push((module, Some(instance)));
    }
    if let Some(tree) = file.normalized() {
        let root = fragment(tree.root);
        pairs.push((instance, root));
        if module != instance {
            pairs.push((module, root));
        }
        for (identifier, node) in tree.nodes.iter_enumerated() {
            let blocks = match &node.kind {
                NodeKind::Snippet(snippet) => [
                    Some((TemplateScope::Snippet(identifier), snippet.body)),
                    None,
                ],
                NodeKind::Each(each) => [Some((TemplateScope::Each(identifier), each.body)), None],
                NodeKind::Await(a) => [
                    a.then().map(|then| (TemplateScope::Then(identifier), then)),
                    a.catch()
                        .map(|catch| (TemplateScope::Catch(identifier), catch)),
                ],
                _ => continue,
            };
            for (scope, body) in blocks.into_iter().flatten() {
                if let Some(scope) = resolution.template_scope(scope) {
                    pairs.push((scope, fragment(body)));
                }
            }
        }
    }
    for (outer, inner) in pairs {
        let Some(inner) = inner else {
            continue;
        };
        for (name, &second) in scoping.get_bindings(inner) {
            if let Some(first) = scoping.get_binding(outer, *name) {
                share(file, scoping, first, second, out);
            }
        }
    }
}

/// Marks one of two declarations of one variable used, or both when either is.
fn share(
    file: &File<'_>,
    scoping: &Scoping,
    first: SymbolId,
    second: SymbolId,
    out: &mut FxHashSet<SymbolId>,
) {
    let used = |symbol| {
        out.contains(&symbol) || is_read(scoping, symbol) || is_exported(file, scoping, symbol)
    };
    if used(first) || used(second) {
        out.extend([first, second]);
        return;
    }
    let (earlier, later) = if scoping.symbol_span(first).start <= scoping.symbol_span(second).start
    {
        (first, second)
    } else {
        (second, first)
    };
    // `ESLint` reports at the last write, or at the first declaration when nothing writes.
    out.insert(if is_assigned(file, scoping, later) {
        earlier
    } else {
        later
    });
}

/// Declared by an `export` declaration.
fn is_exported(file: &File<'_>, scoping: &Scoping, symbol: SymbolId) -> bool {
    let nodes = file.nodes();
    let declaration = scoping.symbol_declaration(symbol);
    let owner = match nodes.kind(declaration) {
        AstKind::VariableDeclarator(_) => nodes.parent_id(declaration),
        _ => declaration,
    };
    matches!(
        nodes.parent_kind(owner),
        AstKind::ExportDeclaration(_) | AstKind::ExportDefaultDeclaration(_)
    )
}

/// A value or type reference that reads the symbol.
fn is_read(scoping: &Scoping, symbol: SymbolId) -> bool {
    scoping
        .get_resolved_references(symbol)
        .any(|reference| reference.is_read() || reference.is_type())
}

/// Declared with an initializer, or written later.
fn is_assigned(file: &File<'_>, scoping: &Scoping, symbol: SymbolId) -> bool {
    let initialized = matches!(
        file.nodes().kind(scoping.symbol_declaration(symbol)),
        AstKind::VariableDeclarator(declarator) if declarator.init.is_some()
    );
    initialized
        || scoping
            .get_resolved_references(symbol)
            .any(Reference::is_write)
}
