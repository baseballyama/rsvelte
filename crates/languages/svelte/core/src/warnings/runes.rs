//! Runes mode, and the errors of `$` names and of `$props()` that it decides.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::semantic::resolve::{RUNES, Resolution, rune_call};
use rsvelte_svelte_syntax::syntax_tree::{AttributeValue, Component, Part, Script, TemplateNode};
use rsvelte_typescript::scope::DeclarationKind;
use rsvelte_typescript::syntax_tree::{Kind, TypeScriptFeature, flag};
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};
use rustc_hash::FxHashSet;

use super::{Phase, Raised, Section, error, warning};

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
                    if matches!(component.javascript.kind(*expression), Kind::Boolean(false))
            ),
        };
    }
    if let Some(forced) = forced {
        return forced;
    }
    if !awaits.is_empty() {
        return true;
    }
    let stores = stores(component, resolution);
    resolution.sem.references.iter().any(|reference| {
        reference.binding.is_none() && {
            let name = component.javascript.name(reference.node);
            RUNES
                .iter()
                .any(|rune| rune.split('.').next() == Some(name))
                && !stores.contains(&name[1..])
        }
    })
}

/// The top-level names whose `$name` is a store subscription rather than a rune: a declaration
/// not initialized by a rune, or a prop other than `props`.
pub(super) fn stores<'a>(component: &'a Component, resolution: &Resolution) -> FxHashSet<&'a str> {
    let javascript = &component.javascript;
    let sem = &resolution.sem;
    let programs: Vec<NodeIdentifier> = scripts(component).map(|s| s.program).collect();
    sem.bindings
        .iter()
        .filter(|binding| programs.contains(&sem.scopes[binding.scope].node))
        .filter_map(|binding| {
            let name = javascript.name(binding.node);
            let rune = binding
                .initializer(javascript)
                .and_then(|init| rune_call(javascript, init))
                .map(|(rune, _)| rune);
            let store = match rune {
                None => {
                    // `import { derived } from 'svelte/store'` beside `$derived(…)` is no subscription.
                    !(binding.kind == DeclarationKind::Import && name == "derived")
                }
                Some("$props") => name != "props",
                Some(_) => false,
            };
            store.then_some(name)
        })
        .collect()
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

pub(super) fn scripts(component: &Component) -> impl Iterator<Item = &Script> {
    component.module.iter().chain(&component.instance)
}

/// `dollar_prefix_invalid` and `dollar_binding_invalid`: a `$` name a script declares. Creating
/// the scopes rejects one outside functions of the instance or nested at most one function deep
/// in the module; in runes mode, the walk rejects a variable or function at any depth.
pub(super) fn dollar_names(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    runes: bool,
    out: &mut Vec<(Raised, Diagnostic)>,
) {
    let sem = &resolution.sem;
    let javascript = &component.javascript;
    let type_only = type_only_imports(component);
    let mut found: Vec<(Raised, Span)> = Vec::new();
    for binding in &sem.bindings {
        if matches!(binding.kind, DeclarationKind::Param | DeclarationKind::Host)
            || !javascript.name(binding.node).starts_with('$')
            || binding.declaration.is_some_and(|d| type_only.contains(&d))
        {
            continue;
        }
        let Some(span) = javascript.source_location(binding.node).span() else {
            continue;
        };
        let section = Section::of(component, span.start_offset);
        let program = match section {
            Section::Module => component.module.as_ref(),
            Section::Instance => component.instance.as_ref(),
            Section::Template => None,
        };
        let Some(program) = program.map(|s| s.program) else {
            continue;
        };
        // A class expression's own name is not in the compiler's scopes.
        if matches!(
            javascript.kind(sem.scopes[binding.scope].node),
            Kind::Class(_)
        ) {
            continue;
        }
        let mut depth = u32::from(section == Section::Instance);
        let mut scope = binding.scope;
        while sem.scopes[scope].node != program {
            depth += u32::from(sem.scopes[scope].function);
            let Some(parent) = sem.scopes[scope].parent else {
                break;
            };
            scope = parent;
        }
        let declared = binding.kind == DeclarationKind::Function
            || binding
                .declaration
                .is_some_and(|d| matches!(javascript.kind(d), Kind::Declarator { .. }));
        let phase = if depth <= 1 {
            Phase::Scopes
        } else if runes && declared {
            Phase::Walk
        } else {
            continue;
        };
        let raised = Raised {
            phase,
            section,
            at: span.start_offset,
        };
        found.push((raised, span));
    }
    enum_names(component, source, &mut found);
    for (raised, span) in found {
        let error = if span.text(source) == "$" {
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
        };
        out.push((raised, error));
    }
}

/// The specifiers of `import type`, which TypeScript erases.
pub(super) fn type_only_imports(component: &Component) -> FxHashSet<NodeIdentifier> {
    let javascript = &component.javascript;
    let mut type_only: FxHashSet<NodeIdentifier> = FxHashSet::default();
    for script in scripts(component) {
        let Kind::Program(statements) = javascript.kind(script.program) else {
            continue;
        };
        for &statement in statements {
            if let Kind::Import {
                specifiers,
                type_only: true,
                ..
            } = javascript.kind(statement)
            {
                type_only.extend(specifiers);
            }
        }
    }
    type_only
}

/// `$` names of enums, which are variables once TypeScript is erased; the tree keeps an enum as
/// a runtime feature.
pub(super) fn enum_names(component: &Component, source: &str, found: &mut Vec<(Raised, Span)>) {
    let javascript = &component.javascript;
    for feature in &javascript.typescript_runtime {
        if feature.feature != TypeScriptFeature::Enum {
            continue;
        }
        let name = javascript
            .tokens
            .from_offset(feature.span.start_offset)
            .iter()
            .take_while(|t| t.span.end_offset <= feature.span.end_offset)
            .skip_while(|t| t.span.text(source) != "enum")
            .nth(1);
        if let Some(name) = name
            && name.span.text(source).starts_with('$')
        {
            let raised = Raised {
                phase: Phase::Scopes,
                section: Section::of(component, name.span.start_offset),
                at: name.span.start_offset,
            };
            found.push((raised, name.span));
        }
    }
}

/// Runes mode's `legacy_export_invalid`, `props_duplicate` and `props_invalid_placement`.
pub(super) fn rune_placement(component: &Component, out: &mut Vec<(Raised, Diagnostic)>) {
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
        let Kind::Program(statements) = javascript.kind(script.program) else {
            continue;
        };
        // The declarators `$props()` may initialize: the instance's own.
        let mut placed: FxHashSet<NodeIdentifier> = FxHashSet::default();
        for &statement in statements {
            let declaration = match javascript.kind(statement) {
                Kind::ExportNamed(declaration) => declaration,
                _ => statement,
            };
            let Kind::VariableDeclaration { kind, declarations } = javascript.kind(declaration)
            else {
                continue;
            };
            if section == Section::Instance {
                for &declarator in declarations {
                    if let Kind::Declarator {
                        initializer: Some(init),
                        ..
                    } = javascript.kind(declarator)
                    {
                        placed.insert(init);
                    }
                }
            }
            if section == Section::Instance
                && declaration != statement
                && kind & 3 == flag::LET
                && let Some(span) = javascript.source_location(statement).span()
            {
                let found = error(
                    "legacy_export_invalid",
                    "Cannot use `export let` in runes mode — use `$props()` instead",
                    span,
                );
                out.push((walk(section, span.start_offset), found));
            }
        }
        let mut calls = Vec::new();
        props_calls(javascript, script.program, &mut calls);
        for (i, call) in calls.into_iter().enumerate() {
            let Some(span) = javascript.source_location(call).span() else {
                continue;
            };
            if i > 0 {
                let found = error(
                    "props_duplicate",
                    "Cannot use `$props()` more than once",
                    span,
                );
                out.push((walk(section, span.start_offset), found));
            }
            if !placed.contains(&call) {
                let found = error(
                    "props_invalid_placement",
                    "`$props()` can only be used at the top level of components as a variable declaration initializer",
                    span,
                );
                out.push((walk(section, span.start_offset), found));
            }
        }
    }
}

/// The `$props()` calls under `node`, in source order.
pub(super) fn props_calls(
    javascript: &SyntaxTree,
    node: NodeIdentifier,
    out: &mut Vec<NodeIdentifier>,
) {
    if rune_call(javascript, node).is_some_and(|(rune, _)| rune == "$props") {
        out.push(node);
    }
    javascript.for_each_child(node, |child| props_calls(javascript, child, out));
}

/// `custom_element_props_identifier`: a custom element whose `$props()` the compiler cannot
/// read the names of, without `customElement.props`.
pub(super) fn custom_element(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    out: &mut Vec<Diagnostic>,
) {
    let Some(custom) = svelte_option(component, source, "customElement") else {
        return;
    };
    let javascript = &component.javascript;
    let names_props = match custom {
        AttributeValue::Parts(parts) => match component.parts(parts) {
            [Part::Expression { expression, .. }] => match javascript.kind(*expression) {
                Kind::Object(properties) => properties.iter().any(|&p| {
                    let Kind::Property {
                        key,
                        computed: false,
                        ..
                    } = javascript.kind(p)
                    else {
                        return false;
                    };
                    match javascript.kind(key) {
                        Kind::Identifier(_) => javascript.name(key) == "props",
                        Kind::String => javascript.str_value(key, source) == "props",
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
    let Kind::Program(statements) = javascript.kind(instance.program) else {
        return;
    };
    for &statement in statements {
        let statement = match javascript.kind(statement) {
            Kind::ExportNamed(declaration) => declaration,
            _ => statement,
        };
        let Kind::VariableDeclaration { declarations, .. } = javascript.kind(statement) else {
            continue;
        };
        for &declarator in declarations {
            let Kind::Declarator {
                identifier,
                initializer: Some(initializer),
            } = javascript.kind(declarator)
            else {
                continue;
            };
            let Kind::Call { callee, .. } = javascript.kind(initializer) else {
                continue;
            };
            let is_props =
                javascript.name(callee) == "$props" && resolution.sem.binding_of(callee).is_none();
            if !is_props {
                continue;
            }
            let at = match javascript.kind(identifier) {
                Kind::Identifier(_) => Some(identifier),
                Kind::ObjectPattern(properties) => properties
                    .iter()
                    .copied()
                    .find(|&p| matches!(javascript.kind(p), Kind::Rest(_))),
                _ => None,
            };
            if let Some(span) = at.and_then(|at| javascript.source_location(at).span()) {
                out.push(warning(
                    "custom_element_props_identifier",
                    "Using a rest element or a non-destructured declaration with `$props()` means that Svelte can't infer what properties to expose when creating a custom element. Consider destructuring all the props or explicitly specifying the `customElement.props` option.",
                    span,
                ));
            }
        }
    }
}
