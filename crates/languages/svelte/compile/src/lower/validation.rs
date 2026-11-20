use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::warnings::{
    Phase, Raised, Section, dollar_name_errors, rest_prop_member_errors,
};
use rsvelte_typescript_compile::features::{Feature, first_svelte_runtime_feature_where};
use rsvelte_typescript_tree::document_span;
use rustc_hash::FxHashSet;

mod awaits;
mod const_cycles;
mod declarations;
mod exports;
pub(super) mod markup;
mod runes;
mod snippets;
mod special_elements;

pub(super) use awaits::check as check_awaits;
pub(in crate::lower) use markup::each_key;
use runes::script_and_template_errors;
pub(super) use runes::{Awaits, check_runes, check_runes_with, rejects_binding, script_error};

use super::{
    CompileInput, Diagnostic, Resolution, Span, Target, custom_element, stores, unsupported_syntax,
};

/// An error upstream raises as it parses, before any other.
pub(crate) const fn raised_in_parse() -> Raised {
    Raised {
        phase: Phase::Parse,
        section: Section::Template,
        at: 0,
    }
}

/// An error upstream's walk over the template raises at `at`.
pub(super) const fn raised_in_walk(at: u32) -> Raised {
    raised_in_walk_of(Section::Template, at)
}

/// An error upstream's walk over `section` raises at `at`.
const fn raised_in_walk_of(section: Section, at: u32) -> Raised {
    Raised {
        phase: Phase::Walk,
        section,
        at,
    }
}

/// An error upstream raises as it builds the template's scopes, at `at`.
pub(super) const fn raised_in_scopes(at: u32) -> Raised {
    Raised {
        phase: Phase::Scopes,
        section: Section::Template,
        at,
    }
}

#[derive(Debug)]
pub(crate) struct Validation {
    pub(in crate::lower) custom_element: Option<custom_element::CustomElement>,
    pub(in crate::lower) stylesheet_injected: bool,
    /// The top-level snippets declared beside the component.
    pub(in crate::lower) hoistable: FxHashSet<SymbolId>,
    /// The store subscriptions (`$name`), in the order upstream declares them.
    pub(in crate::lower) stores: Vec<String>,
}

impl Validation {
    /// Upstream `inject_styles`: no stylesheet file, and the minified stylesheet in the module.
    pub(crate) const fn injects_stylesheet(&self) -> bool {
        self.stylesheet_injected || self.custom_element.is_some()
    }

    /// Whether `target`'s module adds the stylesheet; the server never adds a custom element's.
    pub(crate) const fn embeds_stylesheet(&self, target: Target) -> bool {
        match target {
            Target::Client => self.injects_stylesheet(),
            Target::Server => self.stylesheet_injected && self.custom_element.is_none(),
        }
    }
}

pub(crate) fn validate(
    input: &CompileInput<'_>,
    res: &Resolution,
) -> Result<Validation, Diagnostic> {
    validate_unit(input, res, Unit::Component)
}

/// What upstream compiles, which decides the checks only a component gets.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(crate) enum Unit {
    /// Upstream erases its types itself, rejecting a TypeScript feature with a runtime meaning.
    Component,
    /// A `.svelte.js` or `.svelte.ts` module, whose types TypeScript's emit erases first.
    Module,
}

pub(crate) fn validate_unit(
    input: &CompileInput<'_>,
    res: &Resolution,
    unit: Unit,
) -> Result<Validation, Diagnostic> {
    // Acorn rejects at parse time what oxc's semantic checker finds after the parser.
    if let Some(error) =
        rsvelte_svelte_semantic::javascript_error::parse_error(&input.component, res)
    {
        return Err(error);
    }
    if res.awaits() {
        check_awaits(input)?;
    }
    let special_elements::SvelteOptions {
        custom_element,
        stylesheet_injected,
    } = special_elements::parse_time_checks(input)?;
    let typescript = unit == Unit::Component && has_typescript_feature(input);
    // Upstream erases the types right after it parses, before it analyzes.
    if typescript {
        check_typescript(input)?;
    }
    let names = stores::StoreSubscriptions::new(input, res);
    let mut errors = snippets::errors(input, res);
    if unit == Unit::Component {
        errors.extend(exports::default_exports(input));
    }
    check_analysis(input, res, &names, unit, errors, custom_element.is_some())?;
    let hoistable = super::snippets::hoistable(input, res, &names);
    snippets::check_exports(input, res, &hoistable)?;
    const_cycles::check(input, res)?;
    // A refusal waits for the scripts' errors, which the rune checks raise only later.
    let refused = (if typescript {
        refuse_typescript(input)
    } else {
        Ok(())
    })
    .and_then(|()| unsupported_syntax::refuse(input, res));
    if let Err(refusal) = refused {
        let script = script_error(input, res, custom_element.is_some());
        return Err(script.map_or(refusal, |(_, error)| error));
    }
    Ok(Validation {
        custom_element,
        stylesheet_injected,
        hoistable,
        stores: names.subscriptions(res),
    })
}

/// The first error of the rune checks, which upstream raises in runes mode as it walks the scripts
/// and the template's expressions, after what [`validate`] checks; without the `experimental_async`
/// of the scripts and the template, which the analysis's warnings raise where `experimental.async`
/// decides it.
pub(crate) fn rune_error(
    input: &CompileInput<'_>,
    res: &Resolution,
    validated: &Validation,
) -> Option<(Raised, Diagnostic)> {
    let custom_element = validated.custom_element.is_some();
    let error =
        check_runes_with(input, res, Target::Client, custom_element, Awaits::Analysis).err()?;
    let at = error.span.start_offset;
    let inside = |program: Option<_>| {
        program.is_some_and(|program| {
            let span = input.component.javascript.get_program(program).span;
            (span.start..span.end).contains(&at)
        })
    };
    let section = if inside(input.component.module) {
        Section::Module
    } else if inside(input.component.instance) {
        Section::Instance
    } else {
        Section::Template
    };
    Some((raised_in_walk_of(section, at), error))
}

/// The errors of [`validate`] that upstream raises in legacy mode too, with when it raises each:
/// the scripts' syntax and `<svelte:options>` as it parses, then the first of the template walk.
/// Apart, a TypeScript feature with a runtime meaning, which it refuses after the analysis.
pub(crate) fn mode_independent_errors(input: &CompileInput<'_>, res: &Resolution) -> CompileErrors {
    let parse = |error| (raised_in_parse(), error);
    let mut raised = Vec::new();
    if let Some(error) =
        rsvelte_svelte_semantic::javascript_error::parse_error(&input.component, res)
    {
        raised.push(parse(error));
    } else {
        raised.extend(check_awaits(input).err().map(parse));
    }
    raised.extend(special_elements::parse_time_checks(input).err().map(parse));
    raised.extend(template_error(input).map(|(at, error)| (raised_in_walk(at), error)));
    CompileErrors {
        raised,
        after_analysis: (check_typescript(input))
            .and_then(|()| refuse_typescript(input))
            .err(),
    }
}

/// What [`crate::compile_errors`] finds.
#[derive(Debug, Default)]
pub struct CompileErrors {
    /// The errors upstream raises before or during its analysis, in no order.
    pub raised: Vec<(Raised, Diagnostic)>,
    /// The error it raises once the analysis passes.
    pub after_analysis: Option<Diagnostic>,
}

/// Upstream's analysis errors in its order: the first it raises as it builds the scopes, then
/// `$$props` and `$$restProps`, then the first its walk meets. `template` holds those of the
/// template that the walk over elements does not find.
///
/// # Errors
///
/// The first such error.
pub(super) fn check_analysis(
    input: &CompileInput<'_>,
    res: &Resolution,
    names: &stores::StoreSubscriptions<'_>,
    unit: Unit,
    mut errors: Vec<(Raised, Diagnostic)>,
    custom_element: bool,
) -> Result<(), Diagnostic> {
    let component = input.component;
    errors.extend(declarations::duplicates(input, res));
    errors.extend(dollar_name_errors(
        component.javascript,
        component.instance,
        component.module,
        res,
        true,
    ));
    errors.extend(rest_prop_member_errors(
        component.javascript,
        component.instance,
        component.module,
        res,
        true,
    ));
    errors.extend(template_error(input).map(|(at, error)| (raised_in_walk(at), error)));
    // Upstream raises these once its walk is done, in this order.
    let after_walk = [
        markup::mixed_syntaxes(input),
        markup::slot_snippet_conflict(input, res, custom_element),
    ];
    errors.extend(
        after_walk
            .into_iter()
            .flatten()
            .map(|error| (raised_in_walk(u32::MAX), error)),
    );
    errors.extend(
        markup::unparenthesized_sequence(input).map(|(at, error)| (raised_in_walk(at), error)),
    );
    // The rune walk's template error, which upstream meets in the same walk as the template's.
    let script = (errors.iter())
        .any(|(raised, _)| raised.section == Section::Template)
        .then(|| {
            let (script, template) = script_and_template_errors(input, res, custom_element);
            if let Some(error) = template.filter(|error| error.code != crate::lower::UNSUPPORTED) {
                errors.push((raised_in_walk(error.span.start_offset), error));
            }
            script
        });
    // A walk error waits for the scripts' first, which the later rune checks raise anyway.
    if errors.iter().any(|(raised, _)| raised.phase == Phase::Walk)
        && let Some((module, error)) =
            script.unwrap_or_else(|| script_error(input, res, custom_element))
    {
        let section = if module {
            Section::Module
        } else {
            Section::Instance
        };
        errors.push((raised_in_walk_of(section, error.span.start_offset), error));
    }
    errors.sort_by_key(|&(raised, _)| raised);
    let mut errors = errors.into_iter().peekable();
    if let Some((_, error)) = errors.next_if(|(raised, _)| raised.phase == Phase::Scopes) {
        return Err(error);
    }
    names.check(input, res, unit)?;
    check_legacy_props(input, res)?;
    errors.next().map_or(Ok(()), |(_, error)| Err(error))
}

/// The first error upstream's walk over the template raises, which it raises in either mode,
/// with where the walk raises it.
pub(super) fn template_error(input: &CompileInput<'_>) -> Option<(u32, Diagnostic)> {
    [
        special_elements::special_element_error(input).map_err(|e| (e.span.start_offset, e)),
        markup::check(input),
    ]
    .into_iter()
    .filter_map(Result::err)
    .min_by_key(|&(at, _)| at)
}

/// Upstream `legacy_props_invalid` and `legacy_rest_props_invalid` at a name no script declares.
fn check_legacy_props(input: &CompileInput<'_>, res: &Resolution) -> Result<(), Diagnostic> {
    // Upstream reads `$$props` first, and meets the scripts' references before the template's.
    let javascript = input.component.javascript;
    let scripted = |offset: u32| {
        [input.component.module, input.component.instance]
            .into_iter()
            .flatten()
            .any(|p| {
                let span = javascript.get_program(p).span;
                span.start <= offset && offset < span.end
            })
    };
    for (name, code, message) in [
        (
            "$$props",
            "legacy_props_invalid",
            "Cannot use `$$props` in runes mode",
        ),
        (
            "$$restProps",
            "legacy_rest_props_invalid",
            "Cannot use `$$restProps` in runes mode",
        ),
    ] {
        let first = res
            .unbound(|n| n == name)
            .flat_map(|(_, references)| references.into_iter().map(|r| res.reference_span(r)))
            .min_by_key(|span| (!scripted(span.start), span.start));
        if let Some(span) = first {
            return crate::lower::invalid(code, message, document_span(span));
        }
    }
    Ok(())
}

/// The first value reference, in document order, to a name no binding declares that `wanted`
/// takes.
fn first_unresolved(res: &Resolution, wanted: impl Fn(&str) -> bool) -> Option<(&str, Span)> {
    res.unbound(wanted)
        .flat_map(|(name, references)| {
            references
                .into_iter()
                .map(move |r| (name, res.reference_span(r)))
        })
        .min_by_key(|(_, span)| span.start)
        .map(|(name, span)| (name, document_span(span)))
}

/// Upstream `analysis.uses_slots`: the component reads `$$slots`, which it declares from
/// `$.sanitize_slots`.
pub(super) fn uses_slots(res: &Resolution) -> bool {
    first_unresolved(res, |name| name == "$$slots").is_some()
}

/// Upstream `state_invalid_placement`, which the rune walk and the markup walk both raise.
fn state_invalid_placement<T>(rune: &str, span: Span) -> Result<T, Diagnostic> {
    crate::lower::invalid(
        "state_invalid_placement",
        format!(
            "`{rune}(...)` can only be used as a variable declaration initializer, a class field \
             declaration, or the first assignment to a class field at the top level of the \
             constructor."
        ),
        span,
    )
}

/// Whether the scripts hold any feature [`check_typescript`] or [`refuse_typescript`] looks for,
/// so that a component without one is walked once instead of once for each.
pub(super) fn has_typescript_feature(input: &CompileInput<'_>) -> bool {
    first_typescript_feature(input, |_| true).is_err()
}

/// Upstream's refusal of a TypeScript feature with a runtime value, which it raises as it erases
/// the types, before it analyzes.
pub(super) fn check_typescript(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    first_typescript_feature(input, |feature| !port_refuses(feature))
}

/// This port's refusal of a TypeScript feature upstream keeps and prints, which waits for every
/// error upstream raises.
pub(super) fn refuse_typescript(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    first_typescript_feature(input, port_refuses)
}

/// What upstream keeps as it is and this compiler does not lower.
const fn port_refuses(feature: Feature) -> bool {
    matches!(feature, Feature::ImportEquals | Feature::ExportAssignment)
}

fn first_typescript_feature(
    input: &CompileInput<'_>,
    wanted: fn(Feature) -> bool,
) -> Result<(), Diagnostic> {
    let javascript = input.component.javascript;
    let mut programs = [input.component.module, input.component.instance]
        .map(|p| p.map(|p| javascript.get_program(p)));
    // The parser met the scripts in document order.
    programs.sort_by_key(|p| p.map(|p| p.span.start));
    match (programs.into_iter().flatten())
        .find_map(|program| first_svelte_runtime_feature_where(program, wanted))
    {
        Some((feature, span)) => Err(typescript_invalid_feature(feature, document_span(span))),
        None => Ok(()),
    }
}

/// Upstream `remove_typescript_nodes` erases types and refuses what has a runtime value; what it
/// keeps for esrap to print, this compiler does not lower.
fn typescript_invalid_feature(feature: Feature, span: Span) -> Diagnostic {
    let feature = match feature {
        Feature::Enum => "enums",
        Feature::NamespaceWithValues => "namespaces with non-type nodes",
        Feature::Decorator => "decorators (related TSC proposal is not stage 4 yet)",
        Feature::Accessor => "accessor fields (related TSC proposal is not stage 4 yet)",
        Feature::ParameterProperty => "accessibility modifiers on constructor parameters",
        Feature::ImportEquals => {
            return Diagnostic::error(
                crate::lower::UNSUPPORTED,
                "`import name = …` is not supported yet",
                span,
            );
        }
        Feature::ExportAssignment => {
            return Diagnostic::error(
                crate::lower::UNSUPPORTED,
                "`export = …` is not supported yet",
                span,
            );
        }
    };
    crate::lower::error(
        "typescript_invalid_feature",
        format!(
            "TypeScript language features like {feature} are not natively supported, and their \
             use is generally discouraged. Outside of `<script>` tags, these features are not \
             supported. For use within `<script>` tags, you will need to use a preprocessor to \
             convert it to JavaScript before it gets passed to the Svelte compiler. If you are \
             using `vitePreprocess`, make sure to specifically enable preprocessing script tags \
             (`vitePreprocess({{ script: true }})`)"
        ),
        span,
    )
}
