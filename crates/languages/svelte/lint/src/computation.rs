use rsvelte_kernel::computation::database::{Artifact, DocumentContext, Facet};
use rsvelte_svelte::{Parsed, Resolved};
use rsvelte_typescript::NodeIdentifier;

use crate::Configuration;
use crate::types::TypeFacts;

#[derive(Debug)]
pub struct LintConfiguration;

impl Facet for LintConfiguration {
    type Output = std::sync::Arc<Configuration>;

    const NAME: &'static str = "svelte.lint.configuration";
}

/// The condition type of each JS/TS node of a component, from a host's type provider
/// ([`crate::register_type_provider`]), or why they do not fit the component. Without one, rules
/// use [`NativeConditionTypes`].
#[derive(Debug)]
pub(crate) struct ConditionTypes;

impl Facet for ConditionTypes {
    type Output = Result<TypeFacts, String>;

    const NAME: &'static str = "svelte.lint.condition_types";
}

/// The built-in prototype's [`ConditionTypes`].
#[derive(Debug)]
pub(crate) struct NativeConditionTypes;

impl Artifact for NativeConditionTypes {
    type Output = TypeFacts;

    const NAME: &'static str = "svelte.lint.native_condition_types";

    fn compute(context: &DocumentContext<'_>) -> Self::Output {
        let component = context
            .get::<Parsed>()
            .as_ref()
            .expect("lint requests types after parsing");
        let resolution = context
            .get::<Resolved>()
            .as_ref()
            .expect("a parsed component resolves");
        TypeFacts::infer(component, resolution, context.source_text())
    }
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
