mod class;
mod with_spread;
mod without_spread;

use rsvelte_typescript_syntax::lexer::is_javascript_whitespace;

use super::{
    Attribute, AttributeValue, NodeIdentifier, Part, ServerCompilationContext, SourceLocation,
    decode_text, escape_markup, known_string, needs_clsx, sanitize_template_string,
};

impl ServerCompilationContext<'_> {
    /// Upstream `build_attribute_value` (server), with text as written: an element's caller
    /// escapes it, a component's does not. A `class` written as one unquoted expression goes
    /// through `$.clsx` when upstream's `needs_clsx`.
    pub(super) fn attribute_value(
        &mut self,
        a: &Attribute,
        trim: bool,
        class: bool,
    ) -> NodeIdentifier {
        let parts = match &a.value {
            &AttributeValue::Expression { expression, quoted } => {
                let v = self.expression(expression);
                return if class && !quoted && needs_clsx(self.javascript, expression) {
                    self.out.runtime("$", "clsx", &[v])
                } else {
                    v
                };
            }
            &AttributeValue::Shorthand(expression) => {
                let v = self.expression(expression);
                return if class && needs_clsx(self.javascript, expression) {
                    self.out.runtime("$", "clsx", &[v])
                } else {
                    v
                };
            }
            AttributeValue::Interpolated(parts) => parts,
            AttributeValue::Boolean => {
                return self.out.write_boolean(true, SourceLocation::SYNTHETIC);
            }
            AttributeValue::Static(v) => return self.out.write_string(&attribute_text(v, trim)),
            _ => {
                unreachable!("directives are handled by the caller")
            }
        };
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for p in parts {
            match p {
                Part::Text(s) => {
                    let data = decode_text(s.text(self.source_text));
                    let data = if trim {
                        collapse_ws(&data)
                    } else {
                        data.into_owned()
                    };
                    quasis.last_mut().expect("never empty").push_str(&data);
                }
                Part::Expression { expression, .. } => {
                    let evaluated =
                        self.res
                            .evaluate(self.javascript, self.source_text, *expression);
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
                            self.out.runtime("$", "stringify", &[v])
                        };
                        expressions.push(v);
                        quasis.push(String::new());
                    }
                }
            }
        }
        if expressions.is_empty() {
            return self.out.write_string(&quasis[0]);
        }
        let n = quasis.len();
        let elements: Vec<NodeIdentifier> = quasis
            .iter()
            .enumerate()
            .map(|(i, q)| {
                self.out
                    .template_element(&sanitize_template_string(q), i + 1 == n)
            })
            .collect();
        self.out
            .template(&elements, &expressions, SourceLocation::SYNTHETIC)
    }
}

/// A class value with the stylesheet's hash, trimmed as upstream's `.trim()` does.
fn scoped_class(value: &str, hash: &str) -> String {
    format!("{value} {hash}")
        .trim_matches(is_javascript_whitespace)
        .to_owned()
}

fn attribute_text(data: &str, trim: bool) -> String {
    if trim {
        collapse_ws(data)
            .trim_matches(is_javascript_whitespace)
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
