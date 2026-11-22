//! Compile artifacts cached within a document.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_svelte_semantic::{Analyzed, component_input};

use crate::lower::{CompileErrors, UNSUPPORTED};

#[derive(Debug)]
pub struct Planned;

impl Artifact for Planned {
    type Output = Option<crate::render_plan::RenderPlan>;

    const NAME: &'static str = "svelte.render_plan";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        Some(crate::render_plan::RenderPlan::build(&compile_input(
            context,
        )?))
    }
}

/// The document's component with the host's compile options.
pub(crate) fn compile_input<'a>(
    context: &'a DocumentContext<'_>,
) -> Option<crate::CompileInput<'a>> {
    Some(crate::CompileInput {
        component: component_input(context)?,
        preserve_whitespace: context
            .facet::<CompileConfiguration>()
            .is_some_and(|configuration| configuration.preserve_whitespace),
        renderer: crate::Renderer::Dom,
    })
}

#[derive(Debug)]
pub struct ScopedStylesheet;

impl Artifact for ScopedStylesheet {
    type Output = Option<String>;

    const NAME: &'static str = "svelte.css";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let an = context.get::<Analyzed>().as_ref()?;
        let mode = if context
            .get::<Validated>()
            .as_ref()
            .ok()?
            .injects_stylesheet()
        {
            rsvelte_stylesheet_compile::scope::RenderMode::Minify
        } else {
            rsvelte_stylesheet_compile::scope::RenderMode::Preserve
        };
        crate::stylesheet::scoped_stylesheet_with_mode(
            &component_input(context)?,
            an,
            context.get::<Identified>().as_ref().ok()?,
            mode,
        )
    }
}

#[derive(Debug)]
pub struct Identified;

impl Artifact for Identified {
    type Output = Result<crate::OutputIdentity, Diagnostic>;

    const NAME: &'static str = "svelte.output_identity";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let input = component_input(context).ok_or_else(|| {
            rsvelte_svelte_syntax::fully_parsed(context)
                .expect_err("missing input follows a parse error")
                .clone()
        })?;
        let default = crate::Configuration::default();
        let configuration = context
            .facet::<CompileConfiguration>()
            .map_or(&default, |value| value.as_ref());
        crate::OutputIdentity::build_with_configuration(&input, configuration).map_err(|error| {
            Diagnostic::error(
                "svelte.compile.css-hash",
                error.to_string(),
                rsvelte_kernel::source::positions::Span::new(0, 0),
            )
        })
    }
}

#[derive(Debug)]
pub(crate) struct CompileConfiguration;

impl Facet for CompileConfiguration {
    type Output = std::sync::Arc<crate::Configuration>;

    const NAME: &'static str = "svelte.compile.configuration";
}

#[derive(Debug)]
pub(crate) struct Validated;

impl Artifact for Validated {
    type Output = Result<crate::lower::Validation, Diagnostic>;

    const NAME: &'static str = "svelte.validate";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let input = component_input(context).expect("a parsed component is lowered to HIR");
        let res = context
            .get::<rsvelte_svelte_semantic::Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        crate::lower::validate(&input.into(), res)
    }
}

/// The errors `compile` raises for the component that this port knows, without what it does not
/// lower yet; without `runes`, those upstream raises only in runes mode are left out.
#[must_use]
pub fn compile_errors(context: &DocumentContext<'_>, runes: bool) -> CompileErrors {
    // A style sheet that does not parse leaves no input, though lint may strip that style.
    let (Some(input), Some(res)) = (
        component_input(context),
        context.get::<rsvelte_svelte_semantic::Resolved>().as_ref(),
    ) else {
        return CompileErrors::default();
    };
    // Validation assumes runes mode, as every compile here runs in it.
    let lint_raises = |error: &Diagnostic| {
        error.code != UNSUPPORTED
            && !GENERATED.contains(&&*error.code)
            && (runes || !RUNES_ONLY.contains(&&*error.code))
    };
    match context.get::<Validated>() {
        Ok(options) => {
            let raised = crate::lower::rune_error(&input.into(), res, options)
                .filter(|(_, error)| lint_raises(error))
                .into_iter()
                .collect();
            return CompileErrors {
                raised,
                after_analysis: None,
            };
        }
        Err(error) if lint_raises(error) => {
            return CompileErrors {
                raised: vec![(crate::lower::raised_in_parse(), error.clone())],
                after_analysis: None,
            };
        }
        // The checks after it still run.
        Err(_) => {}
    }
    let mut errors = crate::lower::mode_independent_errors(&input.into(), res);
    errors.raised.retain(|(_, error)| error.code != UNSUPPORTED);
    errors.after_analysis = errors
        .after_analysis
        .filter(|error| error.code != UNSUPPORTED);
    errors
}

/// The errors of [`Validated`] that upstream raises as it generates code, which
/// `generate: false` skips.
const GENERATED: &[&str] = &["const_tag_invalid_reference", "const_tag_cycle"];

/// What validation raises that upstream's analysis raises only in runes mode; the analysis's
/// own `$` name checks cover legacy mode.
const RUNES_ONLY: &[&str] = &[
    "attribute_invalid_sequence_expression",
    "attribute_unquoted_sequence",
    "block_unexpected_character",
    "dollar_binding_invalid",
    "dollar_prefix_invalid",
    "duplicate_class_field",
    "each_item_invalid_assignment",
    "import_svelte_internal_forbidden",
    "legacy_export_invalid",
    "legacy_props_invalid",
    "legacy_reactive_statement_invalid",
    "legacy_rest_props_invalid",
    "state_field_duplicate",
    "state_field_invalid_assignment",
];

/// Registers what [`compile_errors`] reads.
pub fn register_validation(registry: &mut Registry) {
    rsvelte_svelte_semantic::register(registry);
    registry.artifact::<Validated>();
}
