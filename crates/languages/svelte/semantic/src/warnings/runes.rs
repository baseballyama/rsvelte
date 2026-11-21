//! Runes mode, and the errors of `$` names and of `$props()` that it decides.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingPattern, Declaration, Expression, ObjectPropertyKind, Program, PropertyKey, Statement,
    VariableDeclaration, VariableDeclarationKind,
};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::{ScopeId, SymbolFlags};
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Component, Part};
use rsvelte_typescript_tree::{ProgramIdentifier, Tree, document_span};
use rustc_hash::FxHashSet;

use super::found::{Found, Stage};
use super::{Phase, Raised, Section, error, warning};
use crate::resolve::{BindingKind, Resolution, is_rune};

/// Svelte's runes mode: `<svelte:options runes>`, or else a top-level `await` or a reference to
/// a rune that is not a store subscription.
pub(super) fn runes(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    awaits: &[Span],
    forced: Option<bool>,
) -> bool {
    if let Some(attribute) = component.svelte_option(source, "runes") {
        return match attribute.value {
            AttributeValue::True => true,
            AttributeValue::Parts(parts) => !matches!(
                component.parts(parts),
                [Part::Expression { expression, .. }]
                    if matches!(
                        component.javascript.get_expression(*expression),
                        Expression::BooleanLiteral(b) if !b.value
                    )
            ),
        };
    }
    if let Some(forced) = forced {
        return forced;
    }
    if !awaits.is_empty() {
        return true;
    }
    resolution
        .unresolved_names()
        .any(|name| is_rune(name) && !resolution.is_store_subscription(name))
}

/// `dollar_prefix_invalid` and `dollar_binding_invalid`, with where the compiler raises each.
///
/// A `$` name a script declares: creating the scopes rejects one outside functions of the
/// instance or nested at most one function deep in the module; in runes mode, the walk rejects a
/// variable or function at any depth. The compiler's errors and the warnings both read this one
/// implementation. `instance` and `module` are the scripts' programs in `javascript`.
#[must_use]
pub fn dollar_name_errors(
    javascript: &Tree,
    instance: Option<ProgramIdentifier>,
    module: Option<ProgramIdentifier>,
    resolution: &Resolution,
    runes: bool,
) -> Vec<(Raised, Diagnostic)> {
    let source = javascript.source_text();
    let holds = |program: Option<ProgramIdentifier>, offset: u32| {
        program.is_some_and(|p| {
            let span = javascript.get_program(p).span;
            span.start <= offset && offset < span.end
        })
    };
    let mut out = Vec::new();
    let scoping = resolution.scoping();
    let nodes = resolution.semantic().nodes();
    let mut found: Vec<(Raised, Span)> = Vec::new();
    // TypeScript erases types and `declare`d names; an enum stays, as a variable.
    let erased = SymbolFlags::Ambient
        | SymbolFlags::TypeImport
        | SymbolFlags::TypeAlias
        | SymbolFlags::Interface
        | SymbolFlags::TypeParameter
        | SymbolFlags::EnumMember
        | SymbolFlags::NamespaceModule
        | SymbolFlags::ValueModule;
    for symbol in scoping.symbol_ids() {
        let flags = scoping.symbol_flags(symbol);
        if flags.intersects(erased) || !scoping.symbol_name(symbol).starts_with('$') {
            continue;
        }
        // Upstream declares a binding at each declaration and checks no parameter's name.
        let declared = (
            scoping.symbol_declaration(symbol),
            scoping.symbol_span(symbol),
        );
        let redeclarations = scoping.symbol_redeclarations(symbol);
        let checked = || {
            (redeclarations.iter().map(|r| (r.declaration, r.span)))
                .chain(redeclarations.is_empty().then_some(declared))
                .filter(|&(node, _)| !is_parameter(nodes, node))
        };
        let Some(first) = checked().next() else {
            continue;
        };
        let first_at = document_span(first.1).start_offset;
        let section = if holds(module, first_at) {
            Section::Module
        } else if holds(instance, first_at) {
            Section::Instance
        } else {
            Section::Template
        };
        let scope = scoping.symbol_scope_id(symbol);
        let scope_node = nodes.kind(scoping.get_node_id(scope));
        // A class expression's own name is not in the compiler's scopes.
        if matches!(scope_node, AstKind::Class(_)) {
            continue;
        }
        // Upstream declares a function expression's name in a scope that counts no depth.
        let names_function_expression = matches!(scope_node, AstKind::Function(f)
            if f.is_expression() && f.id.as_ref().and_then(|id| id.symbol_id.get()) == Some(symbol));
        // The walk checks function and class declarations and variable declarators, and visits
        // a `{@const}`'s declarator only through its id and value.
        let walked = runes
            && checked().any(|(node, _)| match nodes.kind(node) {
                AstKind::Function(function) => function.is_declaration(),
                AstKind::Class(class) => class.is_declaration(),
                AstKind::VariableDeclarator(_) => {
                    resolution.binding(symbol).kind != BindingKind::Template
                }
                _ => false,
            });
        // Creating the scopes checks the first binding, the walk the one a `var` declared again
        // left in its place.
        let last = checked().next_back().unwrap_or(first);
        let (phase, (_, span)) = match section {
            // Upstream's template scopes sit more than one function below the module's, out of
            // reach of the check creating the scopes makes.
            Section::Template if walked => (Phase::Walk, last),
            Section::Template => continue,
            Section::Module | Section::Instance if flags.intersects(SymbolFlags::Enum) => {
                (Phase::Scopes, first)
            }
            Section::Module | Section::Instance => {
                let depth = function_depth(resolution, scope, section == Section::Instance)
                    - u32::from(names_function_expression);
                if depth <= 1 {
                    (Phase::Scopes, first)
                } else if walked {
                    (Phase::Walk, last)
                } else {
                    continue;
                }
            }
        };
        let at = document_span(span);
        let raised = Raised {
            phase,
            section,
            at: at.start_offset,
        };
        found.push((raised, at));
    }
    for (raised, span) in found {
        out.push((raised, reserved(span, source)));
    }
    out
}

/// Whether the declaration at `node` is a parameter, whose symbol is declared at the parameter
/// node itself.
fn is_parameter(nodes: &oxc_semantic::AstNodes<'_>, node: oxc_semantic::NodeId) -> bool {
    std::iter::once(nodes.kind(node))
        .chain(nodes.ancestor_kinds(node))
        .any(|kind| {
            matches!(
                kind,
                AstKind::FormalParameter(_) | AstKind::FormalParameterRest(_)
            )
        })
}

/// Upstream's `function_depth` of a script's `scope`: the functions around it, and one more in
/// the instance, whose program is a function of the module's.
fn function_depth(resolution: &Resolution, mut scope: ScopeId, instance: bool) -> u32 {
    let scoping = resolution.scoping();
    let program = if instance {
        resolution.instance_scope()
    } else {
        scoping.root_scope_id()
    };
    let mut depth = u32::from(instance);
    while scope != program {
        depth += u32::from(resolution.is_function_scope(scope));
        let Some(parent) = scoping.scope_parent_id(scope) else {
            break;
        };
        scope = parent;
    }
    depth
}

/// The error a reserved name declared at `span` raises.
fn reserved(span: Span, source: &str) -> Diagnostic {
    if span.text(source) == "$" {
        error(
            "dollar_binding_invalid",
            "The $ name is reserved, and cannot be used for variables and imports",
            span,
        )
    } else {
        error(
            "dollar_prefix_invalid",
            "The $ prefix is reserved, and cannot be used for variables and imports",
            span,
        )
    }
}

/// The variable declaration a top-level statement is or exports.
fn variable_declaration<'s, 'a>(
    statement: &'s Statement<'a>,
) -> Option<(&'s VariableDeclaration<'a>, bool)> {
    match statement {
        Statement::VariableDeclaration(d) => Some((d, false)),
        Statement::ExportDeclaration(export) => match &export.declaration {
            Declaration::VariableDeclaration(d) => Some((d, true)),
            _ => None,
        },
        _ => None,
    }
}

/// The errors of the scripts' declarations: an instance name that a module import declares,
/// then runes' placement in runes mode or their calls outside it.
pub(super) fn declaration_errors(
    component: &Component,
    resolution: &Resolution,
    runes: bool,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    module_import_conflicts(component, resolution, out);
    if runes {
        rune_placement(component, resolution, out);
    } else {
        legacy_rune_calls(component, resolution, out);
    }
}

/// `declaration_duplicate_module_import`: a top-level instance declarator that binds a name a
/// `<script module>` import declares.
fn module_import_conflicts(
    component: &Component,
    resolution: &Resolution,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let (Some(_), Some(instance)) = (&component.module, &component.instance) else {
        return;
    };
    let scoping = resolution.scoping();
    let module = scoping.root_scope_id();
    // Upstream erases type imports before it analyzes; oxc flags those apart.
    let imported = |name: &str| {
        scoping
            .get_binding(module, name.into())
            .is_some_and(|s| scoping.symbol_flags(s).contains(SymbolFlags::Import))
    };
    for statement in &component.javascript.get_program(instance.program).body {
        let Some((declaration, _)) = variable_declaration(statement) else {
            continue;
        };
        for declarator in &declaration.declarations {
            let conflicts = declarator
                .id
                .any_binding_identifiers(&mut |id| imported(id.name.as_str()));
            if conflicts {
                let at = document_span(oxc_span::GetSpan::span(&declarator.id));
                let raised = Raised {
                    phase: Phase::Walk,
                    section: Section::Instance,
                    at: at.start_offset,
                };
                let message = "Cannot declare a variable with the same name as an import from \
                    `<script module>`";
                out.push((
                    raised,
                    error("declaration_duplicate_module_import", message, at),
                ));
            }
        }
    }
}

/// Runes mode's `legacy_export_invalid`, `props_duplicate` and `props_invalid_placement`.
fn rune_placement(
    component: &Component,
    resolution: &Resolution,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let javascript = &component.javascript;
    let walk = |section, at| Raised {
        phase: Phase::Walk,
        section,
        at,
    };
    for (section, script) in [
        (Section::Module, &component.module),
        (Section::Instance, &component.instance),
    ] {
        let Some(script) = script else {
            continue;
        };
        let program = javascript.get_program(script.program);
        // The declarators `$props()` may initialize: the instance's own.
        let mut placed: FxHashSet<oxc_span::Span> = FxHashSet::default();
        for statement in &program.body {
            let Some((declaration, exported)) = variable_declaration(statement) else {
                continue;
            };
            if section == Section::Instance {
                placed.extend(
                    declaration
                        .declarations
                        .iter()
                        .filter_map(|d| d.init.as_ref())
                        .map(oxc_span::GetSpan::span),
                );
            }
            if section == Section::Instance
                && exported
                && declaration.kind == VariableDeclarationKind::Let
            {
                let at = document_span(oxc_span::GetSpan::span(statement));
                let found = error(
                    "legacy_export_invalid",
                    "Cannot use `export let` in runes mode — use `$props()` instead",
                    at,
                );
                // Upstream checks an export after its declaration, so errors inside it come first.
                out.push((walk(section, at.end_offset - 1), found));
            }
        }
        for (i, call) in props_calls(resolution, program).into_iter().enumerate() {
            let at = document_span(call);
            if i > 0 {
                let found = error(
                    "props_duplicate",
                    "Cannot use `$props()` more than once",
                    at,
                );
                out.push((walk(section, at.start_offset), found));
            }
            if !placed.contains(&call) {
                let found = error(
                    "props_invalid_placement",
                    "`$props()` can only be used at the top level of components as a variable \
                        declaration initializer",
                    at,
                );
                out.push((walk(section, at.start_offset), found));
            }
        }
    }
}

/// `rune_invalid_usage`: outside runes mode, a declarator whose initializer calls `$state`,
/// `$derived` or `$props` that is not a store subscription, such as a parameter of that name.
fn legacy_rune_calls(
    component: &Component,
    resolution: &Resolution,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    struct Calls<'r> {
        resolution: &'r Resolution,
        section: Section,
        out: &'r mut Vec<(Raised, Diagnostic)>,
    }
    impl<'a> Visit<'a> for Calls<'_> {
        fn visit_variable_declarator(&mut self, it: &oxc_ast::ast::VariableDeclarator<'a>) {
            if let Some(Expression::CallExpression(call)) = &it.init
                && let Expression::Identifier(callee) = &call.callee
                && let name = callee.name.as_str()
                && matches!(name, "$state" | "$derived" | "$props")
                && (self.resolution.symbol(callee).is_some()
                    || !self.resolution.is_store_subscription(name))
            {
                let at = document_span(call.span);
                let raised = Raised {
                    phase: Phase::Walk,
                    section: self.section,
                    at: at.start_offset,
                };
                let message = format!("Cannot use `{name}` rune in non-runes mode");
                self.out
                    .push((raised, error("rune_invalid_usage", &message, at)));
            }
            walk::walk_variable_declarator(self, it);
        }
    }
    for (section, script) in [
        (Section::Module, &component.module),
        (Section::Instance, &component.instance),
    ] {
        let Some(script) = script else {
            continue;
        };
        let mut calls = Calls {
            resolution,
            section,
            out,
        };
        calls.visit_program(component.javascript.get_program(script.program));
    }
}

/// Where the `$props()` calls of `program` are, in source order.
fn props_calls(resolution: &Resolution, program: &Program<'_>) -> Vec<oxc_span::Span> {
    struct Calls<'r> {
        resolution: &'r Resolution,
        out: Vec<oxc_span::Span>,
    }
    impl<'a> Visit<'a> for Calls<'_> {
        fn visit_expression(&mut self, it: &Expression<'a>) {
            if self
                .resolution
                .rune(it)
                .is_some_and(|(rune, _)| rune == "$props")
            {
                self.out.push(oxc_span::GetSpan::span(it));
            }
            walk::walk_expression(self, it);
        }
    }
    // A call is `$props()` only through a global reference or an ambient declaration of that
    // name, which most components lack, so the walk is skipped without either.
    let scoping = resolution.scoping();
    if !scoping.root_unresolved_references().contains_key("$props")
        && !scoping.symbol_names().any(|name| name == "$props")
    {
        return Vec::new();
    }
    let mut calls = Calls {
        resolution,
        out: Vec::new(),
    };
    calls.visit_program(program);
    calls.out
}

/// `custom_element_props_identifier`: a custom element whose `$props()` the compiler cannot
/// read the names of, without `customElement.props`.
pub(super) fn custom_element(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    out: &mut Found,
) {
    let Some(custom) = component.svelte_option(source, "customElement") else {
        return;
    };
    let javascript = &component.javascript;
    let names_props = match custom.value {
        AttributeValue::Parts(parts) => match component.parts(parts) {
            [Part::Expression { expression, .. }] => match javascript.get_expression(*expression) {
                Expression::ObjectExpression(object) => object.properties.iter().any(|p| {
                    let ObjectPropertyKind::ObjectProperty(p) = p else {
                        return false;
                    };
                    !p.computed
                        && match &p.key {
                            PropertyKey::StaticIdentifier(key) => key.name == "props",
                            PropertyKey::StringLiteral(key) => key.value == "props",
                            _ => false,
                        }
                }),
                _ => false,
            },
            _ => false,
        },
        AttributeValue::True => false,
    };
    let Some(instance) = &component.instance else {
        return;
    };
    if names_props {
        return;
    }
    for statement in &javascript.get_program(instance.program).body {
        let Some((declaration, _)) = variable_declaration(statement) else {
            continue;
        };
        for declarator in &declaration.declarations {
            let Some(initializer) = &declarator.init else {
                continue;
            };
            let is_props = resolution
                .rune(initializer)
                .is_some_and(|(rune, _)| rune == "$props");
            if !is_props {
                continue;
            }
            let at = match &declarator.id {
                BindingPattern::BindingIdentifier(identifier) => Some(identifier.span),
                BindingPattern::ObjectPattern(object) => object.rest.as_ref().map(|rest| rest.span),
                _ => None,
            };
            if let Some(at) = at {
                out.push(Stage::Walk(Section::Instance), declarator.span.start, warning(
                    "custom_element_props_identifier",
                    "Using a rest element or a non-destructured declaration with `$props()` means \
                        that Svelte can't infer what properties to expose when creating a custom \
                        element. Consider destructuring all the props or explicitly specifying the \
                        `customElement.props` option.",
                    document_span(at),
                ));
            }
        }
    }
}

#[cfg(test)]
mod tests;
