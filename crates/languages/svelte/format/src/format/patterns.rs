use rsvelte_typescript_syntax::syntax_tree::{Kind, TypeScriptKind};
use rsvelte_typescript_syntax::{NodeIdentifier, SyntaxTree};

use super::{Printer, R, Span, Unsupported};

/// The TypeScript the template's tree erases, ordered for the two questions the printer asks.
pub(super) struct TypeScript {
    /// Every piece, by start and then end.
    spans: Vec<(Span, TypeScriptKind)>,
    /// Each piece by the node it belongs to.
    by_node: Vec<(NodeIdentifier, TypeScriptKind, Span)>,
}

impl TypeScript {
    pub(super) fn new(tree: &SyntaxTree) -> Self {
        let mut spans: Vec<(Span, TypeScriptKind)> =
            tree.typescript.iter().map(|t| (t.span, t.kind)).collect();
        spans.sort_by_key(|(s, _)| (s.start_offset, s.end_offset));
        let mut by_node: Vec<(NodeIdentifier, TypeScriptKind, Span)> = tree
            .typescript
            .iter()
            .map(|t| (t.node, t.kind, t.span))
            .collect();
        by_node.sort_by_key(|&(node, _, span)| (node, span.start_offset));
        Self { spans, by_node }
    }

    /// How many pieces lie within `range`.
    pub(super) fn within(&self, range: Span) -> usize {
        self.inside(range).count()
    }

    fn inside(&self, range: Span) -> impl Iterator<Item = &(Span, TypeScriptKind)> {
        let i = self
            .spans
            .partition_point(|(t, _)| t.start_offset < range.start_offset);
        self.spans[i..]
            .iter()
            .take_while(move |(t, _)| t.start_offset < range.end_offset)
            .filter(move |(t, _)| t.end_offset <= range.end_offset)
    }

    fn of(&self, node: NodeIdentifier) -> &[(NodeIdentifier, TypeScriptKind, Span)] {
        let i = self.by_node.partition_point(|&(n, ..)| n < node);
        let n = self.by_node[i..].partition_point(|&(n, ..)| n == node);
        &self.by_node[i..i + n]
    }

    /// The `: T` written after `node`.
    pub(super) fn annotation(&self, node: NodeIdentifier) -> Option<Span> {
        self.of(node)
            .iter()
            .find(|&&(_, kind, _)| kind == TypeScriptKind::Annotation)
            .map(|&(.., span)| span)
    }

    /// Whether the code in `span` ends in `as T`.
    pub(super) fn ends_in_cast(&self, span: Span) -> bool {
        self.inside(span)
            .any(|&(t, kind)| kind == TypeScriptKind::As && t.end_offset == span.end_offset)
    }

    /// Whether TypeScript wraps `node`: `<T>a`, `a as T`, `a satisfies T` or `a!`.
    pub(super) fn wraps(&self, node: NodeIdentifier) -> bool {
        self.of(node).iter().any(|&(_, kind, _)| {
            matches!(
                kind,
                TypeScriptKind::Assertion
                    | TypeScriptKind::As
                    | TypeScriptKind::Satisfies
                    | TypeScriptKind::NonNull
            )
        })
    }

    /// `span`, the expression `node`'s, with the TypeScript around it: the tree keeps
    /// `<T>a`, `a as T`, `a satisfies T` and `a!` as `a`.
    pub(super) fn extent(&self, node: NodeIdentifier, span: Span) -> Span {
        self.of(node)
            .iter()
            .fold(span, |s, &(_, kind, t)| match kind {
                TypeScriptKind::Assertion => {
                    Span::new(s.start_offset.min(t.start_offset), s.end_offset)
                }
                TypeScriptKind::As | TypeScriptKind::Satisfies | TypeScriptKind::NonNull => {
                    Span::new(s.start_offset, s.end_offset.max(t.end_offset))
                }
                _ => s,
            })
    }
}

impl Printer<'_, '_, '_> {
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
        if self.typescript.within(span) > 0 {
            return Err(Unsupported::at("TypeScript inside a block's pattern", span));
        }
        if let Some(a) = self.typescript.annotation(pattern) {
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
