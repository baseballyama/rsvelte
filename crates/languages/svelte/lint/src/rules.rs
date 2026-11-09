use crate::rule::RuleDefinition;

mod button_has_type;
mod element_kind;
mod no_dupe_style_properties;
mod no_inline_styles;
mod no_shorthand_style_property_overrides;
mod no_unused_variables;
mod prefer_style_directive;
mod require_optimized_style_attribute;
pub(crate) mod style_attribute;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &button_has_type::RULE,
    &no_dupe_style_properties::RULE,
    &no_inline_styles::RULE,
    &no_shorthand_style_property_overrides::RULE,
    &prefer_style_directive::RULE,
    &require_optimized_style_attribute::RULE,
    &valid_each_key::RULE,
];
