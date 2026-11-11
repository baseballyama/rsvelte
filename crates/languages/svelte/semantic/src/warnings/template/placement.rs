//! `node_invalid_placement` and `node_invalid_placement_ssr` (`html-tree-validation.js`): an
//! element that the browser's HTML parser would move away from where it is written.

use rsvelte_kernel::source::positions::Span;

use super::super::{error, warning};
use super::{Stage, Template};

/// What encloses the node being walked, as the placement check looks outwards.
#[derive(Clone, Copy)]
pub(super) enum Ancestor<'a> {
    Element(&'a str),
    /// `{#if}`, `{#each}`, `{#await}` or `{#key}`, which the client renders as its own template.
    Block,
    /// A component, `<svelte:element>`, `<svelte:self>` or `{#snippet}`, where the check stops.
    Boundary,
}

/// The children an element does not allow, in the sense that the browser repairs them.
enum Disallowed {
    Direct(&'static [&'static str]),
    Descendant(&'static [&'static str], &'static [&'static str]),
    Only(&'static [&'static str]),
}

const HEADINGS: &[&str] = &["h1", "h2", "h3", "h4", "h5", "h6"];
const ROW_GROUP: &[&str] = &["tr", "style", "script", "template"];

/// `disallowed_children`.
fn disallowed(tag: &str) -> Option<Disallowed> {
    use Disallowed::{Descendant, Direct, Only};
    Some(match tag {
        "li" => Direct(&["li"]),
        "dt" | "dd" => Descendant(&["dt", "dd"], &["dl"]),
        "p" => Descendant(
            &[
                "address",
                "article",
                "aside",
                "blockquote",
                "div",
                "dl",
                "fieldset",
                "footer",
                "form",
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6",
                "header",
                "hgroup",
                "hr",
                "main",
                "menu",
                "nav",
                "ol",
                "p",
                "pre",
                "section",
                "table",
                "ul",
            ],
            &[],
        ),
        "rt" | "rp" => Descendant(&["rt", "rp"], &[]),
        "optgroup" => Descendant(&["optgroup"], &[]),
        "option" => Descendant(&["option", "optgroup"], &[]),
        "thead" | "tbody" | "tfoot" => Only(ROW_GROUP),
        "tr" => Only(&["th", "td", "style", "script", "template"]),
        "td" | "th" => Direct(&["td", "th", "tr"]),
        "form" => Descendant(&["form"], &[]),
        "a" => Descendant(&["a"], &[]),
        "button" => Descendant(&["button"], &[]),
        "h1" | "h2" | "h3" | "h4" | "h5" | "h6" => Descendant(HEADINGS, &[]),
        "colgroup" => Only(&["col", "template"]),
        "table" => Only(&[
            "caption", "colgroup", "tbody", "thead", "tfoot", "style", "script", "template",
        ]),
        "head" => Only(&[
            "base", "basefont", "bgsound", "link", "meta", "title", "noscript", "noframes",
            "style", "script", "template",
        ]),
        "html" => Only(&["head", "body", "frameset"]),
        "frameset" => Only(&["frame"]),
        _ => return None,
    })
}

/// `is_tag_valid_with_parent`.
fn with_parent(child: &str, parent: &str) -> Option<String> {
    if child.contains('-') || parent.contains('-') || parent == "template" {
        return None;
    }
    match disallowed(parent) {
        Some(Disallowed::Direct(list)) if list.contains(&child) => {
            return Some(format!(
                "`<{child}>` cannot be a direct child of `<{parent}>`"
            ));
        }
        Some(Disallowed::Descendant(list, _)) if list.contains(&child) => {
            return Some(format!("`<{child}>` cannot be a child of `<{parent}>`"));
        }
        Some(Disallowed::Only(list)) => {
            if list.contains(&child) {
                return None;
            }
            let allowed: Vec<String> = list.iter().map(|t| format!("`<{t}>`")).collect();
            return Some(format!(
                "`<{child}>` cannot be a child of `<{parent}>`. `<{parent}>` only allows these \
                    children: {}",
                allowed.join(", ")
            ));
        }
        _ => {}
    }
    match child {
        "body" | "caption" | "col" | "colgroup" | "frameset" | "frame" | "head" | "html" => {
            Some(format!("`<{child}>` cannot be a child of `<{parent}>`"))
        }
        "thead" | "tbody" | "tfoot" => Some(format!(
            "`<{child}>` must be the child of a `<table>`, not a `<{parent}>`"
        )),
        "td" | "th" => Some(format!(
            "`<{child}>` must be the child of a `<tr>`, not a `<{parent}>`"
        )),
        "tr" => Some(format!(
            "`<tr>` must be the child of a `<thead>`, `<tbody>`, or `<tfoot>`, not a `<{parent}>`"
        )),
        _ => None,
    }
}

/// `is_tag_valid_with_ancestor`: `ancestors` runs from the parent outwards.
fn with_ancestor(child: &str, ancestors: &[&str]) -> Option<String> {
    if child.contains('-') {
        return None;
    }
    let (&ancestor, between) = ancestors.split_last()?;
    let Some(Disallowed::Descendant(list, reset_by)) = disallowed(ancestor) else {
        return None;
    };
    if !reset_by.is_empty()
        && between
            .iter()
            .rev()
            .any(|tag| tag.contains('-') || reset_by.contains(tag))
    {
        return None;
    }
    list.contains(&child)
        .then(|| format!("`<{child}>` cannot be a descendant of `<{ancestor}>`"))
}

impl Template<'_> {
    /// Checks the regular element `name` against its parent element and the ones above it; an
    /// error, or a warning when a block lies between, as the client renders that apart.
    pub(super) fn placement(&mut self, name: &str, span: Span) {
        let Some(parent) = self.parent_element else {
            return;
        };
        let mut only_warn = false;
        let mut past_parent = false;
        let mut ancestors = vec![parent];
        let mut found = Vec::new();
        for ancestor in self.ancestry.iter().rev() {
            match *ancestor {
                Ancestor::Block => only_warn = true,
                Ancestor::Element(tag) if !past_parent => {
                    if tag == parent {
                        found.extend(with_parent(name, parent).map(|m| (m, only_warn)));
                        past_parent = true;
                    }
                }
                Ancestor::Element(tag) => {
                    ancestors.push(tag);
                    found.extend(with_ancestor(name, &ancestors).map(|m| (m, only_warn)));
                }
                Ancestor::Boundary if past_parent => break,
                Ancestor::Boundary => {}
            }
        }
        for (message, only_warn) in found {
            if only_warn {
                let message = format!(
                    "{message}. When rendering this component on the server, the resulting HTML \
                        will be modified by the browser (by moving, removing, or inserting \
                        elements), likely resulting in a `hydration_mismatch` warning"
                );
                self.found.push(
                    Stage::Walk(super::Section::Template),
                    span.start_offset,
                    warning("node_invalid_placement_ssr", &message, span),
                );
            } else {
                let message = format!(
                    "{message}. The browser will 'repair' the HTML (by moving, removing, or \
                        inserting elements) which breaks Svelte's assumptions about the structure \
                        of your components."
                );
                self.error(span, error("node_invalid_placement", &message, span));
            }
        }
    }
}
