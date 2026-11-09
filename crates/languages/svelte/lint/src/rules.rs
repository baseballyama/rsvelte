use crate::rule::RuleDefinition;

mod block_lang;
mod button_has_type;
mod max_lines_per_block;
mod no_unused_variables;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &block_lang::RULE,
    &button_has_type::RULE,
    &max_lines_per_block::RULE,
    &valid_each_key::RULE,
];
