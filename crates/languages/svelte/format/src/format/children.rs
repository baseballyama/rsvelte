use super::{
    Cow, JavaScriptOptions, LayoutInstructionIdentifier, Printer, R, TemplateNode,
    TemplateNodeIdentifier, Unsupported, ends_with_linebreak, is_collapse_ws, only_ws,
    starts_with_linebreak,
};
use crate::options::EmbeddedLanguageFormatting;

/// A child of a fragment: a template node, or, at the root under `svelteSortOrder: "none"`, a
/// `<script>` or `<style>` already printed, which the plugin prints like any other node.
#[derive(Clone, Copy)]
pub(super) enum Child {
    Node(TemplateNodeIdentifier),
    Printed(LayoutInstructionIdentifier),
}

pub(super) trait AsChild: Copy {
    fn child(self) -> Child;
}

impl AsChild for TemplateNodeIdentifier {
    fn child(self) -> Child {
        Child::Node(self)
    }
}

impl AsChild for Child {
    fn child(self) -> Child {
        self
    }
}

impl Printer<'_, '_> {
    /// `print` for the root `Fragment`; `None` for the plugin's empty result.
    pub(super) fn fragment(
        &mut self,
        children: &[Child],
    ) -> R<Option<LayoutInstructionIdentifier>> {
        if children.is_empty() || children.iter().all(|&c| self.child_is_empty_text(c)) {
            return Ok(None);
        }
        self.trim_children(children);
        let printed = self.print_children(children)?;
        let inner = self.cat(&printed);
        self.give_buffer(printed);
        let mut output = vec![inner];
        self.d().trim(&mut output, |d, x| {
            d.is_line(x) || d.as_str(x).is_some_and(only_ws) || d.is_break_parent(x)
        });
        if output.iter().all(|&x| self.javascript.docs.is_empty(x)) {
            return Ok(None);
        }
        output.push(self.d().hardline());
        Ok(Some(self.group(&output)))
    }

    /// `trimChildren`.
    fn trim_children(&mut self, children: &[Child]) {
        let first = children
            .iter()
            .position(|&c| !self.child_is_empty_text(c))
            .unwrap_or(children.len() - 1);
        let last = children
            .iter()
            .rposition(|&c| !self.child_is_empty_text(c))
            .unwrap_or(0);
        for &c in &children[..=first] {
            if let Some(t) = self.child_text(c) {
                self.trim_left(t);
            }
        }
        for &c in children[last..].iter().rev() {
            if let Some(t) = self.child_text(c) {
                self.trim_right(t);
            }
        }
    }

    /// The text node `c` is, if it is one.
    pub(super) fn child_text(&self, c: impl AsChild) -> Option<TemplateNodeIdentifier> {
        match c.child() {
            Child::Node(n) if self.is_text(n) => Some(n),
            _ => None,
        }
    }

    fn child_is_empty_text(&self, c: impl AsChild) -> bool {
        self.child_text(c).is_some_and(|t| self.is_empty_text(t))
    }

    fn child_is_block(&self, c: impl AsChild) -> bool {
        matches!(c.child(), Child::Node(n) if self.is_block(n))
    }

    fn child_is_inline(&self, c: impl AsChild, in_pre: bool) -> bool {
        matches!(c.child(), Child::Node(n) if self.is_inline(n, in_pre))
    }

    fn print_child(&mut self, c: impl AsChild) -> R<LayoutInstructionIdentifier> {
        match c.child() {
            Child::Node(n) => self.node(n),
            Child::Printed(d) => Ok(d),
        }
    }

    /// `printChildren` (outside `<pre>`).
    pub(super) fn print_children<C: AsChild>(
        &mut self,
        children: &[C],
    ) -> R<Vec<LayoutInstructionIdentifier>> {
        let in_pre = self.in_pre;
        // `printChildren` prints each node as it is inside `<pre>`.
        if in_pre {
            let mut docs = self.take_buffer();
            for &c in children {
                docs.push(self.print_child(c)?);
            }
            return Ok(docs);
        }
        // `prepareChildren`: text emptied by earlier trims is gone.
        let is_gone = |p: &Self, c: C| p.child_text(c).is_some_and(|t| p.raw(t).is_empty());
        let prepared: Cow<'_, [C]> = if children.iter().any(|&c| is_gone(self, c)) {
            Cow::Owned(
                children
                    .iter()
                    .copied()
                    .filter(|&c| !is_gone(self, c))
                    .collect(),
            )
        } else {
            Cow::Borrowed(children)
        };
        if prepared.is_empty() {
            return Ok(Vec::new());
        }
        let mut docs = self.take_buffer();
        let mut ws_of_prev_text = false;
        let n = prepared.len();
        for i in 0..n {
            let child = prepared[i];
            if let Some(text) = self.child_text(child) {
                ws_of_prev_text = false;
                if i == 0 || i == n - 1 {
                    docs.push(self.node(text)?);
                    continue;
                }
                let prev = prepared[i - 1];
                let next = prepared[i + 1];
                if self.text_starts_ws(text) && !self.is_empty_text(text) {
                    if self.child_is_inline(prev, in_pre) && !self.text_starts_linebreak(text) {
                        self.trim_left(text);
                        let last = docs.pop().expect("a previous child was printed");
                        let line = self.d().line();
                        docs.push(self.group(&[last, line]));
                    }
                    if self.child_is_block(prev) && !self.text_starts_linebreak(text) {
                        self.trim_left(text);
                    }
                }
                if self.text_ends_ws(text) {
                    if self.child_is_inline(next, in_pre) && !self.text_ends_linebreak(text, 1) {
                        ws_of_prev_text = !self.child_is_block(prev);
                        self.trim_right(text);
                    }
                    if self.child_is_block(next) && !self.text_ends_linebreak(text, 2) {
                        ws_of_prev_text = !self.child_is_block(prev);
                        self.trim_right(text);
                    }
                }
                docs.push(self.node(text)?);
            } else if self.child_is_block(child) {
                let prev = i.checked_sub(1).map(|j| prepared[j]);
                if let Some(p) = prev
                    && !self.child_is_block(p)
                    && self
                        .child_text(p)
                        .is_none_or(|t| ws_of_prev_text || !self.text_ends_ws(t))
                {
                    docs.push(self.d().softline());
                }
                docs.push(self.print_child(child)?);
                if let Some(&next) = prepared.get(i + 1) {
                    let followed_by_inline = prepared
                        .get(i + 2)
                        .is_some_and(|&x| self.child_is_inline(x, in_pre));
                    if self.child_text(next).is_none_or(|t| {
                        (!self.is_empty_text(t) || followed_by_inline)
                            && !self.text_starts_linebreak(t)
                    }) {
                        docs.push(self.d().softline());
                    }
                }
                ws_of_prev_text = false;
            } else if self.child_is_inline(child, in_pre) {
                let d = self.print_child(child)?;
                if ws_of_prev_text {
                    let line = self.d().line();
                    docs.push(self.group(&[line, d]));
                } else {
                    docs.push(d);
                }
                ws_of_prev_text = false;
            } else {
                docs.push(self.print_child(child)?);
                ws_of_prev_text = false;
            }
        }
        if n > 1 && prepared.iter().any(|&c| self.child_is_block(c)) {
            docs.push(self.d().break_parent());
        }
        Ok(docs)
    }

    /// `print` for one template node.
    pub(super) fn node(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        match *self.c.node(identifier) {
            TemplateNode::Text { .. } => Ok(self.text_node(identifier)),
            TemplateNode::Comment { data, span } => {
                let data = data.text(self.source_text);
                if data.trim().starts_with("prettier-ignore") {
                    return Err(Unsupported::at("prettier-ignore comments", span));
                }
                let o = self.lit("<!--");
                let t = self.d().text(data);
                let c = self.lit("-->");
                Ok(self.group(&[o, t, c]))
            }
            TemplateNode::Expression { expression, .. } => {
                let e = self.expression(expression, false, false)?;
                let o = self.lit("{");
                let c = self.lit("}");
                Ok(self.cat(&[o, e, c]))
            }
            TemplateNode::Element { .. } => self.element(identifier),
            TemplateNode::If { .. } => self.if_block(identifier),
            TemplateNode::Each { .. } => self.each_block(identifier),
            TemplateNode::Key { .. } => self.key_block(identifier),
            TemplateNode::Await { .. } => self.await_block(identifier),
            TemplateNode::Snippet { .. } => self.snippet_block(identifier),
            TemplateNode::Html { expression, .. } => self.tag("{@html ", expression),
            TemplateNode::Render { expression, .. } => self.tag("{@render ", expression),
            TemplateNode::Const { declaration, span } => {
                self.refuse_unembedded(span)?;
                let open = self.lit("{@const ");
                let d = self.javascript.const_tag(declaration)?;
                let close = self.lit("}");
                Ok(self.cat(&[open, d, close]))
            }
            TemplateNode::Declaration { declaration, span } => {
                self.refuse_unembedded(span)?;
                let open = self.lit("{");
                let d = self.javascript.template_statement(declaration)?;
                let close = self.lit("}");
                Ok(self.cat(&[open, d, close]))
            }
            TemplateNode::Debug { identifiers, .. } => {
                let javascript = &self.c.javascript;
                let names: Vec<&str> = self
                    .c
                    .javascript_list(identifiers)
                    .iter()
                    .map(|&n| javascript.name(n))
                    .collect();
                let text = if names.is_empty() {
                    "{@debug}".to_owned()
                } else {
                    format!("{{@debug {}}}", names.join(", "))
                };
                Ok(self.d().text(&text))
            }
        }
    }

    /// `{@html …}` and `{@render …}`.
    fn tag(
        &mut self,
        open: &'static str,
        expression: rsvelte_typescript_syntax::NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let open = self.lit(open);
        let e = self.expression(expression, false, false)?;
        let close = self.lit("}");
        Ok(self.cat(&[open, e, close]))
    }

    /// An embedded expression (`printJS`), optionally forced onto one line or into single quotes.
    pub(super) fn expression(
        &mut self,
        e: rsvelte_typescript_syntax::NodeIdentifier,
        single_line: bool,
        single_quote: bool,
    ) -> R<LayoutInstructionIdentifier> {
        self.expression_with(e, single_line, single_quote, false)
    }

    /// The plugin parses each expression wrapped as `(expression\n)`, and Prettier then keeps the
    /// parentheses around an assignment or a sequence at the root; `bind:` removes them from a
    /// sequence (`removeParentheses`).
    /// With `embeddedLanguageFormatting: "off"`, Prettier does not call the plugin's `embed`, and
    /// its printer knows only a name and a literal (`JSON.stringify(value)`); anything else throws.
    fn unformatted_expression(
        &mut self,
        e: rsvelte_typescript_syntax::NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let javascript = &self.c.javascript;
        let span = javascript
            .source_location(e)
            .span()
            .expect("a parsed expression has a source span");
        let raw = span.text(self.source_text);
        let text = match javascript.kind(e) {
            rsvelte_typescript_syntax::Kind::Identifier(_) => javascript.name(e).to_owned(),
            rsvelte_typescript_syntax::Kind::Boolean(_) | rsvelte_typescript_syntax::Kind::Null => raw.to_owned(),
            // Written the way `JSON.stringify` writes the value.
            rsvelte_typescript_syntax::Kind::Number(_)
                // `JSON.stringify` of a double prints up to 15 digits as written.
                if raw == "0"
                    || (!raw.starts_with('0')
                        && raw.len() <= 15
                        && raw.bytes().all(|b| b.is_ascii_digit())) =>
            {
                raw.to_owned()
            }
            rsvelte_typescript_syntax::Kind::String
                if !raw[1..raw.len() - 1].contains(|c: char| c == '\\' || c == '"' || c < ' ') =>
            {
                format!("\"{}\"", &raw[1..raw.len() - 1])
            }
            _ => {
                return Err(Unsupported::at(
                    "an expression that `embeddedLanguageFormatting: off` cannot print",
                    span,
                ));
            }
        };
        Ok(self.d().text(&text))
    }

    /// The plugin throws, or drops code, for this construct when `embed` does not run.
    pub(super) fn refuse_unembedded(&self, span: rsvelte_kernel::source::positions::Span) -> R<()> {
        if self.options.embedded_language_formatting == EmbeddedLanguageFormatting::Off {
            return Err(Unsupported::at(
                "this construct with `embeddedLanguageFormatting: off`",
                span,
            ));
        }
        Ok(())
    }

    pub(super) fn expression_with(
        &mut self,
        e: rsvelte_typescript_syntax::NodeIdentifier,
        single_line: bool,
        single_quote: bool,
        bare_sequence: bool,
    ) -> R<LayoutInstructionIdentifier> {
        if self.options.embedded_language_formatting == EmbeddedLanguageFormatting::Off {
            return self.unformatted_expression(e);
        }
        self.javascript.set_options(JavaScriptOptions {
            single_quote,
            ..JavaScriptOptions::default()
        });
        let d = self.javascript.format_expression(e);
        self.javascript.set_options(JavaScriptOptions::default());
        let mut d = d?;
        let parenthesized = match self.c.javascript.kind(e) {
            rsvelte_typescript_syntax::Kind::Assign(..) => true,
            rsvelte_typescript_syntax::Kind::Sequence(_) => !bare_sequence,
            _ => false,
        };
        if parenthesized {
            let open = self.lit("(");
            let close = self.lit(")");
            d = self.cat(&[open, d, close]);
        }
        Ok(if single_line {
            // Without lines, a property's assignment layout keeps the indent it would have
            // used when broken; that layout is not ported.
            if self.d().will_break(d) && self.has_property_value(e) {
                return Err(Unsupported::at(
                    "a line break under an object property in a block's head",
                    self.c.javascript.source_location(e),
                ));
            }
            self.d().remove_lines(d)
        } else {
            d
        })
    }

    /// Whether `e` holds an object property written with its value.
    fn has_property_value(&self, e: rsvelte_typescript_syntax::NodeIdentifier) -> bool {
        let tree = &self.c.javascript;
        let mut stack = vec![e];
        while let Some(n) = stack.pop() {
            if let rsvelte_typescript_syntax::Kind::Property {
                shorthand: false, ..
            } = tree.kind(n)
            {
                return true;
            }
            tree.for_each_child(n, |c| stack.push(c));
        }
        false
    }

    pub(super) fn text_node(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> LayoutInstructionIdentifier {
        // Rewritten text is moved out and back, so printing it never copies it.
        let (c, source_text) = (self.c, self.source_text);
        let stored = self.text[identifier as usize].take();
        let raw: &str = match (&stored, c.node(identifier)) {
            (Some(t), _) => t,
            (None, TemplateNode::Text { span }) => span.text(source_text),
            (None, _) => unreachable!("only text nodes have text"),
        };
        let doc = if self.in_pre {
            self.d().text(raw)
        } else if only_ws(raw) {
            self.whitespace(raw)
        } else {
            let mut docs = self.take_buffer();
            self.split_text(raw, &mut docs);
            let doc = self.d().fill(&docs);
            self.give_buffer(docs);
            doc
        };
        self.text[identifier as usize] = stored;
        doc
    }

    /// `printWhitespace`.
    pub(super) fn whitespace(&mut self, text: &str) -> LayoutInstructionIdentifier {
        let newlines = text.matches('\n').count();
        if newlines >= 2 {
            let a = self.d().hardline();
            let b = self.d().hardline();
            self.cat(&[a, b])
        } else if newlines == 1 {
            self.d().hardline()
        } else if !text.is_empty() {
            self.d().line()
        } else {
            self.d().nil()
        }
    }

    /// `splitTextToDocs`.
    pub(super) fn split_text(&mut self, text: &str, docs: &mut Vec<LayoutInstructionIdentifier>) {
        let mut pending_line = false;
        for (i, w) in text.split(is_collapse_ws).enumerate() {
            if i > 0 {
                pending_line = true;
            }
            if w.is_empty() {
                continue;
            }
            if pending_line {
                docs.push(self.d().line());
                pending_line = false;
            }
            docs.push(self.d().text(w));
        }
        if pending_line {
            docs.push(self.d().line());
        }
        // `split` on a run of whitespace yields empty words between; the join above collapses them
        // the way `join(line, words).filter(d => d !== '')` does.
        if starts_with_linebreak(text, 1) {
            docs[0] = self.d().hardline();
        }
        if starts_with_linebreak(text, 2) {
            let h = self.d().hardline();
            docs.insert(0, h);
        }
        if ends_with_linebreak(text, 1) {
            let last = docs.len() - 1;
            docs[last] = self.d().hardline();
        }
        if ends_with_linebreak(text, 2) {
            let h = self.d().hardline();
            docs.push(h);
        }
    }
}
