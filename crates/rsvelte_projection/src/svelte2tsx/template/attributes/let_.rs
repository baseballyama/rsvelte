//! `let:` directives. Mirrors `htmlxtojsx_v2/nodes/Let.ts`.

use std::fmt::Write;

use crate::ast::template::{Attribute, LetDirective};
use crate::svelte2tsx::template::utils::expr::get_expression_text;

pub(crate) fn iter_let_directives<'a, 'b>(
    attributes: &'b [Attribute<'a>],
) -> impl Iterator<Item = &'b LetDirective<'a>> + Clone {
    attributes.iter().filter_map(|attr| match attr {
        Attribute::LetDirective(let_dir) => Some(let_dir),
        _ => None,
    })
}

pub(crate) fn has_let_directives(attributes: &[Attribute]) -> bool {
    iter_let_directives(attributes).next().is_some()
}

/// Build the `let:` destructuring string for slot definitions.
///
/// Given `let:name={n} let:thing let:whatever={{ bla }}`, produces:
/// `name:n,thing,whatever:{ bla },`
pub(crate) fn build_let_destructure_string(attributes: &[Attribute], source: &str) -> String {
    let mut output = String::new();
    for let_dir in iter_let_directives(attributes) {
        if let Some(ref expr) = let_dir.expression {
            let expr_text = get_expression_text(expr, source);
            let _ = write!(output, "{}:{},", let_dir.name, expr_text);
        } else {
            let _ = write!(output, "{},", let_dir.name);
        }
    }
    output
}
