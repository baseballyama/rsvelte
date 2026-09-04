use oxc_parser::ParseOptions as OxcParseOptions;

mod await_block;
mod call_args;
mod collect;
mod declaration;
mod directive;
mod format_core;
pub(crate) mod raw_expr;
mod splice;
mod text;
mod width;

#[cfg(test)]
mod tests;

pub(crate) use await_block::plan as plan_await_block;
pub use collect::collect_template_edits;
pub use declaration::format_pattern_source;
pub use directive::{
    format_directive_value, format_directive_value_extra, format_function_binding,
};
pub use format_core::clear_expr_memo;
pub use text::expand_obj_arg_call;
pub use width::{
    format_attribute_value_expression, format_attribute_value_expression_at_width,
    format_attribute_value_expression_flat, format_expression_source, reformat_content_at_width,
};

fn formatter_parse_options() -> OxcParseOptions {
    OxcParseOptions {
        preserve_parens: false,
        ..OxcParseOptions::default()
    }
}
