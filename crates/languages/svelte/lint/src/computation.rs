use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_svelte::semantic::legacy::Legacy;
use rsvelte_svelte::{Parsed, Resolved};
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

/// The component's legacy reactivity: `$:` statements, the variables they declare, and store
/// subscriptions.
#[derive(Debug)]
pub(crate) struct LegacyReactivity;

impl Artifact for LegacyReactivity {
    type Output = Legacy;

    const NAME: &'static str = "svelte.lint.legacy_reactivity";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context
            .get::<Parsed>()
            .as_ref()
            .expect("lint requests legacy reactivity after parsing");
        let resolution = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component resolves");
        let programs: Vec<NodeIdentifier> = component
            .module
            .iter()
            .map(|script| script.program)
            .chain(std::iter::once(component.program))
            .collect();
        Legacy::new(&component.javascript, &resolution.sem, &programs)
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
