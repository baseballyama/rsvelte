use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_svelte::Parsed;
use rsvelte_typescript::NodeIdentifier;

use crate::Configuration;

#[derive(Debug)]
pub struct LintConfiguration;

impl Facet for LintConfiguration {
    type Output = std::sync::Arc<Configuration>;

    const NAME: &'static str = "svelte.lint.configuration";
}

#[derive(Debug)]
pub(crate) struct Parents;

impl Artifact for Parents {
    type Output = Vec<NodeIdentifier>;

    const NAME: &'static str = "svelte.lint.parents";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        context
            .get::<Parsed>()
            .as_ref()
            .expect("lint requests parents after parsing")
            .javascript
            .parents()
    }
}
