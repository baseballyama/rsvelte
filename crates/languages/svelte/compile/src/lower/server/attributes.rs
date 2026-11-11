mod class;
mod style;
mod with_spread;
mod without_spread;

use crate::lower::builder::Runtime;
use oxc_ast::ast::Expression;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

use super::{
    Attribute, AttributeValue, Part, ServerCompilationContext, decode_attribute, escape_markup,
    known_string, needs_clsx,
};

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `build_attribute_value` (server), with text as written: an element's caller
    /// escapes it, a component's does not. A `class` written as one unquoted expression goes
    /// through `$.clsx` when upstream's `needs_clsx`.
    pub(super) fn attribute_value(&self, a: &Attribute, trim: bool, class: bool) -> Expression<'o> {
        let b = self.b;
        let parts = match &a.value {
            &AttributeValue::Expression { expression, quoted } => {
                let v = self.expression(expression);
                return if class
                    && !quoted
                    && needs_clsx(
                        self.javascript
                            .get_expression(expression)
                            .get_inner_expression(),
                    ) {
                    b.runtime("clsx", [v])
                } else {
                    v
                };
            }
            &AttributeValue::Shorthand(expression) => {
                let v = self.expression(expression);
                return if class
                    && needs_clsx(
                        self.javascript
                            .get_expression(expression)
                            .get_inner_expression(),
                    ) {
                    b.runtime("clsx", [v])
                } else {
                    v
                };
            }
            AttributeValue::Interpolated(parts) => parts,
            AttributeValue::Boolean => return b.boolean(true),
            AttributeValue::Static(v) => return b.string(&attribute_text(v, trim)),
            _ => {
                unreachable!("directives are handled by the caller")
            }
        };
        self.interpolated(parts, trim)
    }

    /// Upstream `build_attribute_value` for text with `{expression}`s: one template literal.
    pub(super) fn interpolated(&self, parts: &[Part], trim: bool) -> Expression<'o> {
        let b = self.b;
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for p in parts {
            match p {
                Part::Text(s) => {
                    let data = decode_attribute(s.text(self.source_text));
                    let data = if trim {
                        collapse_ws(&data)
                    } else {
                        data.into_owned()
                    };
                    quasis.last_mut().expect("never empty").push_str(&data);
                }
                Part::Expression { expression, .. } => {
                    let evaluated = self.evaluate(*expression);
                    if evaluated.is_known {
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&known_string(&evaluated.value));
                    } else {
                        let v = self.expression(*expression);
                        let v = if evaluated.is_string && evaluated.is_defined {
                            v
                        } else {
                            b.runtime("stringify", [v])
                        };
                        expressions.push(v);
                        quasis.push(String::new());
                    }
                }
            }
        }
        if expressions.is_empty() {
            return b.string(&quasis[0]);
        }
        b.template(quasis.iter().map(String::as_str), expressions)
    }
}

/// A class value with the stylesheet's hash, trimmed as upstream's `.trim()` does; the hash has
/// no whitespace to trim.
fn scoped_class(value: &str, hash: &str) -> String {
    match value.trim_start_matches(is_ecmascript_whitespace) {
        "" => hash.to_owned(),
        value => format!("{value} {hash}"),
    }
}

fn attribute_text(data: &str, trim: bool) -> String {
    if trim {
        collapse_ws(data)
            .trim_matches(is_ecmascript_whitespace)
            .to_owned()
    } else {
        data.to_owned()
    }
}

/// An element's static attribute value, escaped for a quoted attribute.
fn escaped_text(data: &str, trim: bool) -> String {
    escape_markup(&attribute_text(data, trim), true).into_owned()
}

/// `regex_whitespaces_strict` → `' '`.
fn collapse_ws(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_ws = false;
    for ch in s.chars() {
        if matches!(ch, ' ' | '\t' | '\n' | '\r' | '\u{c}') {
            if !in_ws {
                out.push(' ');
            }
            in_ws = true;
        } else {
            out.push(ch);
            in_ws = false;
        }
    }
    out
}
