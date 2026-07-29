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

use crate::ast::template::{Fragment, Root};

use indexmap::{IndexMap, IndexSet};

use super::magic_string::MagicString;
use super::nodes::runes_detection::TemplateRunesDetector;
use super::svelte2tsx::Svelte2TsxOptions;
use ctx::Counter;

use walk::process_fragment_inplace;

// =============================================================================
// Template context for collecting slot/event information
// =============================================================================

/// Information collected during template processing.
#[derive(Debug, Default)]
pub struct TemplateInfo<'a> {
    /// Slots used in the component: slot_name -> list of prop strings.
    /// e.g., "default" -> ["a:b", "c:d"]
    pub slots: IndexMap<String, Vec<String>>,
    /// Events forwarded from elements / components (on:event without handler),
    /// in template-walk order. Each entry carries its source so the assembly can
    /// mirror the official `EventHandler` bubbled-events `Map` semantics: an
    /// `Element` forward does a plain `set` (overwrite), a `Component` forward
    /// concats into the existing entry (`unionType`).
    pub element_events: Vec<ForwardedEvent<'a>>,
    /// Slot names for the legacy `$$slots` declaration, collected only when used.
    pub dollar_slot_names: Option<Box<IndexSet<String>>>,
    pub uses_runes: bool,
}

impl TemplateInfo<'_> {
    fn empty(collect_dollar_slot_names: bool) -> Self {
        Self {
            dollar_slot_names: collect_dollar_slot_names.then(|| Box::new(IndexSet::new())),
            ..Self::default()
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ForwardedEvent<'a> {
    pub name: &'a str,
    pub source: ForwardedEventSource<'a>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ForwardedEventSource<'a> {
    Mapped(ForwardedEventMapper),
    Component(&'a str),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ForwardedEventMapper {
    Element,
    Body,
    Window,
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
    str: &mut MagicString<'_>,
    element_opener_comments: impl IntoIterator<Item = (u32, u32)>,
) {
    let mut counter = Counter::new(element_opener_comments);
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
pub fn collect_template_info<'a>(
    ast: &'a Root<'_>,
    source: &'a str,
    collect_dollar_slot_names: bool,
    check_await: bool,
    check_rune_global: bool,
    instance_value_names: &std::collections::HashSet<String>,
) -> TemplateInfo<'a> {
    let mut info = TemplateInfo::empty(collect_dollar_slot_names);
    let mut detector =
        TemplateRunesDetector::new(check_await, check_rune_global, instance_value_names);
    // `scope` maps an in-scope template binding name (e.g. an `{#each}` context
    // variable) to the expression that types it at the top level — for an each
    // block, `__sveltets_2_unwrapArr(<collection>)`. Slot props referencing
    // such a binding emit that expression instead of the bare name, so the
    // `slots: { … }` return reflects the element type. Mirrors official
    // `SlotHandler.getResolveExpressionStr` (EachBlock → unwrapArr).
    let mut scope: Vec<(String, String)> = Vec::new();
    collect::collect_info_from_fragment(
        &ast.fragment,
        source,
        &mut info,
        &mut scope,
        None,
        &mut detector,
        &ast.arena,
    );
    info.uses_runes = detector.uses_runes();
    info
}

pub fn collect_template_info_if_needed<'a>(
    ast: &'a Root<'_>,
    source: &'a str,
    collect_dollar_slot_names: bool,
    may_need_template_info: bool,
    check_await: bool,
    check_rune_global: bool,
    instance_value_names: &std::collections::HashSet<String>,
) -> TemplateInfo<'a> {
    if may_need_template_info || check_await || check_rune_global {
        collect_template_info(
            ast,
            source,
            collect_dollar_slot_names,
            check_await,
            check_rune_global,
            instance_value_names,
        )
    } else {
        TemplateInfo::empty(collect_dollar_slot_names)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::ast::template::Fragment;
    use crate::compiler::phases::phase1_parse::{self, ParseOptions};
    use crate::svelte2tsx::utils::source_features::scan_source_features;

    fn with_collected_info(
        source: &str,
        dollar_slots: bool,
        inspect: impl FnOnce(&TemplateInfo<'_>),
    ) {
        let ast = phase1_parse::parse_script_ts(
            source,
            ParseOptions {
                modern: true,
                ..Default::default()
            },
        )
        .expect("fixture should parse");
        let features = scan_source_features(source);
        let info = collect_template_info(
            &ast,
            source,
            dollar_slots,
            features.has_await_word,
            features.may_have_template_rune_global,
            &std::collections::HashSet::new(),
        );
        inspect(&info);
    }

    fn with_collected_info_if_needed(
        source: &str,
        dollar_slots: bool,
        may_need_template_info: bool,
        inspect: impl FnOnce(&TemplateInfo<'_>),
    ) {
        let ast = phase1_parse::parse_script_ts(
            source,
            ParseOptions {
                modern: true,
                ..Default::default()
            },
        )
        .expect("fixture should parse");
        let features = scan_source_features(source);
        let info = collect_template_info_if_needed(
            &ast,
            source,
            dollar_slots,
            may_need_template_info,
            features.has_await_word,
            features.may_have_template_rune_global,
            &std::collections::HashSet::new(),
        );
        inspect(&info);
    }

    fn assert_info_eq(actual: &TemplateInfo, expected: &TemplateInfo) {
        assert_eq!(actual.slots, expected.slots);
        assert_eq!(actual.element_events, expected.element_events);
        assert_eq!(actual.dollar_slot_names, expected.dollar_slot_names);
        assert_eq!(actual.uses_runes, expected.uses_runes);
    }

    #[test]
    fn test_process_empty_template() {
        let fragment = Fragment::default();
        let options = Svelte2TsxOptions::default();
        let mut str = MagicString::new("");
        process_template_inplace(&fragment, "", &options, &mut str, []);
        assert_eq!(str.to_string(), "");
    }

    #[test]
    fn slot_summary_ignores_script_and_raw_html_text() {
        with_collected_info(
            r#"<script>const marker = "<slot>";</script>{@html "<slot>"}<div />"#,
            true,
            |info| {
                assert!(info.slots.is_empty());
                assert_eq!(info.dollar_slot_names, Some(Box::new(IndexSet::new())));
            },
        );
    }

    #[test]
    fn slot_summary_preserves_current_names_order_and_duplicate_replacement() {
        let source = r#"{#if visible}<slot name="named" first={value} />{/if}
<div><slot /></div>
<slot name="named" last={value} />
<slot name={dynamic} />
<slot name="pre{dynamic}post" />"#;
        with_collected_info(source, true, |info| {
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
        });
    }

    #[test]
    fn slot_summary_skips_dollar_name_storage_when_unused() {
        with_collected_info("<slot name=\"named\" /><slot />", false, |info| {
            assert_eq!(info.slots.len(), 2);
            assert!(info.dollar_slot_names.is_none());
        });
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
            with_collected_info_if_needed(source, dollar_slots, false, |gated| {
                with_collected_info(source, dollar_slots, |collected| {
                    assert_info_eq(gated, collected);
                });
            });
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
            with_collected_info_if_needed(source, true, true, |gated| {
                with_collected_info(source, true, |collected| {
                    assert_info_eq(gated, collected);
                });
            });
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
            with_collected_info_if_needed(source, true, true, |gated| {
                with_collected_info(source, true, |collected| {
                    assert_info_eq(gated, collected);
                });
            });
        }
    }
}
