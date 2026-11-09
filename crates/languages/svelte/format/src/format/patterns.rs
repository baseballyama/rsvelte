use rsvelte_typescript_syntax::NodeIdentifier;
use rsvelte_typescript_syntax::syntax_tree::Kind;

use super::{Printer, R, Span, Unsupported};

impl Printer<'_, '_> {
    /// The plugin's `expandNode`: an `{#each}` or `{#await}` pattern on one line, each part after
    /// a space (` { a, b: [c] }`), with the root's type annotation as written.
    pub(super) fn expand(&self, pattern: NodeIdentifier) -> R<String> {
        let mut out = String::new();
        if pattern == NodeIdentifier::NONE {
            return Ok(out);
        }
        self.expand_into(pattern, false, &mut out)?;
        let span = self.pattern_span(pattern);
        // `expandNode` prints the root's annotation only and drops the others.
        if self.javascript.typescript_within(span) > 0 {
            return Err(Unsupported::at("TypeScript inside a block's pattern", span));
        }
        if let Some(a) = self.javascript.annotation(pattern) {
            out.push_str(": ");
            out.push_str(a.text(self.source_text));
        }
        Ok(out)
    }

    fn pattern_span(&self, node: NodeIdentifier) -> Span {
        self.c
            .javascript
            .source_location(node)
            .span()
            .expect("a parsed pattern has a source span")
    }

    /// `_expandNode`; `in_object` is its `parent` being an object literal.
    fn expand_into(&self, node: NodeIdentifier, in_object: bool, out: &mut String) -> R<()> {
        let javascript = &self.c.javascript;
        let refuse = |what| Err(Unsupported::at(what, self.pattern_span(node)));
        match javascript.kind(node) {
            Kind::ArrayPattern(elements) | Kind::Array(elements) => {
                out.push_str(" [");
                let start = out.len();
                for (i, &e) in elements.iter().enumerate() {
                    if i > 0 {
                        out.push(',');
                    }
                    if matches!(javascript.kind(e), Kind::Hole) {
                        out.push(' ');
                    } else {
                        self.expand_into(e, false, out)?;
                    }
                }
                // `.join(',').slice(1)`: the first element's leading space goes.
                if !elements.is_empty() {
                    out.remove(start);
                }
                out.push(']');
            }
            Kind::AssignPattern(left, right) => {
                self.expand_into(left, false, out)?;
                out.push_str(" =");
                self.expand_into(right, false, out)?;
            }
            Kind::Identifier(_) => {
                out.push(' ');
                out.push_str(javascript.name(node));
            }
            Kind::Number(_) | Kind::String | Kind::Boolean(_) | Kind::Null => {
                out.push(' ');
                out.push_str(self.pattern_span(node).text(self.source_text));
            }
            Kind::Object(properties) | Kind::ObjectPattern(properties) => {
                let literal = matches!(javascript.kind(node), Kind::Object(_));
                out.push_str(" {");
                for (i, &p) in properties.iter().enumerate() {
                    if i > 0 {
                        out.push(',');
                    }
                    // `{...{a}}` is not JavaScript; Svelte's parser rejects it.
                    if let Kind::Rest(argument) = javascript.kind(p)
                        && !matches!(javascript.kind(argument), Kind::Identifier(_))
                    {
                        return refuse("a pattern after `...` in an object");
                    }
                    self.expand_into(p, literal, out)?;
                }
                out.push_str(" }");
            }
            Kind::Property {
                key,
                value,
                computed,
                method: false,
                getter: false,
                setter: false,
                ..
            } => self.expand_property(node, key, value, computed, in_object, out)?,
            Kind::Rest(argument) => {
                out.push_str(" ...");
                let start = out.len();
                self.expand_into(argument, false, out)?;
                // `.slice(1)` of the argument.
                out.remove(start);
            }
            // `_expandNode` throws on any other node.
            _ => return refuse("this part of a block's pattern"),
        }
        Ok(())
    }

    /// `_expandNode`'s `Property` case.
    fn expand_property(
        &self,
        node: NodeIdentifier,
        key: NodeIdentifier,
        value: NodeIdentifier,
        computed: bool,
        in_object: bool,
        out: &mut String,
    ) -> R<()> {
        let javascript = &self.c.javascript;
        let identifier_key = matches!(javascript.kind(key), Kind::Identifier(_));
        // `node.key.name`, which a computed key has when it is an identifier.
        let key_name = identifier_key.then(|| javascript.name(key));
        let key_doc = |out: &mut String| -> R<()> {
            if computed {
                out.push_str(" [");
                out.push_str(self.pattern_span(key).text(self.source_text));
                out.push(']');
                Ok(())
            } else {
                self.expand_into(key, false, out)
            }
        };
        match javascript.kind(value) {
            Kind::ObjectPattern(_) | Kind::ArrayPattern(_) => {
                if !computed && !identifier_key {
                    // `' ' + node.key.name` prints ` undefined` for a quoted key.
                    return Err(Unsupported::at(
                        "a quoted key before a nested pattern",
                        self.pattern_span(node),
                    ));
                }
                key_doc(out)?;
                out.push(':');
                self.expand_into(value, false, out)?;
            }
            Kind::Identifier(_) if in_object || key_name != Some(javascript.name(value)) => {
                key_doc(out)?;
                out.push(':');
                self.expand_into(value, false, out)?;
            }
            _ if in_object => {
                key_doc(out)?;
                out.push(':');
                self.expand_into(value, false, out)?;
            }
            // Upstream prints only the value from here on; that is the property itself
            // only when it is written short (`a`, `a = 1`).
            Kind::Identifier(_) if computed => {
                return Err(Unsupported::at(
                    "a computed key named like its value",
                    self.pattern_span(node),
                ));
            }
            Kind::AssignPattern(left, _)
                if computed
                    || key_name.is_none()
                    || !matches!(javascript.kind(left), Kind::Identifier(_))
                    || key_name != Some(javascript.name(left)) =>
            {
                return Err(Unsupported::at(
                    "a renamed property with a default in a block's pattern",
                    self.pattern_span(node),
                ));
            }
            _ => self.expand_into(value, false, out)?,
        }
        Ok(())
    }
}
