//! Template processing for svelte2tsx.
//!
//! Converts Svelte template AST nodes into TSX expressions for type checking
//! by modifying the source in-place using MagicString.
//!
//! Each template node type has a corresponding handler that overwrites the
//! original source range with the appropriate TypeScript/TSX code.

mod attributes;
mod collect;
mod ctx;
mod nodes;
mod segs;
mod utils;
mod walk;

use crate::ast::template::Fragment;

use indexmap::{IndexMap, IndexSet};

use super::magic_string::MagicString;
use super::svelte2tsx::Svelte2TsxOptions;
use ctx::Counter;

pub(crate) use ctx::{clear_element_opener_comments, set_element_opener_comments};
use walk::process_fragment_inplace;

// =============================================================================
// Template context for collecting slot/event information
// =============================================================================

/// Information collected during template processing.
#[derive(Debug, Default)]
pub struct TemplateInfo {
    /// Slots used in the component: slot_name -> list of prop strings.
    /// e.g., "default" -> ["a:b", "c:d"]
    pub slots: IndexMap<String, Vec<String>>,
    /// Events forwarded from elements / components (on:event without handler),
    /// in template-walk order. Each entry carries the kind so the assembly can
    /// mirror the official `EventHandler` bubbled-events `Map` semantics: an
    /// `Element` forward does a plain `set` (overwrite), a `Component` forward
    /// concats into the existing entry (`unionType`).
    /// e.g., "click" -> "__sveltets_2_mapElementEvent('click')"
    pub element_events: Vec<(String, String, ForwardedEventKind)>,
    /// Slot names for the legacy `$$slots` declaration, collected only when used.
    pub dollar_slot_names: Option<Box<IndexSet<String>>>,
}

impl TemplateInfo {
    fn empty(collect_dollar_slot_names: bool) -> Self {
        Self {
            dollar_slot_names: collect_dollar_slot_names.then(|| Box::new(IndexSet::new())),
            ..Self::default()
        }
    }
}

/// How a forwarded event (`on:event` with no handler) combines with an existing
/// entry for the same event name, mirroring the official
/// `event-handler.ts` `EventHandler` map.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ForwardedEventKind {
    /// Element / `svelte:window` / `svelte:body` / `svelte:element` etc. —
    /// official `bubbledEvents.set(name, expr)` (plain overwrite).
    Element,
    /// Component / `svelte:component` — official `handleEventHandlerBubble`
    /// concats into the existing entry.
    Component,
}

// =============================================================================
// Main entry point
// =============================================================================

/// Process the template fragment by modifying the MagicString in-place.
///
/// Walks the fragment's nodes and overwrites template node ranges with TSX
/// equivalents. The MagicString is modified directly.
///
/// Returns `TemplateInfo` containing collected slot/event information for
/// use in the return statement.
pub fn process_template_inplace(
    fragment: &Fragment,
    source: &str,
    _options: &Svelte2TsxOptions,
    str: &mut MagicString,
) {
    let mut counter = Counter::new();
    // depth 0 = root fragment; elements and components increment it for their children
    process_fragment_inplace(fragment, source, _options, str, &mut counter, 0);

    // NOTE: trailing whitespace after the last template node is left untouched.
    // Official svelte2tsx keeps it (the source `\n` ends up between the template
    // output and the appended async wrapper `};`); oxfmt normalises it away for
    // valid output, but a top-level-await component is emitted raw, where
    // blanking the trailing newline diverged from official.
}

/// Collect slot and event information from the template AST.
///
/// This is a pre-pass that walks the AST to collect:
/// - Slot elements with their props (for the return statement `slots: {...}`)
/// - Forwarded events (for the return statement `events: {...}`)
pub fn collect_template_info(
    fragment: &Fragment,
    source: &str,
    collect_dollar_slot_names: bool,
) -> TemplateInfo {
    let mut info = TemplateInfo::empty(collect_dollar_slot_names);
    // `scope` maps an in-scope template binding name (e.g. an `{#each}` context
    // variable) to the expression that types it at the top level — for an each
    // block, `__sveltets_2_unwrapArr(<collection>)`. Slot props referencing
    // such a binding emit that expression instead of the bare name, so the
    // `slots: { … }` return reflects the element type. Mirrors official
    // `SlotHandler.getResolveExpressionStr` (EachBlock → unwrapArr).
    let mut scope: Vec<(String, String)> = Vec::new();
    collect::collect_info_from_fragment(fragment, source, &mut info, &mut scope, None);
    info
}

pub fn collect_template_info_if_needed(
    fragment: &Fragment,
    source: &str,
    collect_dollar_slot_names: bool,
    may_need_template_info: bool,
) -> TemplateInfo {
    if may_need_template_info {
        collect_template_info(fragment, source, collect_dollar_slot_names)
    } else {
        TemplateInfo::empty(collect_dollar_slot_names)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::Fragment;
    use crate::compiler::phases::phase1_parse::{self, ParseOptions};

    fn collect(source: &str, dollar_slots: bool) -> TemplateInfo {
        let ast = phase1_parse::parse_script_ts(
            source,
            ParseOptions {
                modern: true,
                ..Default::default()
            },
        )
        .expect("fixture should parse");
        collect_template_info(&ast.fragment, source, dollar_slots)
    }

    fn collect_if_needed(
        source: &str,
        dollar_slots: bool,
        may_need_template_info: bool,
    ) -> TemplateInfo {
        let ast = phase1_parse::parse_script_ts(
            source,
            ParseOptions {
                modern: true,
                ..Default::default()
            },
        )
        .expect("fixture should parse");
        collect_template_info_if_needed(&ast.fragment, source, dollar_slots, may_need_template_info)
    }

    fn assert_info_eq(actual: &TemplateInfo, expected: &TemplateInfo) {
        assert_eq!(actual.slots, expected.slots);
        assert_eq!(actual.element_events, expected.element_events);
        assert_eq!(actual.dollar_slot_names, expected.dollar_slot_names);
    }

    #[test]
    fn test_process_empty_template() {
        let fragment = Fragment::default();
        let options = Svelte2TsxOptions::default();
        let mut str = MagicString::new("");
        process_template_inplace(&fragment, "", &options, &mut str);
        assert_eq!(str.to_string(), "");
    }

    #[test]
    fn slot_summary_ignores_script_and_raw_html_text() {
        let info = collect(
            r#"<script>const marker = "<slot>";</script>{@html "<slot>"}<div />"#,
            true,
        );
        assert!(info.slots.is_empty());
        assert_eq!(info.dollar_slot_names, Some(Box::new(IndexSet::new())));
    }

    #[test]
    fn slot_summary_preserves_current_names_order_and_duplicate_replacement() {
        let source = r#"{#if visible}<slot name="named" first={value} />{/if}
<div><slot /></div>
<slot name="named" last={value} />
<slot name={dynamic} />
<slot name="pre{dynamic}post" />"#;
        let info = collect(source, true);

        assert_eq!(
            info.slots.keys().map(String::as_str).collect::<Vec<_>>(),
            vec!["named", "default", "undefined"]
        );
        let dollar_names = IndexSet::from([
            "named".to_string(),
            "default".to_string(),
            "post".to_string(),
        ]);
        assert_eq!(info.dollar_slot_names.as_deref(), Some(&dollar_names));
        let named = info.slots.get("named").expect("named slot");
        assert_eq!(named.len(), 1);
        assert!(named[0].contains("last"));
    }

    #[test]
    fn slot_summary_skips_dollar_name_storage_when_unused() {
        let info = collect("<slot name=\"named\" /><slot />", false);
        assert_eq!(info.slots.len(), 2);
        assert!(info.dollar_slot_names.is_none());
    }

    #[test]
    fn negative_gate_matches_collection_for_empty_template_info() {
        for (source, dollar_slots) in [
            ("<div>plain text</div><Component />", false),
            (
                r#"<script>void $$slots;</script><div>plain text</div>"#,
                true,
            ),
        ] {
            let gated = collect_if_needed(source, dollar_slots, false);
            let collected = collect(source, dollar_slots);
            assert_info_eq(&gated, &collected);
        }
    }

    #[test]
    fn conservative_false_positives_match_collection() {
        for source in [
            r#"<script>const marker = "<slot>";</script><div />"#,
            r#"<script>const marker = "on:";</script><div />"#,
            "<!-- <slot on:click> --><div />",
            r#"<div title="<slot" data-event="on:" />"#,
        ] {
            let gated = collect_if_needed(source, true, true);
            let collected = collect(source, true);
            assert_info_eq(&gated, &collected);
        }
    }

    #[test]
    fn positive_gate_collects_slots_and_forwarded_events() {
        for source in [
            r#"<slot name="named" value={item} />"#,
            "<button on:click />",
            "<Component on:change />",
            r#"{#if visible}
                <section>
                    <slot name="nested" value={item} />
                    <button on:click />
                </section>
            {/if}
            <Component on:change />"#,
        ] {
            let gated = collect_if_needed(source, true, true);
            let collected = collect(source, true);
            assert_info_eq(&gated, &collected);
        }
    }
}
