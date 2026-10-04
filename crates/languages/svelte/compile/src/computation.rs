//! Compile artifacts cached within a document.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_svelte::{Analyzed, component_input};

#[derive(Debug)]
pub struct Planned;

impl Artifact for Planned {
    type Output = Option<crate::render_plan::RenderPlan>;

    const NAME: &'static str = "svelte.render_plan";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        Some(crate::render_plan::RenderPlan::build(
            &component_input(context)?.into(),
        ))
    }
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
            .is_custom_element()
        {
            rsvelte_stylesheet::scope::RenderMode::Minify
        } else {
            rsvelte_stylesheet::scope::RenderMode::Preserve
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
    type Output =
        Result<crate::OutputIdentity, rsvelte_kernel::diagnostics::diagnostic::Diagnostic>;

    const NAME: &'static str = "svelte.output_identity";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let input = component_input(context).ok_or_else(|| {
            context
                .get::<rsvelte_svelte::Parsed>()
                .as_ref()
                .expect_err("missing input follows a parse error")
                .clone()
        })?;
        let default = crate::Configuration::default();
        let configuration = context
            .facet::<CompileConfiguration>()
            .map_or(&default, |value| value.as_ref());
        crate::OutputIdentity::build_with_configuration(&input, configuration).map_err(|error| {
            rsvelte_kernel::diagnostics::diagnostic::Diagnostic::error(
                "svelte.compile.css-hash",
                error.to_string(),
                rsvelte_kernel::source::positions::Span::new(0, 0),
            )
        })
    }
}

#[derive(Debug)]
pub struct CompileConfiguration;

impl Facet for CompileConfiguration {
    type Output = std::sync::Arc<crate::Configuration>;

    const NAME: &'static str = "svelte.compile.configuration";
}

#[derive(Debug)]
pub struct Validated;

impl Artifact for Validated {
    type Output =
        Result<crate::lower::ValidatedOptions, rsvelte_kernel::diagnostics::diagnostic::Diagnostic>;

    const NAME: &'static str = "svelte.validate";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let input = component_input(context).expect("a parsed component is lowered to HIR");
        let res = context
            .get::<rsvelte_svelte::Resolved>()
            .as_ref()
            .expect("a parsed component is resolved");
        crate::lower::validate(&input.into(), res)
    }
}
