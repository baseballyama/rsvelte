//! Open-tag attribute normalization.
//!
//! Rewrites every element's open tag (`<tag attr1 attr2 ...>` or `... />`)
//! with one normalized form per element. The rewrite includes the
//! attribute list, so attribute-level expressions are formatted inline
//! and the separate "edit per attribute expression" path in
//! [`crate::expression`] is bypassed for everything inside an element's
//! open tag.
//!
//! What this module owns:
//! - Element open tags for every variant in [`TemplateNode`] that has
//!   attributes (`RegularElement`, `Component`, `SvelteComponent`,
//!   `SvelteElement`, `SlotElement`, `TitleElement`, plus the
//!   `Svelte*` special-element family).
//! - Attribute rendering (one space between attrs, normalized
//!   self-closing as ` />`, shorthand for `name={name}` and
//!   `bind:name={name}` / `class:name={name}`).
//! - `this={X}` expressions on `<svelte:component>` and
//!   `<svelte:element>` — they live in the open tag.
//!
//! What it does NOT own (those edits still come from
//! [`crate::expression`]):
//! - Template-position `{expr}`, `{@html ...}`, `{@render ...}`,
//!   `{@debug ...}`, `{@attach ...}` standalone tags
//! - Block headers (`{#if EXPR}`, `{#each ...}`, ...)
//! - Children fragments (recursed into separately by the caller)

mod attribute;
mod close_tag;
mod directive;
mod elements;
mod open_tag;
mod render_tag;
mod util;
mod value;
mod value_sequence;
mod walk;

pub use elements::is_html_block_display_element;
pub use walk::{collect_open_tag_edits, collect_options_open_tag_edit};
