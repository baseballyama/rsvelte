use crate::rule::RuleDefinition;

mod button_has_type;
pub(crate) mod comment_directive;
mod compile_warnings;
mod no_unnecessary_condition;
mod no_unused_svelte_ignore;
mod no_unused_variables;
pub(crate) mod system;
mod valid_compile;
mod valid_each_key;

/// Every built-in rule.
pub(crate) static BUILT_IN: &[&RuleDefinition] = &[
    &no_unused_variables::RULE,
    &no_unnecessary_condition::RULE,
    &button_has_type::RULE,
    &comment_directive::RULE,
    &no_unused_svelte_ignore::RULE,
    &system::RULE,
    &valid_compile::RULE,
    &valid_each_key::RULE,
];
