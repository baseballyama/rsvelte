//! Compile artifacts cached within a document.

use rsvelte_kernel::computation::database::{Artifact, DocumentContext};
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
        crate::stylesheet::scoped_stylesheet(
            &component_input(context)?,
            an,
            context.get::<Identified>().as_ref()?,
        )
    }
}

#[derive(Debug)]
pub struct Identified;

impl Artifact for Identified {
    type Output = Option<crate::OutputIdentity>;

    const NAME: &'static str = "svelte.output_identity";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        Some(crate::OutputIdentity::build(&component_input(context)?))
    }
}
