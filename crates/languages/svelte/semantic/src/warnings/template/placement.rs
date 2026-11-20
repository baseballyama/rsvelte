//! `node_invalid_placement` and `node_invalid_placement_ssr` (`html-tree-validation.js`): an
//! element that the browser's HTML parser would move away from where it is written.

use rsvelte_kernel::source::positions::Span;

use super::super::{error, warning};
use super::{Stage, Template};
use crate::html_tree::{invalid_with_ancestor, invalid_with_parent};

/// What encloses the node being walked, as the placement check looks outwards.
#[derive(Clone, Copy)]
pub(super) enum Ancestor<'a> {
    Element(&'a str),
    /// `{#if}`, `{#each}`, `{#await}` or `{#key}`, which the client renders as its own template.
    Block,
    /// A component, `<svelte:element>`, `<svelte:self>` or `{#snippet}`, where the check stops.
    Boundary,
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
                        found.extend(invalid_with_parent(name, parent).map(|m| (m, only_warn)));
                        past_parent = true;
                    }
                }
                Ancestor::Element(tag) => {
                    ancestors.push(tag);
                    found.extend(invalid_with_ancestor(name, &ancestors).map(|m| (m, only_warn)));
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
