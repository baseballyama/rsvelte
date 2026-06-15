//! The built-in native rule set.
//!
//! Wave 1 ships a seed of pure-syntactic rules to exercise the engine; the bulk
//! of day-one coverage comes from the validator wrap
//! ([`validator`](crate::validator)), not from these.

use crate::rule::{Rule, RuleMeta};
use crate::rules::{
    button_has_type::ButtonHasType, no_at_debug_tags::NoAtDebugTags, no_at_html_tags::NoAtHtmlTags,
    no_dupe_else_if_blocks::NoDupeElseIfBlocks, no_dupe_on_directives::NoDupeOnDirectives,
    no_dupe_style_properties::NoDupeStyleProperties, no_dupe_use_directives::NoDupeUseDirectives,
    no_inspect::NoInspect, no_not_function_handler::NoNotFunctionHandler,
    no_object_in_text_mustaches::NoObjectInTextMustaches,
    no_raw_special_elements::NoRawSpecialElements,
    no_restricted_html_elements::NoRestrictedHtmlElements, no_svelte_internal::NoSvelteInternal,
    no_target_blank::NoTargetBlank, no_useless_children_snippet::NoUselessChildrenSnippet,
    no_useless_mustaches::NoUselessMustaches, require_each_key::RequireEachKey,
    valid_each_key::ValidEachKey,
};

/// Every registered rule's `&'static RuleMeta`, across both the template-AST
/// rule set ([`all_rules`]) and the script-AST rule set ([`all_script_rules`]).
///
/// This is the single source of truth for "which rules ship" — `--list-rules`,
/// the ESLint-disable config, and the compat oracle all derive their rule
/// universe from it, so a rule added to either registry is automatically
/// surfaced everywhere (and subjected to upstream-fixture parity).
pub fn registered_rule_metas() -> Vec<&'static RuleMeta> {
    all_rules()
        .iter()
        .map(|r| r.meta())
        .chain(all_script_rules().iter().map(|r| r.meta()))
        .collect()
}

/// Construct the full set of native rules.
pub fn all_rules() -> Vec<Box<dyn Rule>> {
    vec![
        Box::new(NoAtHtmlTags),
        Box::new(RequireEachKey),
        Box::new(NoAtDebugTags),
        Box::new(ButtonHasType),
        Box::new(NoDupeElseIfBlocks),
        Box::new(NoDupeStyleProperties),
        Box::new(NoObjectInTextMustaches),
        Box::new(NoRestrictedHtmlElements),
        Box::new(NoDupeOnDirectives),
        Box::new(NoDupeUseDirectives),
        Box::new(NoRawSpecialElements),
        Box::new(NoUselessChildrenSnippet),
        Box::new(ValidEachKey),
        Box::new(NoNotFunctionHandler),
        Box::new(NoSvelteInternal),
        Box::new(NoInspect),
        Box::new(NoUselessMustaches),
        Box::new(NoTargetBlank),
        Box::new(crate::rules::no_at_const_tags::NoAtConstTags),
        Box::new(crate::rules::no_dynamic_slot_name::NoDynamicSlotName),
        Box::new(crate::rules::no_nested_style_tag::NoNestedStyleTag),
        Box::new(
            crate::rules::no_shorthand_style_property_overrides::NoShorthandStylePropertyOverrides,
        ),
        Box::new(
            crate::rules::no_unknown_style_directive_property::NoUnknownStyleDirectiveProperty,
        ),
        Box::new(crate::rules::no_inline_styles::NoInlineStyles),
        Box::new(crate::rules::prefer_destructured_store_props::PreferDestructuredStoreProps),
        Box::new(crate::rules::require_store_reactive_access::RequireStoreReactiveAccess),
        Box::new(crate::rules::max_lines_per_block::MaxLinesPerBlock),
        Box::new(crate::rules::no_navigation_without_base::NoNavigationWithoutBase),
        Box::new(
            crate::rules::no_spaces_around_equal_signs_in_attribute::NoSpacesAroundEqualSignsInAttribute,
        ),
        Box::new(crate::rules::spaced_html_comment::SpacedHtmlComment),
        Box::new(crate::rules::shorthand_attribute::ShorthandAttribute),
        Box::new(crate::rules::shorthand_directive::ShorthandDirective),
        Box::new(crate::rules::html_quotes::HtmlQuotes),
        Box::new(crate::rules::first_attribute_linebreak::FirstAttributeLinebreak),
        Box::new(crate::rules::html_closing_bracket_spacing::HtmlClosingBracketSpacing),
        Box::new(crate::rules::html_self_closing::HtmlSelfClosing),
        Box::new(crate::rules::mustache_spacing::MustacheSpacing),
        Box::new(crate::rules::no_trailing_spaces::NoTrailingSpaces),
        Box::new(crate::rules::html_closing_bracket_new_line::HtmlClosingBracketNewLine),
        Box::new(crate::rules::max_attributes_per_line::MaxAttributesPerLine),
        Box::new(crate::rules::sort_attributes::SortAttributes),
        Box::new(crate::rules::prefer_class_directive::PreferClassDirective),
        Box::new(crate::rules::prefer_style_directive::PreferStyleDirective),
        Box::new(crate::rules::require_optimized_style_attribute::RequireOptimizedStyleAttribute),
        Box::new(crate::rules::block_lang::BlockLang),
        Box::new(crate::rules::no_unused_class_name::NoUnusedClassName),
        Box::new(crate::rules::consistent_selector_style::ConsistentSelectorStyle),
    ]
}

/// Construct the full set of script-AST rules (rules that walk the `<script>`
/// ESTree program rather than the template tree).
pub fn all_script_rules() -> Vec<Box<dyn crate::script::ScriptRule>> {
    use crate::rules::no_add_event_listener::NoAddEventListener;
    use crate::rules::no_dom_manipulating::NoDomManipulating;
    use crate::rules::no_extra_reactive_curlies::NoExtraReactiveCurlies;
    use crate::rules::no_goto_without_base::NoGotoWithoutBase;
    use crate::rules::no_ignored_unsubscribe::NoIgnoredUnsubscribe;
    use crate::rules::no_immutable_reactive_statements::NoImmutableReactiveStatements;
    use crate::rules::no_inner_declarations::NoInnerDeclarations;
    use crate::rules::no_reactive_functions::NoReactiveFunctions;
    use crate::rules::no_reactive_literals::NoReactiveLiterals;
    use crate::rules::no_reactive_reassign::NoReactiveReassign;
    use crate::rules::no_store_async::NoStoreAsync;
    use crate::rules::no_top_level_browser_globals::NoTopLevelBrowserGlobals;
    use crate::rules::no_unnecessary_state_wrap::NoUnnecessaryStateWrap;
    use crate::rules::prefer_const::PreferConst;
    use crate::rules::prefer_derived_over_derived_by::PreferDerivedOverDerivedBy;
    use crate::rules::prefer_svelte_reactivity::PreferSvelteReactivity;
    use crate::rules::prefer_writable_derived::PreferWritableDerived;
    use crate::rules::require_store_callbacks_use_set_param::RequireStoreCallbacksUseSetParam;
    use crate::rules::require_stores_init::RequireStoresInit;
    vec![
        Box::new(NoInnerDeclarations),
        Box::new(PreferSvelteReactivity),
        Box::new(NoStoreAsync),
        Box::new(NoAddEventListener),
        Box::new(PreferDerivedOverDerivedBy),
        Box::new(NoIgnoredUnsubscribe),
        Box::new(RequireStoresInit),
        Box::new(RequireStoreCallbacksUseSetParam),
        Box::new(NoTopLevelBrowserGlobals),
        Box::new(PreferConst),
        Box::new(NoReactiveLiterals),
        Box::new(PreferWritableDerived),
        Box::new(NoUnnecessaryStateWrap),
        Box::new(NoReactiveFunctions),
        Box::new(NoExtraReactiveCurlies),
        Box::new(NoGotoWithoutBase),
        Box::new(NoImmutableReactiveStatements),
        Box::new(NoDomManipulating),
        Box::new(NoReactiveReassign),
        Box::new(crate::rules::derived_has_same_inputs_outputs::DerivedHasSameInputsOutputs),
        Box::new(
            crate::rules::valid_prop_names_in_kit_pages::ValidPropNamesInKitPages,
        ),
        Box::new(
            crate::rules::no_export_load_in_svelte_module_in_kit_pages::NoExportLoadInSvelteModuleInKitPages,
        ),
        Box::new(crate::rules::infinite_reactive_loop::InfiniteReactiveLoop),
    ]
}
