//! What the compiler warns about, and the analysis errors it raises, without generating code.
//!
//! A subset of Svelte 5's: [`CompileWarnings::CODES`] names what is checked, so a consumer can
//! tell "not warned" from "not checked". `svelte-ignore` comments are not applied here.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::semantic::analyze::Analysis;
use rsvelte_svelte_semantic::semantic::resolve::Resolution;
use rsvelte_svelte_syntax::syntax_tree::{AttributeKind, Component, Script, TemplateNode};
use rsvelte_typescript::syntax_tree::{Class, Kind};
use rsvelte_typescript::{NodeIdentifier, SyntaxTree};

mod a11y;
mod exports;
mod runes;
mod selectors;
mod template;

use exports::unused_exports;
use runes::{custom_element, dollar_names, rune_placement, runes};
use selectors::unused_selectors;
use template::{Owner, Template};

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
    Parse,
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

/// `SlotElement`'s check of a `<slot>`'s `name`, given its static text (`None` for any other
/// value): the error's code and message.
#[must_use]
pub fn slot_name_error(name: Option<&str>) -> Option<(&'static str, &'static str)> {
    match name {
        None => Some((
            "slot_element_invalid_name",
            "slot attribute must be a static value",
        )),
        Some("default") => Some((
            "slot_element_invalid_name_default",
            "`default` is a reserved word — it cannot be used as a slot name",
        )),
        Some(_) => None,
    }
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
    deprecated_tag(component, source, &mut out.errors);
    let runes = runes(component, resolution, source, &out.awaits);
    dollar_names(component, resolution, source, runes, &mut out.errors);
    if runes {
        rune_placement(component, &mut out.errors);
    }
    custom_element(component, resolution, source, &mut out.warnings);
    Template {
        component,
        source,
        out: &mut out.warnings,
        errors: &mut out.errors,
        shadow_root: false,
        owner: Owner::Other,
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

/// `<svelte:options tag>`, which Svelte 5's parser rejects.
fn deprecated_tag(component: &Component, source: &str, out: &mut Vec<(Raised, Diagnostic)>) {
    for &child in component.children(component.root) {
        let TemplateNode::Element {
            name, attributes, ..
        } = *component.node(child)
        else {
            continue;
        };
        if name.text(source) != "svelte:options" {
            continue;
        }
        for attribute in component.attributes(attributes) {
            if attribute.kind == AttributeKind::Attribute && attribute.name.text(source) == "tag" {
                let raised = Raised {
                    phase: Phase::Parse,
                    section: Section::Template,
                    at: attribute.span.start_offset,
                };
                let found = error(
                    "svelte_options_deprecated_tag",
                    "\"tag\" option is deprecated — use \"customElement\" instead",
                    attribute.span,
                );
                out.push((raised, found));
            }
        }
    }
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
