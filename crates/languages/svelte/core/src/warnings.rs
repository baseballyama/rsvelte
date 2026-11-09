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
#[cfg(test)]
mod tests;

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
    /// The warnings `compile` returns: those no `svelte-ignore` of the compiler's covers.
    pub fn compiled(&self) -> impl Iterator<Item = &Diagnostic> {
        self.warnings.iter()
    }

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

    /// Every code Svelte warns with, the runtime warnings `svelte-ignore` also names included: a
    /// `svelte-ignore` of another code ignores nothing.
    pub const SVELTE_CODES: &[&str] = &include!("warnings/vendor/codes.rs");
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

/// The compile options that change what the compiler warns about.
#[derive(Clone, Copy, Debug, Default)]
pub struct Options {
    /// The `runes` option: `None` infers runes mode from the component. `<svelte:options runes>`
    /// overrides it.
    pub runes: Option<bool>,
    /// The `customElement` option.
    pub custom_element: bool,
}

impl Options {
    /// What eslint-plugin-svelte compiles with: no `runes`, and `customElement` when
    /// `<svelte:options>` names `tag` or `customElement`.
    #[must_use]
    pub fn linting(component: &Component, source: &str) -> Self {
        let names = |name| runes::svelte_option(component, source, name).is_some();
        Self {
            runes: None,
            custom_element: names("tag") || names("customElement"),
        }
    }
}

/// The warnings of `component`; `analysis` is needed only for its style sheet.
#[must_use]
pub fn warnings(
    component: &Component,
    resolution: &Resolution,
    analysis: Option<&Analysis>,
    source: &str,
    options: Options,
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
    let runes = runes(component, resolution, source, &out.awaits, options.runes);
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
