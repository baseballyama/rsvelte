use oxc_semantic::ReferenceId;
use oxc_syntax::symbol::SymbolFlags;
use rsvelte_svelte_semantic::warnings::{Phase, Raised, Section, dollar_name_errors};
use rsvelte_svelte_syntax::names::{is_mathml, is_svg};
use rsvelte_typescript_compile::features::{Feature, first_runtime_feature};

pub(super) mod markup;
mod runes;

pub(super) use runes::{check_runes, rejects_binding};

use super::{CompileInput, Diagnostic, Resolution, Span, unsupported};

/// Refuses an element upstream's `is_svg` or `is_mathml` names (case-sensitively).
///
/// With `<svg>` and `<math>` refused, such an element would need upstream's namespace inference,
/// which this port does not do.
///
/// # Errors
///
/// An `unsupported` [`Diagnostic`] at the element's name.
pub(crate) fn check_foreign_element(source_text: &str, name: Span) -> Result<(), Diagnostic> {
    let text = name.text(source_text);
    if is_svg(text) || is_mathml(text) {
        return unsupported(&format!("`<{text}>` outside `<svg>` or `<math>`"), name);
    }
    Ok(())
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
    names: &super::stores::Names<'_>,
    mut errors: Vec<(Raised, Diagnostic)>,
) -> Result<(), Diagnostic> {
    let component = input.component;
    errors.extend(dollar_name_errors(
        component.javascript,
        component.instance,
        component.module,
        res,
        true,
    ));
    if let Err(error) = markup::check(input) {
        let at = error.span.start_offset;
        let raised = Raised {
            phase: Phase::Walk,
            section: Section::Template,
            at,
        };
        errors.push((raised, error));
    }
    errors.sort_by_key(|&(raised, _)| raised);
    let mut errors = errors.into_iter().peekable();
    if let Some((_, error)) = errors.next_if(|(raised, _)| raised.phase == Phase::Scopes) {
        return Err(error);
    }
    names.check(input, res)?;
    check_legacy_props(res)?;
    errors.next().map_or(Ok(()), |(_, error)| Err(error))
}

/// Upstream `legacy_props_invalid` and `legacy_rest_props_invalid` at a name no script declares.
fn check_legacy_props(res: &Resolution) -> Result<(), Diagnostic> {
    let first = first_unresolved(res, |name| matches!(name, "$$props" | "$$restProps"));
    let Some((name, span)) = first else {
        return Ok(());
    };
    let (code, message) = if name == "$$props" {
        ("legacy_props_invalid", "Cannot use `$$props` in runes mode")
    } else {
        (
            "legacy_rest_props_invalid",
            "Cannot use `$$restProps` in runes mode",
        )
    };
    super::special::invalid(code, message, span)
}

/// The first value reference, in document order, to a name no binding declares that `wanted`
/// takes.
fn first_unresolved(res: &Resolution, wanted: impl Fn(&str) -> bool) -> Option<(&str, Span)> {
    unbound(res, wanted)
        .flat_map(|(name, references)| {
            references
                .into_iter()
                .map(move |r| (name, res.reference_span(r)))
        })
        .min_by_key(|(_, span)| span.start)
        .map(|(name, span)| (name, Span::new(span.start, span.end)))
}

/// Each name no binding declares that `wanted` takes, with its value references. Upstream erases a
/// `declare`d name, so it declares nothing.
pub(super) fn unbound(
    res: &Resolution,
    wanted: impl Fn(&str) -> bool,
) -> impl Iterator<Item = (&str, Vec<ReferenceId>)> {
    let scoping = res.scoping();
    let ambient = (scoping.symbol_ids())
        .filter(|&s| scoping.symbol_flags(s).contains(SymbolFlags::Ambient))
        .map(|s| {
            (
                scoping.symbol_name(s),
                scoping.get_resolved_reference_ids(s),
            )
        });
    (scoping.root_unresolved_references().iter())
        .map(|(name, references)| (name.as_str(), references.as_slice()))
        .chain(ambient)
        .filter(move |(name, _)| wanted(name))
        .map(|(name, references)| {
            let values = (references.iter().copied())
                .filter(|&r| scoping.get_reference(r).flags().is_value())
                .collect();
            (name, values)
        })
}

/// Upstream `analysis.uses_slots`: the component reads `$$slots`, which it declares from
/// `$.sanitize_slots`.
pub(super) fn uses_slots(res: &Resolution) -> bool {
    first_unresolved(res, |name| name == "$$slots").is_some()
}

/// Upstream `state_invalid_placement`, which the rune walk and the markup walk both raise.
fn state_invalid_placement<T>(rune: &str, span: Span) -> Result<T, Diagnostic> {
    super::special::invalid(
        "state_invalid_placement",
        &format!(
            "`{rune}(...)` can only be used as a variable declaration initializer, a class field \
             declaration, or the first assignment to a class field at the top level of the \
             constructor."
        ),
        span,
    )
}

pub(super) fn check_typescript(input: &CompileInput<'_>) -> Result<(), Diagnostic> {
    let javascript = input.component.javascript;
    let mut programs: Vec<_> = (input.component.module.into_iter())
        .chain(input.component.instance)
        .map(|p| javascript.get_program(p))
        .collect();
    // The parser met the scripts in document order.
    programs.sort_by_key(|p| p.span.start);
    match programs.into_iter().find_map(first_runtime_feature) {
        Some((feature, span)) => Err(typescript_invalid_feature(
            feature,
            Span::new(span.start, span.end),
        )),
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
                "unsupported",
                "`import name = …` is not supported yet",
                span,
            );
        }
        Feature::ExportAssignment => {
            return Diagnostic::error("unsupported", "`export = …` is not supported yet", span);
        }
    };
    Diagnostic::error(
        "typescript_invalid_feature",
        format!(
            "TypeScript language features like {feature} are not natively supported, and their \
             use is generally discouraged. Outside of `<script>` tags, these features are not \
             supported. For use within `<script>` tags, you will need to use a preprocessor to \
             convert it to JavaScript before it gets passed to the Svelte compiler. If you are \
             using `vitePreprocess`, make sure to specifically enable preprocessing script tags \
             (`vitePreprocess({{ script: true }})`)\n\
             https://svelte.dev/e/typescript_invalid_feature"
        ),
        span,
    )
}
