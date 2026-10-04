use rsvelte_kernel::computation::database::{DocumentContext, Facet};
use rsvelte_svelte::{Parsed, Resolved};

use crate::{Configuration, types::TypeFacts};

#[derive(Debug)]
pub struct LintConfiguration;

impl Facet for LintConfiguration {
    type Output = std::sync::Arc<Configuration>;
    const NAME: &'static str = "svelte.lint.typed.configuration";
}

#[derive(Debug)]
pub struct ConditionTypes;

impl Facet for ConditionTypes {
    type Output = TypeFacts;
    const NAME: &'static str = "svelte.lint.typed.condition_types";
}

pub(crate) fn native_types(context: &DocumentContext<'_>) -> TypeFacts {
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
