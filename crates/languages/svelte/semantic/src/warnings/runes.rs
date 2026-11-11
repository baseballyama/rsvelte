//! Runes mode, and the errors of `$` names and of `$props()` that it decides.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingPattern, Declaration, Expression, ObjectPropertyKind, Program, PropertyKey, Statement,
    VariableDeclaration, VariableDeclarationKind,
};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::SymbolFlags;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Component, Part, TemplateNode};
use rustc_hash::FxHashSet;

use super::found::{Found, Stage};
use super::{Phase, Raised, Section, error, span, warning};
use crate::resolve::{RUNES, Resolution};
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};

/// Svelte's runes mode: `<svelte:options runes>`, or else a top-level `await` or a reference to
/// a rune that is not a store subscription.
pub(super) fn runes(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    awaits: &[Span],
    forced: Option<bool>,
) -> bool {
    if let Some(value) = svelte_option(component, source, "runes") {
        return match value {
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
        .any(|name| RUNES.contains(&name) && !resolution.is_store_subscription(name))
}

/// The value of attribute `name` of `<svelte:options>`.
pub(crate) fn svelte_option(
    component: &Component,
    source: &str,
    name: &str,
) -> Option<AttributeValue> {
    component
        .children(component.root)
        .iter()
        .find_map(|&child| {
            let TemplateNode::Element {
                name: tag,
                attributes,
                ..
            } = *component.node(child)
            else {
                return None;
            };
            if tag.text(source) != "svelte:options" {
                return None;
            }
            component
                .attributes(attributes)
                .iter()
                .find(|a| a.name.text(source) == name)
                .map(|a| a.value)
        })
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
        let declaration = resolution.declaration(symbol);
        let declaration_node = scoping.symbol_declaration(symbol);
        let ancestors = || nodes.ancestor_kinds(declaration_node);
        // A parameter's symbol is declared at the parameter node itself.
        let is_parameter = std::iter::once(nodes.kind(declaration_node))
            .chain(ancestors())
            .any(|kind| {
                matches!(
                    kind,
                    AstKind::FormalParameter(_) | AstKind::FormalParameterRest(_)
                )
            });
        let type_only = flags.contains(SymbolFlags::Import)
            && ancestors().any(
                |kind| matches!(kind, AstKind::ImportDeclaration(d) if d.import_kind.is_type()),
            );
        if is_parameter || type_only {
            continue;
        }
        let at = span(scoping.symbol_span(symbol));
        let section = if holds(module, at.start_offset) {
            Section::Module
        } else if holds(instance, at.start_offset) {
            Section::Instance
        } else {
            Section::Template
        };
        let program = match section {
            Section::Module => scoping.root_scope_id(),
            Section::Instance => resolution.instance_scope(),
            Section::Template => continue,
        };
        let scope = scoping.symbol_scope_id(symbol);
        // A class expression's own name is not in the compiler's scopes.
        if matches!(nodes.kind(scoping.get_node_id(scope)), AstKind::Class(_)) {
            continue;
        }
        let phase = if flags.intersects(SymbolFlags::Enum) {
            Phase::Scopes
        } else {
            let mut depth = u32::from(section == Section::Instance);
            let mut scope = scope;
            while scope != program {
                depth += u32::from(resolution.is_function_scope(scope));
                let Some(parent) = scoping.scope_parent_id(scope) else {
                    break;
                };
                scope = parent;
            }
            let declared = flags.contains(SymbolFlags::Function)
                || matches!(declaration, AstKind::VariableDeclarator(_));
            if depth <= 1 {
                Phase::Scopes
            } else if runes && declared {
                Phase::Walk
            } else {
                continue;
            }
        };
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

/// Runes mode's `legacy_export_invalid`, `props_duplicate` and `props_invalid_placement`.
pub(super) fn rune_placement(
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
                let at = span(oxc_span::GetSpan::span(statement));
                let found = error(
                    "legacy_export_invalid",
                    "Cannot use `export let` in runes mode — use `$props()` instead",
                    at,
                );
                out.push((walk(section, at.start_offset), found));
            }
        }
        for (i, call) in props_calls(resolution, program).into_iter().enumerate() {
            let at = span(call);
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
                    "`$props()` can only be used at the top level of components as a variable declaration initializer",
                    at,
                );
                out.push((walk(section, at.start_offset), found));
            }
        }
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
    let Some(custom) = svelte_option(component, source, "customElement") else {
        return;
    };
    let javascript = &component.javascript;
    let names_props = match custom {
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
                    "Using a rest element or a non-destructured declaration with `$props()` means that Svelte can't infer what properties to expose when creating a custom element. Consider destructuring all the props or explicitly specifying the `customElement.props` option.",
                    span(at),
                ));
            }
        }
    }
}
