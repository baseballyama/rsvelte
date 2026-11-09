//! What the compiler warns about, and the analysis errors it raises, without generating code.
//!
//! A subset of Svelte 5's: [`CompileWarnings::CODES`] names what is checked, so a consumer can
//! tell "not warned" from "not checked". `svelte-ignore` comments are not applied here.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet::syntax_tree::{ComplexSelector, Rule, RuleKind, Simple};
use rsvelte_svelte_semantic::semantic::analyze::Analysis;
use rsvelte_svelte_semantic::semantic::resolve::{
    RUNES, Resolution, for_each_pattern_identifier, rune_call,
};
use rsvelte_svelte_syntax::names::is_component_name;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, Range, Script, TemplateNode, decode_attribute,
};
use rsvelte_typescript::scope::BindingIdentifier;
use rsvelte_typescript::scope::DeclarationKind;
use rsvelte_typescript::syntax_tree::{Class, Control, Kind, TypeScriptFeature, flag};
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};
use rustc_hash::{FxHashMap, FxHashSet};

mod a11y;

#[derive(Debug, Default)]
pub struct CompileWarnings {
    /// In the order the compiler emits them.
    pub warnings: Vec<Diagnostic>,
    /// Analysis errors, with when the compiler raises each; it stops at the first.
    pub errors: Vec<(Raised, Diagnostic)>,
    /// The `await`s that are `experimental_async` errors unless that option is on.
    pub awaits: Vec<Span>,
}

/// When the compiler raises an error: it creates every scope before it walks any tree, and it
/// handles the module script, then the instance script, then the template.
#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub struct Raised {
    pub phase: Phase,
    pub section: Section,
    /// Where the compiler's walk is when it raises the error.
    pub at: u32,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Phase {
    Scopes,
    Walk,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum Section {
    Module,
    Instance,
    Template,
}

impl Section {
    /// The part of `component` that holds `offset`.
    #[must_use]
    pub fn of(component: &Component, offset: u32) -> Self {
        let holds = |script: &Option<Script>| {
            script
                .as_ref()
                .is_some_and(|s| s.span.start_offset <= offset && offset < s.span.end_offset)
        };
        if holds(&component.module) {
            Self::Module
        } else if holds(&component.instance) {
            Self::Instance
        } else {
            Self::Template
        }
    }
}

impl CompileWarnings {
    /// The error the compiler stops at; an `await` is one only without `experimental.async`.
    #[must_use]
    pub fn first_error(
        &self,
        component: &Component,
        experimental_async: bool,
    ) -> Option<Diagnostic> {
        let awaits = self
            .awaits
            .iter()
            .filter(|_| !experimental_async)
            .map(|&span| {
                let raised = Raised {
                    phase: Phase::Walk,
                    section: Section::of(component, span.start_offset),
                    at: span.start_offset,
                };
                (raised, Err(span))
            });
        let (_, first) = self
            .errors
            .iter()
            .map(|(raised, error)| (*raised, Ok(error)))
            .chain(awaits)
            .min_by_key(|(raised, _)| *raised)?;
        Some(first.map_or_else(
            |span| {
                error(
                    "experimental_async",
                    "Cannot use `await` in deriveds and template expressions, or at the top level of a component, unless the `experimental.async` compiler option is `true`",
                    span,
                )
            },
            Clone::clone,
        ))
    }
}

impl CompileWarnings {
    /// The warning codes this module checks.
    pub const CODES: &[&str] = &[
        "a11y_accesskey",
        "a11y_autofocus",
        "a11y_label_has_associated_control",
        "a11y_misplaced_scope",
        "a11y_missing_attribute",
        "a11y_no_noninteractive_tabindex",
        "a11y_positive_tabindex",
        "block_empty",
        "css_unused_selector",
        "custom_element_props_identifier",
        "export_let_unused",
        "svelte_element_invalid_this",
    ];

    /// Every code Svelte 5.57.0 warns with, the runtime warnings `svelte-ignore` also names
    /// included: a `svelte-ignore` of another code ignores nothing.
    pub const SVELTE_CODES: &[&str] = &[
        "a11y_accesskey",
        "a11y_aria_activedescendant_has_tabindex",
        "a11y_aria_attributes",
        "a11y_autocomplete_valid",
        "a11y_autofocus",
        "a11y_click_events_have_key_events",
        "a11y_consider_explicit_label",
        "a11y_distracting_elements",
        "a11y_figcaption_index",
        "a11y_figcaption_parent",
        "a11y_hidden",
        "a11y_img_redundant_alt",
        "a11y_incorrect_aria_attribute_type",
        "a11y_incorrect_aria_attribute_type_boolean",
        "a11y_incorrect_aria_attribute_type_id",
        "a11y_incorrect_aria_attribute_type_idlist",
        "a11y_incorrect_aria_attribute_type_integer",
        "a11y_incorrect_aria_attribute_type_token",
        "a11y_incorrect_aria_attribute_type_tokenlist",
        "a11y_incorrect_aria_attribute_type_tristate",
        "a11y_interactive_supports_focus",
        "a11y_invalid_attribute",
        "a11y_label_has_associated_control",
        "a11y_media_has_caption",
        "a11y_misplaced_role",
        "a11y_misplaced_scope",
        "a11y_missing_attribute",
        "a11y_missing_content",
        "a11y_mouse_events_have_key_events",
        "a11y_no_abstract_role",
        "a11y_no_interactive_element_to_noninteractive_role",
        "a11y_no_noninteractive_element_interactions",
        "a11y_no_noninteractive_element_to_interactive_role",
        "a11y_no_noninteractive_tabindex",
        "a11y_no_redundant_roles",
        "a11y_no_static_element_interactions",
        "a11y_positive_tabindex",
        "a11y_role_has_required_aria_props",
        "a11y_role_supports_aria_props",
        "a11y_role_supports_aria_props_implicit",
        "a11y_unknown_aria_attribute",
        "a11y_unknown_role",
        "bidirectional_control_characters",
        "legacy_code",
        "unknown_code",
        "options_deprecated_accessors",
        "options_deprecated_immutable",
        "options_missing_custom_element",
        "options_removed_enable_sourcemap",
        "options_removed_hydratable",
        "options_removed_loop_guard_timeout",
        "options_renamed_ssr_dom",
        "custom_element_props_identifier",
        "export_let_unused",
        "legacy_component_creation",
        "non_reactive_update",
        "perf_avoid_inline_class",
        "perf_avoid_nested_class",
        "reactive_declaration_invalid_placement",
        "reactive_declaration_module_script_dependency",
        "state_referenced_locally",
        "store_rune_conflict",
        "css_unused_selector",
        "attribute_avoid_is",
        "attribute_global_event_reference",
        "attribute_illegal_colon",
        "attribute_invalid_property_name",
        "attribute_quoted",
        "bind_invalid_each_rest",
        "block_empty",
        "component_name_lowercase",
        "element_implicitly_closed",
        "element_invalid_self_closing_tag",
        "event_directive_deprecated",
        "node_invalid_placement_ssr",
        "script_context_deprecated",
        "script_unknown_attribute",
        "slot_element_deprecated",
        "svelte_component_deprecated",
        "svelte_element_invalid_this",
        "svelte_self_deprecated",
        "await_waterfall",
        "await_reactivity_loss",
        "state_snapshot_uncloneable",
        "binding_property_non_reactive",
        "hydration_attribute_changed",
        "hydration_html_changed",
        "ownership_invalid_binding",
        "ownership_invalid_mutation",
    ];
}

/// JavaScript's `\s`, which `trim()` removes.
#[must_use]
pub const fn is_js_whitespace(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{b}' | '\u{c}' | '\r' | ' ' | '\u{a0}' | '\u{1680}' | '\u{2000}'
            ..='\u{200a}'
                | '\u{2028}'
                | '\u{2029}'
                | '\u{202f}'
                | '\u{205f}'
                | '\u{3000}'
                | '\u{feff}'
    )
}

fn warning(code: &'static str, message: &str, span: Span) -> Diagnostic {
    let message = format!("{message}\nhttps://svelte.dev/e/{code}");
    Diagnostic::warning(code, message, span)
}

fn error(code: &'static str, message: &str, span: Span) -> Diagnostic {
    Diagnostic::error(
        code,
        format!("{message}\nhttps://svelte.dev/e/{code}"),
        span,
    )
}

/// The warnings of `component`; `analysis` is needed only for its style sheet.
#[must_use]
pub fn warnings(
    component: &Component,
    resolution: &Resolution,
    analysis: Option<&Analysis>,
    source: &str,
) -> CompileWarnings {
    let mut out = CompileWarnings::default();
    let javascript = &component.javascript;
    if let Some(instance) = &component.instance {
        top_level_awaits(javascript, instance.program, false, &mut out.awaits);
    }
    for &expression in &component.template_expressions {
        top_level_awaits(javascript, expression, false, &mut out.awaits);
    }
    let runes = runes(component, resolution, source, &out.awaits);
    dollar_names(component, resolution, source, runes, &mut out.errors);
    custom_element(component, resolution, source, &mut out.warnings);
    Template {
        component,
        source,
        out: &mut out.warnings,
        errors: &mut out.errors,
        shadow_root: false,
    }
    .fragment(component.root, a11y::Parent::None);
    if !runes {
        unused_exports(component, resolution, source, &mut out.warnings);
    }
    if let (Some(Ok(sheet)), Some(analysis)) =
        (component.style.as_ref().map(|s| &s.sheet), analysis)
    {
        unused_selectors(&sheet.rules, analysis, source, &mut out.warnings);
    }
    out
}

/// Svelte's runes mode: `<svelte:options runes>`, or else a top-level `await` or a reference to
/// a rune that is not a store subscription.
fn runes(component: &Component, resolution: &Resolution, source: &str, awaits: &[Span]) -> bool {
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
fn stores<'a>(component: &'a Component, resolution: &Resolution) -> FxHashSet<&'a str> {
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
fn svelte_option(component: &Component, source: &str, name: &str) -> Option<AttributeValue> {
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

/// `await` at the top level of the instance script or of a template expression.
fn top_level_awaits(
    javascript: &SyntaxTree,
    node: NodeIdentifier,
    in_function: bool,
    out: &mut Vec<Span>,
) {
    let in_function = in_function
        || matches!(
            javascript.kind(node),
            Kind::Function { .. } | Kind::Arrow { .. } | Kind::Class(Class::Method { .. })
        );
    if !in_function
        && matches!(javascript.kind(node), Kind::Await(_))
        && let Some(span) = javascript.source_location(node).span()
    {
        out.push(span);
    }
    javascript.for_each_child(node, |child| {
        top_level_awaits(javascript, child, in_function, out);
    });
}

fn scripts(component: &Component) -> impl Iterator<Item = &Script> {
    component.module.iter().chain(&component.instance)
}

/// `dollar_prefix_invalid` and `dollar_binding_invalid`: a `$` name a script declares. Creating
/// the scopes rejects one outside functions of the instance or nested at most one function deep
/// in the module; in runes mode, the walk rejects a variable or function at any depth.
fn dollar_names(
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
fn type_only_imports(component: &Component) -> FxHashSet<NodeIdentifier> {
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
fn enum_names(component: &Component, source: &str, found: &mut Vec<(Raised, Span)>) {
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

/// `custom_element_props_identifier`: a custom element whose `$props()` the compiler cannot
/// read the names of, without `customElement.props`.
fn custom_element(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    out: &mut Vec<Diagnostic>,
) {
    let custom = svelte_option(component, source, "customElement")
        .or_else(|| svelte_option(component, source, "tag"));
    let Some(custom) = custom else {
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

/// `export_let_unused`: in legacy mode, an `export let` nothing reads or writes.
fn unused_exports(
    component: &Component,
    resolution: &Resolution,
    source: &str,
    out: &mut Vec<Diagnostic>,
) {
    let Some(instance) = &component.instance else {
        return;
    };
    let javascript = &component.javascript;
    let sem = &resolution.sem;
    let Kind::Program(statements) = javascript.kind(instance.program) else {
        return;
    };
    // Legacy props: `export let` and `export var`, and a `let` or `var` an `export { … }` names.
    let mut props: Vec<BindingIdentifier> = Vec::new();
    let mut specifiers: FxHashSet<NodeIdentifier> = FxHashSet::default();
    for &statement in statements {
        match javascript.kind(statement) {
            Kind::ExportNamed(declaration) => {
                let Kind::VariableDeclaration { kind, declarations } = javascript.kind(declaration)
                else {
                    continue;
                };
                if kind & 3 == flag::CONST {
                    continue;
                }
                for &declarator in declarations {
                    if let Kind::Declarator { identifier, .. } = javascript.kind(declarator) {
                        for_each_pattern_identifier(javascript, identifier, &mut |name| {
                            props.extend(sem.binding_of(name));
                        });
                    }
                }
            }
            Kind::Control(Control::ExportList {
                specifiers: list,
                source: None,
            }) => {
                for &specifier in list {
                    let Kind::Control(Control::ExportSpecifier { local, .. }) =
                        javascript.kind(specifier)
                    else {
                        continue;
                    };
                    specifiers.insert(local);
                    if let Some(binding) = sem.binding_of(local)
                        && sem.scopes[sem.bindings[binding].scope].node == instance.program
                        && matches!(
                            sem.bindings[binding].kind,
                            DeclarationKind::Let | DeclarationKind::Variable
                        )
                        && sem.bindings[binding].declaration.is_some()
                    {
                        props.push(binding);
                    }
                }
            }
            _ => {}
        }
    }
    // Declaration order, as the compiler walks the instance scope.
    props.sort_unstable();
    props.dedup();
    let subscribed: FxHashSet<&str> = sem
        .references
        .iter()
        .filter(|r| r.binding.is_none())
        .filter_map(|r| javascript.name(r.node).strip_prefix('$'))
        .collect();
    let shadows = let_shadows(component, source);
    for binding in props {
        let node = sem.bindings[binding].node;
        let text = javascript.name(node);
        let used = sem.references_to(binding).any(|r| {
            r.node != node
                && !specifiers.contains(&r.node)
                && !javascript.source_location(r.node).span().is_some_and(|at| {
                    shadows.get(text).is_some_and(|spans| {
                        spans.iter().any(|s| {
                            s.start_offset <= at.start_offset && at.end_offset <= s.end_offset
                        })
                    })
                })
        });
        if !used
            && !subscribed.contains(text)
            && let Some(span) = javascript.source_location(node).span()
        {
            out.push(warning(
                "export_let_unused",
                &format!(
                    "Component has unused export property '{text}'. If it is for external reference only, please consider using `export const {text}`"
                ),
                span,
            ));
        }
    }
}

/// The children of each element with a shorthand `let:name`, by the name it declares there.
fn let_shadows<'a>(component: &Component, source: &'a str) -> FxHashMap<&'a str, Vec<Span>> {
    let mut out: FxHashMap<&str, Vec<Span>> = FxHashMap::default();
    for node in &component.nodes {
        let TemplateNode::Element {
            attributes,
            children,
            span,
            ..
        } = *node
        else {
            continue;
        };
        for attribute in component.attributes(attributes) {
            if attribute.kind == AttributeKind::Let
                && matches!(attribute.value, AttributeValue::True)
                && let Some(name) = attribute.directive_name(&component.modifiers)
            {
                let inside = component.children(children).first().map_or(span, |&first| {
                    Span::new(component.node(first).span().start_offset, span.end_offset)
                });
                out.entry(name.text(source)).or_default().push(inside);
            }
        }
    }
    out
}

/// `css_unused_selector` (`css-warn.js`): every selector no element matched, outside
/// `@keyframes` and `:global { … }` blocks.
fn unused_selectors(rules: &[Rule], analysis: &Analysis, source: &str, out: &mut Vec<Diagnostic>) {
    for rule in rules {
        match &rule.kind {
            RuleKind::Keyframe { .. } => {}
            RuleKind::At { name, .. } => {
                let name = name.text(source).trim_start_matches('@');
                let unprefixed = ["-webkit-", "-moz-", "-o-", "-ms-"]
                    .iter()
                    .find_map(|p| name.strip_prefix(p))
                    .unwrap_or(name);
                if unprefixed != "keyframes" {
                    unused_selectors(&rule.children, analysis, source, out);
                }
            }
            RuleKind::Style { selectors, .. } => {
                for selector in selectors {
                    unused_selector(selector, None, analysis, source, out);
                }
                let global_block = selectors.iter().any(|selector| {
                    selector
                        .parts
                        .iter()
                        .any(|part| part.simple.iter().any(|s| s.is_global_block(source)))
                });
                if !global_block {
                    unused_selectors(&rule.children, analysis, source, out);
                }
            }
        }
    }
}

fn unused_selector(
    selector: &ComplexSelector,
    outer_used: Option<bool>,
    analysis: &Analysis,
    source: &str,
    out: &mut Vec<Diagnostic>,
) {
    let used = analysis
        .stylesheet_used
        .get(selector.id as usize)
        .copied()
        .unwrap_or(true);
    // An unused selector inside `:is()` of an unused one is reported once, at the outer one.
    if !used && outer_used != Some(false) {
        out.push(warning(
            "css_unused_selector",
            &format!("Unused CSS selector \"{}\"", selector.span.text(source)),
            selector.span,
        ));
    }
    for part in &selector.parts {
        for simple in &part.simple {
            if let Simple::PseudoClass { selectors, .. } = simple
                && simple.is_pseudo(source, &["is", "where"])
            {
                for inner in selectors {
                    unused_selector(inner, Some(used), analysis, source, out);
                }
            }
        }
    }
}

struct Template<'a> {
    component: &'a Component,
    source: &'a str,
    out: &'a mut Vec<Diagnostic>,
    errors: &'a mut Vec<(Raised, Diagnostic)>,
    /// Inside an element with `shadowrootmode`, where `<slot>` is an ordinary element.
    shadow_root: bool,
}

impl<'a> Template<'a> {
    /// An error the template walk raises at the node starting at `node`.
    fn error(&mut self, node: Span, error: Diagnostic) {
        let raised = Raised {
            phase: Phase::Walk,
            section: Section::Template,
            at: node.start_offset,
        };
        self.errors.push((raised, error));
    }

    fn fragment(&mut self, range: Range, parent: a11y::Parent<'a>) {
        for &child in self.component.children(range) {
            self.node(child, parent);
        }
    }

    /// `validate_block_not_empty`: a branch that is one whitespace text.
    fn branch(&mut self, range: Range, parent: a11y::Parent<'a>) {
        if let [only] = self.component.children(range)
            && let TemplateNode::Text { span } = *self.component.node(*only)
            && span
                .text(self.source)
                .trim_matches(is_js_whitespace)
                .is_empty()
        {
            self.out.push(warning("block_empty", "Empty block", span));
        }
        self.fragment(range, parent);
    }

    /// `<slot name>`: a static name other than `default`.
    fn slot(&mut self, element: Span, attributes: Range) {
        let component = self.component;
        for attribute in component.attributes(attributes) {
            if attribute.kind != AttributeKind::Attribute
                || attribute.name.text(self.source) != "name"
            {
                continue;
            }
            let text = match attribute.value {
                AttributeValue::Parts(parts) => match component.parts(parts) {
                    [Part::Text(span)] => Some(decode_attribute(span.text(self.source))),
                    _ => None,
                },
                AttributeValue::True => None,
            };
            let found = match text {
                None => error(
                    "slot_element_invalid_name",
                    "slot attribute must be a static value",
                    attribute.span,
                ),
                Some(name) if name == "default" => error(
                    "slot_element_invalid_name_default",
                    "`default` is a reserved word — it cannot be used as a slot name",
                    attribute.span,
                ),
                Some(_) => continue,
            };
            self.error(element, found);
        }
    }

    /// `<svelte:element this="div">`: a string where an expression belongs.
    fn dynamic_this(&mut self, attributes: Range) {
        let component = self.component;
        let this = component
            .attributes(attributes)
            .iter()
            .find(|a| a.kind == AttributeKind::Attribute && a.name.text(self.source) == "this");
        if let Some(this) = this
            && !matches!(this.value, AttributeValue::True)
            && !a11y::is_expression(component, this)
        {
            self.out.push(warning(
                "svelte_element_invalid_this",
                "`this` should be an `{expression}`. Using a string attribute value will cause an error in future versions of Svelte",
                this.span,
            ));
        }
    }

    fn node(&mut self, child: u32, parent: a11y::Parent<'a>) {
        let component = self.component;
        match *component.node(child) {
            TemplateNode::Element {
                name,
                attributes,
                children,
                span,
                ..
            } => {
                let name = name.text(self.source);
                let dynamic = name == "svelte:element";
                let slot = name == "slot" && !self.shadow_root;
                let regular =
                    !dynamic && !name.starts_with("svelte:") && !slot && !is_component_name(name);
                if regular || dynamic {
                    a11y::check_element(
                        component,
                        self.source,
                        name,
                        span,
                        attributes,
                        children,
                        dynamic,
                        parent,
                        self.out,
                    );
                }
                if slot {
                    self.slot(span, attributes);
                }
                if dynamic {
                    self.dynamic_this(attributes);
                }
                let inner = if dynamic {
                    a11y::Parent::Dynamic
                } else if regular {
                    a11y::Parent::Regular(name)
                } else {
                    parent
                };
                let shadow_root = self.shadow_root;
                self.shadow_root |= regular
                    && component.attributes(attributes).iter().any(|a| {
                        a.kind == AttributeKind::Attribute
                            && a.name.text(self.source) == "shadowrootmode"
                    });
                self.fragment(children, inner);
                self.shadow_root = shadow_root;
            }
            TemplateNode::If {
                consequent,
                alternate,
                ..
            } => {
                self.branch(consequent, parent);
                if let Some(alternate) = alternate {
                    self.branch(alternate, parent);
                }
            }
            TemplateNode::Each {
                body,
                fallback,
                has_fallback,
                ..
            } => {
                self.branch(body, parent);
                if has_fallback {
                    self.branch(fallback, parent);
                }
            }
            TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                self.branch(body, parent);
            }
            TemplateNode::Await {
                pending,
                then,
                catch,
                ..
            } => {
                for branch in [pending, then, catch] {
                    if let Some(branch) = branch.present() {
                        self.branch(branch, parent);
                    }
                }
            }
            _ => {}
        }
    }
}
