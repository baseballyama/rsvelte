//! Utility functions for the analyzer.
//!
//! Corresponds to Svelte's `2-analyze/utils/` directory.

mod check_graph_for_cycles;

pub use check_graph_for_cycles::check_graph_for_cycles;

use lazy_static::lazy_static;
use regex::Regex;

use crate::compiler::phases::phase1_parse::utils::fuzzymatch::fuzzymatch;
use crate::compiler::phases::phase2_analyze::warnings;

lazy_static! {
    static ref SVELTE_IGNORE_REGEX: Regex = Regex::new(r"^\s*svelte-ignore\s").unwrap();
}

/// All valid warning codes from the Svelte compiler.
/// Corresponds to `codes` in Svelte's `warnings.js` + `IGNORABLE_RUNTIME_WARNINGS`.
const VALID_WARNING_CODES: &[&str] = &[
    // Compiler warnings (from warnings.js codes array)
    "a11y_accesskey",
    "a11y_aria_activedescendant_has_tabindex",
    "a11y_aria_attributes",
    "a11y_autocomplete_valid",
    "a11y_autofocus",
    "a11y_click_events_have_key_events",
    "a11y_consider_explicit_label",
    "a11y_distracting_elements",
    "a11y_figcaption_index",
    "a11y_figcaption_parent",
    "a11y_hidden",
    "a11y_img_redundant_alt",
    "a11y_incorrect_aria_attribute_type",
    "a11y_incorrect_aria_attribute_type_boolean",
    "a11y_incorrect_aria_attribute_type_id",
    "a11y_incorrect_aria_attribute_type_idlist",
    "a11y_incorrect_aria_attribute_type_integer",
    "a11y_incorrect_aria_attribute_type_token",
    "a11y_incorrect_aria_attribute_type_tokenlist",
    "a11y_incorrect_aria_attribute_type_tristate",
    "a11y_interactive_supports_focus",
    "a11y_invalid_attribute",
    "a11y_label_has_associated_control",
    "a11y_media_has_caption",
    "a11y_misplaced_role",
    "a11y_misplaced_scope",
    "a11y_missing_attribute",
    "a11y_missing_content",
    "a11y_mouse_events_have_key_events",
    "a11y_no_abstract_role",
    "a11y_no_interactive_element_to_noninteractive_role",
    "a11y_no_noninteractive_element_interactions",
    "a11y_no_noninteractive_element_to_interactive_role",
    "a11y_no_noninteractive_tabindex",
    "a11y_no_redundant_roles",
    "a11y_no_static_element_interactions",
    "a11y_positive_tabindex",
    "a11y_role_has_required_aria_props",
    "a11y_role_supports_aria_props",
    "a11y_role_supports_aria_props_implicit",
    "a11y_unknown_aria_attribute",
    "a11y_unknown_role",
    "bidirectional_control_characters",
    "legacy_code",
    "unknown_code",
    "options_deprecated_accessors",
    "options_deprecated_immutable",
    "options_missing_custom_element",
    "options_removed_enable_sourcemap",
    "options_removed_hydratable",
    "options_removed_loop_guard_timeout",
    "options_renamed_ssr_dom",
    "custom_element_props_identifier",
    "export_let_unused",
    "legacy_component_creation",
    "non_reactive_update",
    "perf_avoid_inline_class",
    "perf_avoid_nested_class",
    "reactive_declaration_invalid_placement",
    "reactive_declaration_module_script_dependency",
    "state_referenced_locally",
    "store_rune_conflict",
    "css_unused_selector",
    "attribute_avoid_is",
    "attribute_global_event_reference",
    "attribute_illegal_colon",
    "attribute_invalid_property_name",
    "attribute_quoted",
    "bind_invalid_each_rest",
    "block_empty",
    "component_name_lowercase",
    "element_implicitly_closed",
    "element_invalid_self_closing_tag",
    "event_directive_deprecated",
    "node_invalid_placement_ssr",
    "script_context_deprecated",
    "script_unknown_attribute",
    "slot_element_deprecated",
    "svelte_component_deprecated",
    "svelte_element_invalid_this",
    "svelte_self_deprecated",
    // Ignorable runtime warnings (from IGNORABLE_RUNTIME_WARNINGS)
    "await_waterfall",
    "await_reactivity_loss",
    "state_snapshot_uncloneable",
    "binding_property_non_reactive",
    "hydration_attribute_changed",
    "hydration_html_changed",
    "ownership_invalid_binding",
    "ownership_invalid_mutation",
];

/// Check if a code is a valid warning code.
fn is_valid_code(code: &str) -> bool {
    VALID_WARNING_CODES.contains(&code)
}

/// The full set of compiler/validator/a11y warning codes rsvelte can emit.
///
/// This is the single source of truth consumed by external tooling (e.g. the
/// `@rsvelte/oxlint-plugin` rule catalog) to enumerate the diagnostic ids that
/// come from the compiler warning wrap rather than from a native lint
/// [`RuleMeta`](crate::compiler) rule.
pub fn valid_warning_codes() -> &'static [&'static str] {
    VALID_WARNING_CODES
}

/// Map of legacy warning codes to new codes.
/// Corresponds to `replacements` in Svelte's extract_svelte_ignore.js.
fn get_replacement(code: &str) -> Option<&'static str> {
    match code {
        "non-top-level-reactive-declaration" => Some("reactive_declaration_invalid_placement"),
        "module-script-reactive-declaration" => Some("reactive_declaration_module_script"),
        "empty-block" => Some("block_empty"),
        "avoid-is" => Some("attribute_avoid_is"),
        "invalid-html-attribute" => Some("attribute_invalid_property_name"),
        "a11y-structure" => Some("a11y_figcaption_parent"),
        "illegal-attribute-character" => Some("attribute_illegal_colon"),
        "invalid-rest-eachblock-binding" => Some("bind_invalid_each_rest"),
        "unused-export-let" => Some("export_let_unused"),
        _ => None,
    }
}

/// Result of extracting svelte-ignore codes from a comment.
pub struct SvelteIgnoreResult {
    /// Codes to ignore (only valid, recognized codes).
    pub ignores: Vec<String>,
    /// Warnings generated during extraction (legacy_code, unknown_code).
    pub warnings: Vec<warnings::AnalysisWarning>,
}

/// Extract svelte-ignore codes from a comment.
///
/// Corresponds to `extract_svelte_ignore` in Svelte's extract_svelte_ignore.js.
///
/// # Arguments
///
/// * `text` - The comment text (without the `<!--` and `-->` delimiters)
/// * `runes` - Whether we're in runes mode (affects parsing strictness)
///
/// # Returns
///
/// A vector of warning codes to ignore.
pub fn extract_svelte_ignore(text: &str, runes: bool) -> Vec<String> {
    extract_svelte_ignore_with_warnings(text, runes).ignores
}

/// Extract svelte-ignore codes from a comment, returning both ignores and warnings.
///
/// In runes mode, this validates codes against the known valid codes list:
/// - Valid codes are added to the ignores list
/// - Legacy codes (hyphenated) that have valid replacements emit `legacy_code` warnings
/// - Unrecognized codes emit `unknown_code` warnings with optional fuzzy match suggestions
///
/// Corresponds to `extract_svelte_ignore` in Svelte's extract_svelte_ignore.js.
pub fn extract_svelte_ignore_with_warnings(text: &str, runes: bool) -> SvelteIgnoreResult {
    let Some(captures) = SVELTE_IGNORE_REGEX.find(text) else {
        return SvelteIgnoreResult {
            ignores: Vec::new(),
            warnings: Vec::new(),
        };
    };

    let rest = &text[captures.end()..];
    let mut ignores = Vec::new();
    let mut emit_warnings = Vec::new();

    if runes {
        // Runes mode: warnings must be separated by commas
        // Everything after the last comma-separated warning is prose
        lazy_static! {
            static ref RUNES_CODE_REGEX: Regex = Regex::new(r"([\w$-]+)(,)?").unwrap();
        }

        for caps in RUNES_CODE_REGEX.captures_iter(rest) {
            let code = &caps[1];

            if is_valid_code(code) {
                // Directly recognized code
                ignores.push(code.to_string());
            } else {
                // Try replacement or snake_case conversion
                let replacement = get_replacement(code)
                    .map(|s| s.to_string())
                    .unwrap_or_else(|| code.replace('-', "_"));

                if is_valid_code(&replacement) {
                    // Legacy code with a valid replacement
                    emit_warnings.push(warnings::legacy_code(code, &replacement));
                } else {
                    // Unknown code - try fuzzy matching
                    let codes_vec: Vec<&str> = VALID_WARNING_CODES.to_vec();
                    let suggestion = fuzzymatch(code, &codes_vec);
                    emit_warnings.push(warnings::unknown_code(code, suggestion.as_deref()));
                }
            }

            // Stop if no trailing comma
            if caps.get(2).is_none() {
                break;
            }
        }
    } else {
        // Non-runes mode: lax parsing, collect all word-like tokens
        lazy_static! {
            static ref LEGACY_CODE_REGEX: Regex = Regex::new(r"[\w$-]+").unwrap();
        }

        for mat in LEGACY_CODE_REGEX.find_iter(rest) {
            let code = mat.as_str();
            ignores.push(code.to_string());

            // Also add the replacement/transformed version
            if !is_valid_code(code) {
                let replacement = get_replacement(code)
                    .map(|s| s.to_string())
                    .unwrap_or_else(|| code.replace('-', "_"));

                if is_valid_code(&replacement) {
                    ignores.push(replacement);
                }
            }
        }
    }

    SvelteIgnoreResult {
        ignores,
        warnings: emit_warnings,
    }
}
