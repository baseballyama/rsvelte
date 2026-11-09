use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_svelte::Parsed;
use rsvelte_typescript::NodeIdentifier;

use crate::{Configuration, SvelteConfig};

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

/// [`Parents`] of a JavaScript or TypeScript module.
#[derive(Debug)]
pub(crate) struct ModuleParents;

impl Artifact for ModuleParents {
    type Output = Vec<NodeIdentifier>;

    const NAME: &'static str = "svelte.lint.module_parents";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        context
            .get::<rsvelte_typescript::Parsed>()
            .as_ref()
            .expect("lint requests parents after parsing")
            .syntax_tree
            .parents()
    }
}

/// The document's `svelte.config.js`, as `svelte-eslint-parser` finds it; the host loads it.
#[derive(Debug)]
pub struct SvelteConfiguration;

impl Facet for SvelteConfiguration {
    type Output = SvelteConfig;

    const NAME: &'static str = "svelte.lint.svelte_config";
}
