//! `let:` directives. Mirrors `htmlxtojsx_v2/nodes/Let.ts`.

use crate::ast::template::{Attribute, LetDirective};
use crate::svelte2tsx::template::utils::expr::get_expression_text;

/// Collect `let:` directives from an attribute list.
pub(crate) fn get_let_directives<'a>(attributes: &'a [Attribute<'a>]) -> Vec<&'a LetDirective<'a>> {
    attributes
        .iter()
        .filter_map(|attr| match attr {
            Attribute::LetDirective(let_dir) => Some(let_dir),
            _ => None,
        })
        .collect()
}

/// Build the `let:` destructuring string for slot definitions.
///
/// Given `let:name={n} let:thing let:whatever={{ bla }}`, produces:
/// `name:n,thing,whatever:{ bla },`
pub(crate) fn build_let_destructure_string(
    let_directives: &[&LetDirective],
    source: &str,
) -> String {
    let mut parts = Vec::new();
    for let_dir in let_directives {
        if let Some(ref expr) = let_dir.expression {
            let expr_text = get_expression_text(expr, source);
            parts.push(format!("{}:{},", let_dir.name, expr_text));
        } else {
            // Shorthand: `let:thing` → `thing,`
            parts.push(format!("{},", let_dir.name));
        }
    }
    parts.join("")
}
