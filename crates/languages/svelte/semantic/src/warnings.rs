//! What the compiler warns about, and the analysis errors it raises, without generating code.
//!
//! A subset of Svelte 5's: [`CompileWarnings::CODES`] names what is checked, so a consumer can
//! tell "not warned" from "not checked". [`CompileWarnings::warnings`] holds every warning;
//! [`CompileWarnings::compiled`] leaves out the ones a `svelte-ignore` comment ignores.

use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Component, Script};
use rsvelte_typescript_tree::{ProgramIdentifier, Tree};

use crate::analyze::Analysis;
use crate::compiler_syntax_tree::CompilerSyntaxTree;
use crate::resolve::Resolution;

mod a11y;
mod awaits;
mod component;
mod exports;
mod found;
mod ignore;
mod raised;
mod runes;
mod script;
mod selectors;
mod setup;
mod stylesheet_analysis;
mod template;
#[cfg(test)]
mod tests;
mod updates;

use component::{component_errors, deprecated_tag};
use exports::{state_exports, unused_exports};
use found::{Found, VisitOrder};
pub use ignore::code_for_v5;
pub use raised::{Phase, Raised, Section};
pub use runes::dollar_name_errors;
use runes::{custom_element, declaration_errors, runes};
use selectors::unused_selectors;
use template::Template;

#[derive(Debug, Default)]
pub struct CompileWarnings {
    /// In the order the compiler emits them, `svelte-ignore` not applied.
    pub warnings: Vec<Diagnostic>,
    /// Per warning, whether a `svelte-ignore` the compiler reads covers it.
    pub ignored: Vec<bool>,
    /// Analysis errors, with when the compiler raises each; it stops at the first.
    pub errors: Vec<(Raised, Diagnostic)>,
    /// The `await`s that are `experimental_async` errors unless that option is on.
    pub awaits: Vec<Span>,
    /// Whether the compiler is in runes mode, given or inferred.
    pub runes: bool,
}

impl CompileWarnings {
    /// The warning codes this module checks.
    pub const CODES: &[&str] = &[
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
        "attribute_avoid_is",
        "attribute_global_event_reference",
        "attribute_illegal_colon",
        "attribute_invalid_property_name",
        "attribute_quoted",
        "bidirectional_control_characters",
        "bind_invalid_each_rest",
        "block_empty",
        "component_name_lowercase",
        "css_unused_selector",
        "custom_element_props_identifier",
        "element_implicitly_closed",
        "element_invalid_self_closing_tag",
        "event_directive_deprecated",
        "export_let_unused",
        "legacy_code",
        "legacy_component_creation",
        "node_invalid_placement_ssr",
        "non_reactive_update",
        "options_deprecated_accessors",
        "options_deprecated_immutable",
        "options_missing_custom_element",
        "perf_avoid_inline_class",
        "perf_avoid_nested_class",
        "reactive_declaration_invalid_placement",
        "script_context_deprecated",
        "script_unknown_attribute",
        "slot_element_deprecated",
        "state_referenced_locally",
        "store_rune_conflict",
        "svelte_component_deprecated",
        "svelte_element_invalid_this",
        "svelte_self_deprecated",
        "unknown_code",
    ];
    /// Every code Svelte warns with, the runtime warnings `svelte-ignore` also names included: a
    /// `svelte-ignore` of another code ignores nothing.
    pub const SVELTE_CODES: &[&str] = &include!("warnings/vendor/codes.rs");

    /// The warnings `compile` returns: those no `svelte-ignore` of the compiler's covers.
    pub fn compiled(&self) -> impl Iterator<Item = &Diagnostic> {
        self.warnings
            .iter()
            .zip(&self.ignored)
            .filter(|(_, ignored)| !**ignored)
            .map(|(warning, _)| warning)
    }
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
        let names = |name| component.svelte_option(source, name).is_some();
        Self {
            runes: None,
            custom_element: names("tag") || names("customElement"),
        }
    }
}

/// The warnings of `component` from the file `filename`, `None` when the caller names no file;
/// `analysis` is needed only for its style sheet.
#[must_use]
pub fn warnings(
    component: &Component,
    compiler_syntax_tree: &CompilerSyntaxTree,
    resolution: &Resolution,
    analysis: Option<&Analysis>,
    source: &str,
    filename: Option<&str>,
    options: Options,
) -> CompileWarnings {
    let mut out = CompileWarnings {
        awaits: awaits::suspending_awaits(component, compiler_syntax_tree, resolution),
        ..CompileWarnings::default()
    };
    deprecated_tag(component, source, &mut out.errors);
    let runes = runes(component, resolution, source, &out.awaits, options.runes);
    out.runes = runes;
    out.errors.extend(dollar_name_errors(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        resolution,
        runes,
    ));
    declaration_errors(component, resolution, runes, &mut out.errors);
    let mut found = Found::default();
    let custom_options = component.svelte_option(source, "customElement").is_some();
    let none = rustc_hash::FxHashMap::default();
    let exported = if runes {
        resolution.exported_by_specifier()
    } else {
        &none
    };
    setup::warnings(component, source, runes, options, &mut found);
    script::walk(
        &Scripts::of(component),
        Some(compiler_syntax_tree),
        resolution,
        runes,
        options,
        exported,
        &mut found,
    );
    custom_element(component, resolution, source, &mut found);
    // Upstream names an unknown file `Self.svelte`.
    let (name, basename) = filename.map_or_else(
        || ("Self".to_owned(), "Self.svelte"),
        |filename| {
            let basename = filename.rsplit(['/', '\\']).next().unwrap_or(filename);
            (
                rsvelte_svelte_syntax::names::component_name(filename),
                basename,
            )
        },
    );
    let mut template = Template::new(
        template::Context {
            component,
            source,
            resolution,
            runes,
            custom_element: custom_options || options.custom_element,
            name: &name,
            basename,
        },
        &mut found,
        &mut out.errors,
    );
    template.fragment(component.root, a11y::Parent::None);
    let bind_this = std::mem::take(&mut template.bind_this);
    let first_slot = template.first_slot.map(|(_, at)| at);
    component_errors(
        component,
        resolution,
        source,
        template
            .event_directive
            .filter(|_| template.event_attributes),
        first_slot,
        custom_options || options.custom_element,
        &mut out.errors,
    );
    if runes {
        updates::non_reactive_updates(component, resolution, &bind_this, exported, &mut found);
    } else {
        unused_exports(component, resolution, source, &mut found);
        state_exports(component, resolution, &mut out.errors);
    }
    if let Some(Ok(sheet)) = component.style.as_ref().map(|s| &s.sheet)
        && let Some(found) = stylesheet_analysis::first_error(&sheet.rules, source)
    {
        let raised = Raised {
            phase: Phase::Stylesheet,
            section: Section::Template,
            at: found.span.start_offset,
        };
        out.errors.push((raised, found));
    }
    if let Some(analysis) = analysis {
        stylesheet_warnings(component, analysis, source, runes, &mut found);
    }
    let regions = ignore::regions(component, compiler_syntax_tree, source, runes, &mut found);
    let (found, silenced) = found.finish(&VisitOrder::of(component, source));
    out.ignored = ignore::ignored(&found, &regions);
    for (ignored, silenced) in out.ignored.iter_mut().zip(silenced) {
        *ignored |= silenced;
    }
    out.warnings = found.into_iter().map(|(_, warning)| warning).collect();
    out
}

/// `css_unused_selector`, kept and marked ignored when the comment before `<style>` ignores it.
fn stylesheet_warnings(
    component: &Component,
    analysis: &Analysis,
    source: &str,
    runes: bool,
    found: &mut Found,
) {
    if let Some(style) = &component.style
        && let Ok(sheet) = &style.sheet
    {
        if selectors::ignored(component, source, runes, found) {
            found.silence(style.span, "css_unused_selector");
        }
        unused_selectors(&sheet.rules, analysis, source, found);
    }
}

/// Upstream `analyze_module`'s warnings for a `.svelte.js` or `.svelte.ts` module: its script
/// visitors, in runes mode, over `program` of `javascript`, and the `svelte-ignore` comments in it.
#[must_use]
pub fn module_warnings(
    javascript: &Tree,
    program: ProgramIdentifier,
    resolution: &Resolution,
    source: &str,
    options: Options,
) -> CompileWarnings {
    let scripts = Scripts {
        javascript,
        module: Some(ScriptPart {
            program,
            content: Span::new(0, source.len() as u32),
        }),
        instance: None,
        file: true,
    };
    let mut found = Found::default();
    script::walk(
        &scripts,
        None,
        resolution,
        true,
        options,
        &rustc_hash::FxHashMap::default(),
        &mut found,
    );
    let regions = ignore::module_regions(&scripts, source, &mut found);
    let (found, _) = found.finish(&VisitOrder::default());
    CompileWarnings {
        ignored: ignore::ignored(&found, &regions),
        warnings: found.into_iter().map(|(_, warning)| warning).collect(),
        runes: true,
        ..CompileWarnings::default()
    }
}

/// The scripts the walks visit: a component's module and instance, or a module file's program.
pub(super) struct Scripts<'a> {
    pub(super) javascript: &'a Tree,
    pub(super) module: Option<ScriptPart>,
    pub(super) instance: Option<ScriptPart>,
    /// A module file, which upstream analyzes without a component's `ast_type`.
    pub(super) file: bool,
}

#[derive(Clone, Copy)]
pub(super) struct ScriptPart {
    pub(super) program: ProgramIdentifier,
    /// The text the program covers.
    pub(super) content: Span,
}

impl<'a> Scripts<'a> {
    pub(super) fn of(component: &'a Component) -> Self {
        let part = |script: &Option<Script>| {
            script.as_ref().map(|s| ScriptPart {
                program: s.program,
                content: s.content,
            })
        };
        Self {
            javascript: &component.javascript,
            module: part(&component.module),
            instance: part(&component.instance),
            file: false,
        }
    }

    /// The module, then the instance, as the compiler walks them.
    pub(super) fn sections(&self) -> impl Iterator<Item = (Section, ScriptPart)> {
        [
            (Section::Module, self.module),
            (Section::Instance, self.instance),
        ]
        .into_iter()
        .filter_map(|(section, script)| Some((section, script?)))
    }
}
