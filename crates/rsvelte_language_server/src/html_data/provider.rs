//! `svelteHtmlDataProvider` (`plugins/html/dataProvider.ts:471-509`): the tags
//! and attributes the official server serves, assembled from the vendored
//! upstream data and Svelte's additions.

use std::borrow::Cow;

use super::svelte_html::{GLOBAL_ADDITIONS, OWN_ATTRIBUTES_ONLY, SVELTE_TAGS, TAG_ADDITIONS};
use super::web::{Attribute, GLOBAL_ATTRIBUTES, TAGS, Tag, VALUE_SETS, Value};

/// An attribute as the provider names it — `mapToSvelteEvent` rewrites every
/// upstream tag attribute's leading `on`, so the name is not the data's own.
pub struct Provided {
    pub name: Cow<'static, str>,
    pub data: &'static Attribute,
}

/// `mapToSvelteEvent`, which is applied to a tag's whole attribute list rather
/// than only to the ones that are events.
fn svelte_event(name: &'static str) -> Cow<'static, str> {
    match name.strip_prefix("on") {
        Some(rest) => Cow::Owned(format!("on:{rest}")),
        None => Cow::Borrowed(name),
    }
}

/// `provideTags`: the upstream tags, then Svelte's — which repeat `slot`, so
/// the order is part of the answer.
pub fn tags() -> impl Iterator<Item = &'static Tag> {
    TAGS.iter().chain(SVELTE_TAGS)
}

fn tag(name: &str) -> Option<&'static Tag> {
    // `_tagMap` is built by assignment, so a repeated name keeps the last one.
    tags().filter(|tag| tag.name == name).last()
}

fn own_attributes(tag: &'static Tag, renamed: bool) -> impl Iterator<Item = Provided> {
    let additions = TAG_ADDITIONS
        .iter()
        .find(|(name, _)| *name == tag.name)
        .map_or::<&[Attribute], _>(&[], |(_, extra)| extra);
    tag.attributes
        .iter()
        .map(move |attribute| Provided {
            name: if renamed {
                svelte_event(attribute.name)
            } else {
                Cow::Borrowed(attribute.name)
            },
            data: attribute,
        })
        .chain(additions.iter().map(|attribute| Provided {
            name: Cow::Borrowed(attribute.name),
            data: attribute,
        }))
}

/// `provideAttributes`, including the override that serves `svelte:boundary`
/// and `svelte:options` their own attributes and no globals.
#[must_use]
pub fn attributes(tag_name: &str) -> Vec<Provided> {
    let Some(entry) = tag(tag_name) else {
        return globals().collect();
    };
    // Svelte's own tags are not passed through `mapToSvelteEvent`.
    let renamed = !SVELTE_TAGS.iter().any(|svelte| std::ptr::eq(svelte, entry));
    if OWN_ATTRIBUTES_ONLY.contains(&tag_name) {
        return SVELTE_TAGS
            .iter()
            .find(|svelte| svelte.name == tag_name)
            .map(|svelte| own_attributes(svelte, false).collect())
            .unwrap_or_default();
    }
    own_attributes(entry, renamed).chain(globals()).collect()
}

fn globals() -> impl Iterator<Item = Provided> {
    GLOBAL_ATTRIBUTES
        .iter()
        .chain(GLOBAL_ADDITIONS)
        .map(|attribute| Provided {
            name: Cow::Borrowed(attribute.name),
            data: attribute,
        })
}

/// `provideValues`: an attribute's own values, then its value set's.
#[must_use]
pub fn values(tag_name: &str, attribute_name: &str) -> Vec<&'static Value> {
    let lowered = attribute_name.to_ascii_lowercase();
    attributes(tag_name)
        .iter()
        .filter(|provided| provided.name.to_ascii_lowercase() == lowered)
        .filter_map(|provided| provided.data.value_set)
        .flat_map(|set| {
            VALUE_SETS
                .iter()
                .find(|candidate| candidate.name == set)
                .map_or::<&[Value], _>(&[], |candidate| candidate.values)
        })
        .collect()
}
