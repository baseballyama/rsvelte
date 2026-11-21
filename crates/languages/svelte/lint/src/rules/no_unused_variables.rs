use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingIdentifier, BindingPattern, Expression, Ident, ModuleExportName, Statement,
};
use oxc_semantic::{AstNodes, NodeId, Reference, ReferenceId, ScopeId, Scoping, SymbolId};
use oxc_span::GetSpan;
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::compiler_syntax_tree::{AttributeValue, ElementKind, NodeKind};
use rsvelte_svelte_semantic::resolve::TemplateScope;
use rsvelte_typescript_tree::document_span;
use rustc_hash::{FxHashMap, FxHashSet};

use super::shared::legacy_reactivity::{TopLevel, Variable, legacy};
use super::shared::nodes;
use super::shared::runes::runes;
use super::shared::svelte_names::{TopLevelNames, has_reactive_statement};
use crate::rule::{File, Files, RuleDefinition, SvelteRule, without_options};

#[cfg(test)]
mod tests;

/// `ESLint`'s core rule over a component; `typescript.lint` owns it for modules.
pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "no-unused-vars",
    files: Files::Components,
    configure: without_options::<NoUnusedVariables>,
};

#[derive(Debug, Default)]
struct NoUnusedVariables;

impl SvelteRule for NoUnusedVariables {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        check(file, reporter);
    }
}

/// The core rule, without the names `svelte-eslint-parser` marks used: `$bindable()` props,
/// names a re-export lists, subscribed stores, snippets passed to a component, and one of two
/// top-level names the scripts share. Its reads include the scripts' references to top-level
/// snippets.
fn check(file: &File<'_>, reporter: &mut Reporter<'_>) {
    let mut skipped = FxHashSet::default();
    let runes = runes(file) != Some(false);
    virtually_read(file, runes, &mut skipped);
    let top_level = TopLevelNames::new(file);
    let mut reads = FxHashMap::default();
    if let Some(top_level) = &top_level {
        reads = subscribed_stores(top_level, runes, &mut skipped);
        script_snippets(top_level, &mut reads);
    }
    component_snippets(file, &mut skipped);
    shared_names(file, &mut skipped);
    let bodies = snippet_bodies(file);
    // Few components have unused `let:` names, so the walk waits for the first.
    let defaulted_lets = std::cell::OnceCell::new();
    rsvelte_typescript_lint::no_unused_variables(
        file.semantic(),
        rsvelte_typescript_lint::Dialect::Core,
        |symbol| !skipped.contains(&symbol),
        |symbol| reads.get(&symbol).map_or(&[], Vec::as_slice),
        |symbol| bodies.get(&symbol).copied(),
        |symbol| {
            let starts = defaulted_lets.get_or_init(|| defaulted_let_starts(file));
            let scoping = file.semantic().scoping();
            starts.contains(&scoping.symbol_span(symbol).start)
        },
        reporter,
    );
    reactive_declarations(file, reporter);
}

/// Where each `let:` name under a default value starts: svelte-eslint-parser reads the value as a
/// parameter pattern, whose defaults assign the names.
fn defaulted_let_starts(file: &File<'_>) -> FxHashSet<u32> {
    let mut starts = FxHashSet::default();
    let Some(tree) = file.lowered() else {
        return starts;
    };
    for attribute in &tree.attributes {
        if let AttributeValue::Let(Some(value)) = attribute.value {
            let value = file.javascript().get_expression(value);
            rsvelte_svelte_semantic::resolve::let_names_under_a_default(value, |span| {
                starts.insert(span.start);
            });
        }
    }
    starts
}

/// `analyzeReactiveScope`: a top-level `$: name = …` that assigns an undeclared name declares it,
/// with the first assigned identifier as its definition.
fn reactive_declarations(file: &File<'_>, reporter: &mut Reporter<'_>) {
    if !has_reactive_statement(file) {
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
            document_span(at),
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
    let (Some(tree), Some(resolution)) = (file.lowered(), file.resolution()) else {
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
fn script_snippets(
    top_level: &TopLevelNames<'_>,
    reads: &mut FxHashMap<SymbolId, Vec<ReferenceId>>,
) {
    if !top_level.has_snippets() {
        return;
    }
    let scoping = top_level.scoping();
    for (name, references) in scoping.root_unresolved_references() {
        if let Some(symbol) = top_level.snippet(name.as_str()) {
            reads.entry(symbol).or_default().extend(references);
        }
    }
}

/// Top-level names with a virtual read, found by name as upstream finds them:
/// `let { a = $bindable() } = $props()` in runes mode, and `export { a } from '…'`, as a legacy
/// prop, although the re-export does not refer to `a`.
fn virtually_read(file: &File<'_>, runes: bool, out: &mut FxHashSet<SymbolId>) {
    let (Some(component), Some(resolution)) = (file.component(), file.resolution()) else {
        return;
    };
    let scoping = resolution.scoping();
    let scopes = [resolution.instance_scope(), scoping.root_scope_id()];
    let mut read = |name: Ident<'_>| {
        out.extend(
            scopes
                .iter()
                .find_map(|&scope| scoping.get_binding(scope, name)),
        );
    };
    let tree = file.javascript();
    for script in component.scripts() {
        for statement in &tree.get_program(script.program).body {
            match statement {
                Statement::VariableDeclaration(declaration) if runes => {
                    for declarator in &declaration.declarations {
                        if let Some(Expression::CallExpression(call)) = &declarator.init
                            && nodes::is_named(&call.callee, "$props")
                            && matches!(declarator.id, BindingPattern::ObjectPattern(_))
                        {
                            bindable_names(&declarator.id, &mut |identifier| {
                                read(identifier.name);
                            });
                        }
                    }
                }
                Statement::ExportFromDeclaration(export) => {
                    for specifier in &export.specifiers {
                        if let ModuleExportName::IdentifierName(local) = &specifier.local {
                            read(local.name);
                        }
                    }
                }
                _ => {}
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
    top_level: &TopLevelNames<'_>,
    runes: bool,
    used: &mut FxHashSet<SymbolId>,
) -> FxHashMap<SymbolId, Vec<ReferenceId>> {
    let mut stores: FxHashMap<SymbolId, Vec<ReferenceId>> = FxHashMap::default();
    let scoping = top_level.scoping();
    for (name, references) in scoping.root_unresolved_references() {
        for symbol in top_level.stores(name.as_str(), runes) {
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

/// A `{#snippet}` directly inside a component, `<svelte:component>` or `<svelte:boundary>` is a
/// prop of it.
fn component_snippets(file: &File<'_>, out: &mut FxHashSet<SymbolId>) {
    let (Some(tree), Some(resolution)) = (file.lowered(), file.resolution()) else {
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
    let mut merge = |outer: ScopeId, inner: Option<ScopeId>| {
        let Some(inner) = inner else {
            return;
        };
        for (name, &second) in scoping.get_bindings(inner) {
            if let Some(first) = scoping.get_binding(outer, *name) {
                share(file, scoping, first, second, out);
            }
        }
    };
    if module != instance {
        merge(module, Some(instance));
    }
    let Some(tree) = file.lowered() else {
        return;
    };
    let root = fragment(tree.root);
    merge(instance, root);
    if module != instance {
        merge(module, root);
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
                merge(scope, fragment(body));
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
