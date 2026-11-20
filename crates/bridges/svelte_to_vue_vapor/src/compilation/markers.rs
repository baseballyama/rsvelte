//! The names the translation writes and the Vapor emitter reads back.

/// The tag of a template node for a component.
pub(crate) const COMPONENT: &str = "$$Component";
/// The tag of a template node for a snippet's body.
pub(crate) const SNIPPET: &str = "$$Snippet";
/// The tag of a template node for an `{#await}` block.
pub(crate) const AWAIT: &str = "$$Await";
/// The tag of a template node that scopes a block's declarations.
pub(crate) const SCOPE: &str = "$$Scope";
/// The tag of a template node for a `<svelte:boundary>`.
pub(crate) const BOUNDARY: &str = "$$Boundary";
/// The tag of a template node for a `{@render}` tag.
pub(crate) const RENDER: &str = "$$Render";
/// The tag of a template node for an `{@html}` tag.
pub(crate) const RAW_MARKUP: &str = "$$RawMarkup";
/// The tag of a template node for an HTML `<title>`.
pub(crate) const TITLE: &str = "$$Title";
/// The tag of a template node for static text.
pub(crate) const TEXT: &str = "$$Text";
/// The tag of a template node for static text inside `<pre>`.
pub(crate) const PRE_TEXT: &str = "$$PreText";
/// The tag of a template node for static text inside `<textarea>`.
pub(crate) const TEXTAREA_TEXT: &str = "$$TextareaText";

/// The bound property holding `<svelte:element>`'s tag.
pub(crate) const TAG_KEY: &str = "$$tag";
/// The bound property holding a `bind:this` setter.
pub(crate) const REF_KEY: &str = "$$ref";
/// The bound property holding a component's constructor.
pub(crate) const TYPE_KEY: &str = "$$type";
/// The bound property holding a component's props.
pub(crate) const PROPS_KEY: &str = "$$props";
/// The bound property holding a block's key.
pub(crate) const KEY_KEY: &str = "$$key";
/// The bound property holding `bind:innerHTML`.
pub(crate) const HTML_CONTENT_KEY: &str = "$$html_content";
/// The bound property holding `bind:innerText` or `bind:textContent`.
pub(crate) const TEXT_CONTENT_KEY: &str = "$$text_content";

/// The script's state cell constructor.
pub(crate) const REF: &str = "$$ref";
/// The script's derived cell constructor.
pub(crate) const COMPUTED: &str = "$$computed";
/// The script's prop cell constructor.
pub(crate) const PROP_CELL: &str = "$$prop_cell";
/// The script's async derived cell constructor.
pub(crate) const ASYNC_DERIVED: &str = "$$async_derived";
/// The source of a `bind:group` binding.
pub(crate) const GROUP_SOURCE: &str = "$$group_source";
/// The client's `onMount`.
pub(crate) const ON_MOUNT: &str = "$$on_mount";

/// A snippet's declared name, `$$snippet_<suffix>`, as a literal that `format!` can take.
macro_rules! snippet_name {
    ($suffix:literal) => {
        concat!("$$snippet_", $suffix)
    };
}
pub(crate) use snippet_name;

/// A name a destructuring pattern's lowering declares, `$$pattern_<suffix>`, as a literal that
/// `format!` can take.
macro_rules! pattern_name {
    ($suffix:literal) => {
        concat!("$$pattern_", $suffix)
    };
}
pub(crate) use pattern_name;

/// The prefix of a snippet's declared name.
pub(crate) const SNIPPET_PREFIX: &str = snippet_name!("");
/// The prefix of every name a destructuring pattern's lowering declares.
pub(crate) const PATTERN_PREFIX: &str = pattern_name!("");
/// The parameter that selects a pattern's default.
pub(crate) const PATTERN_DEFAULT: &str = pattern_name!("default");
