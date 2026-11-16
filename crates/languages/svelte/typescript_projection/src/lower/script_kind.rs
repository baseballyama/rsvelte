//! Which language svelte-check reads a component's scripts in.

use rsvelte_svelte_syntax::syntax_tree::Component;

/// Whether svelte-check reads the component as TypeScript: either script's `lang`, or its `type`
/// without one, names TypeScript. The compiler's rule, which reads the whole text, differs.
#[must_use]
pub fn checked_as_typescript(component: &Component, source: &str) -> bool {
    [&component.instance, &component.module]
        .into_iter()
        .flatten()
        .any(|script| {
            let value = |name: &str| {
                script
                    .attributes
                    .iter()
                    .find(|(at, _)| at.text(source) == name)
                    .map(|(_, value)| value.map_or("", |value| value.text(source)))
            };
            let kind = value("lang")
                .filter(|lang| !lang.is_empty())
                .or_else(|| value("type"));
            matches!(
                kind,
                Some("ts" | "typescript" | "text/ts" | "text/typescript")
            )
        })
}
