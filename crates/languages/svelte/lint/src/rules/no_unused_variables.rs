use oxc_ast::AstKind;
use oxc_ast::ast::{BindingIdentifier, BindingPattern, Expression, Statement};
use oxc_semantic::{Reference, Scoping, SymbolId};
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte_semantic::compiler_syntax_tree::{ElementKind, NodeKind};
use rustc_hash::FxHashSet;

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
/// snippets passed to a component, and one of two top-level names the scripts share.
fn check(file: &File<'_>, reporter: &mut Reporter<'_>) {
    let mut skipped = FxHashSet::default();
    if runes(file) != Some(false) {
        bindable_props(file, &mut skipped);
    }
    component_snippets(file, &mut skipped);
    shared_names(file, &mut skipped);
    rsvelte_typescript_lint::no_unused_variables(
        file.semantic(),
        |symbol| !skipped.contains(&symbol),
        reporter,
    );
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

/// `svelte-eslint-parser` reads `<script module>` and `<script>` as one scope, so a top-level
/// name both declare is one variable: unused only when neither is used, and then reported once.
fn shared_names(file: &File<'_>, out: &mut FxHashSet<SymbolId>) {
    let Some(resolution) = file.resolution() else {
        return;
    };
    let scoping = resolution.scoping();
    let (module, instance) = (scoping.root_scope_id(), resolution.instance_scope());
    if module == instance {
        return;
    }
    for (name, &second) in scoping.get_bindings(instance) {
        let Some(first) = scoping.get_binding(module, *name) else {
            continue;
        };
        if is_read(scoping, first) || is_read(scoping, second) {
            out.extend([first, second]);
            continue;
        }
        let (earlier, later) =
            if scoping.symbol_span(first).start <= scoping.symbol_span(second).start {
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
