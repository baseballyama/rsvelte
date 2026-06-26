//! Port of [`svelte-preprocess-filter`](https://www.npmjs.com/package/svelte-preprocess-filter)
//! (v1.0.0) — decides whether a `<style>` / `<script>` block should be
//! processed based on its `type` / `lang` attributes.

use rsvelte_core::compiler::preprocess::types::{AttributeValue, PreprocessAttributeMap as Map};

/// Options for the `style` / `script` filter (mirrors the JS options object).
#[derive(Debug, Clone)]
pub struct FilterOptions {
    /// The language name to match (e.g. `"scss"`). Required unless `all` is set.
    pub name: Option<String>,
    /// Match unconditionally.
    pub all: bool,
    /// Whether to consider the `type` attribute (default `true`).
    pub type_: bool,
    /// Whether to consider the `lang` attribute (default `true`).
    pub lang: bool,
}

impl Default for FilterOptions {
    fn default() -> Self {
        FilterOptions {
            name: None,
            all: false,
            type_: true,
            lang: true,
        }
    }
}

impl FilterOptions {
    /// A filter that matches the given language `name`.
    pub fn named(name: impl Into<String>) -> Self {
        FilterOptions {
            name: Some(name.into()),
            ..Default::default()
        }
    }
}

fn attr_str<'a>(attributes: &'a Map<String, AttributeValue>, key: &str) -> Option<&'a str> {
    match attributes.get(key)? {
        AttributeValue::String(s) => Some(s.as_str()),
        AttributeValue::Boolean(_) => None,
    }
}

/// The `style` filter from `svelte-preprocess-filter`.
///
/// Returns `true` when the block should be processed. Mirrors the upstream:
/// `typeAttributes.includes(name) || typeAttributes.includes('text/'+name)`.
pub fn matches(opts: &FilterOptions, attributes: &Map<String, AttributeValue>) -> bool {
    if opts.all {
        return true;
    }
    let Some(name) = opts.name.as_deref() else {
        return false;
    };
    let type_attr = if opts.type_ {
        attr_str(attributes, "type")
    } else {
        None
    };
    let lang_attr = if opts.lang {
        attr_str(attributes, "lang")
    } else {
        None
    };
    let text_name = format!("text/{name}");
    [type_attr, lang_attr]
        .into_iter()
        .flatten()
        .any(|v| v == name || v == text_name)
}
