use oxc_ast::ast::Expression;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

use super::{
    Cow, LayoutInstructionIdentifier, Printer, R, TemplateNode, TemplateNodeIdentifier, TokenType,
    ends_with_linebreak, is_collapse_ws, only_ws, starts_with_linebreak,
};

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

impl Printer<'_, '_, '_> {
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
        if output.iter().all(|&x| self.docs.is_empty(x)) {
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

    /// `printChildren`, after which a `prettier-ignore` comment that ends the list ignores
    /// nothing.
    pub(super) fn print_children<C: AsChild>(
        &mut self,
        children: &[C],
    ) -> R<Vec<LayoutInstructionIdentifier>> {
        let docs = self.print_list(children);
        // The plugin's flag reaches whatever it prints next, which keeps unrelated code as written.
        self.ignore.next = false;
        docs
    }

    fn print_list<C: AsChild>(&mut self, children: &[C]) -> R<Vec<LayoutInstructionIdentifier>> {
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

    /// The plugin's test at the top of `print`: whether a `prettier-ignore` comment or range keeps
    /// the node as written, which consumes the comment.
    fn keeps_source(&mut self, identifier: TemplateNodeIdentifier) -> bool {
        let range_end = || match *self.c.node(identifier) {
            TemplateNode::Comment { data, .. } => {
                data.text(self.source_text)
                    .trim_matches(is_ecmascript_whitespace)
                    == "prettier-ignore-end"
            }
            _ => false,
        };
        // The plugin embeds a `<script>` or `<style>` element, which `print` never sees.
        if !(self.ignore.next || (self.ignore.range && !range_end()))
            || self.is_empty_text(identifier)
            || matches!(self.element_name(identifier), Some("script" | "style"))
        {
            return false;
        }
        self.ignore.next = false;
        true
    }

    /// The node's source, each line after the first on a literal line, as the plugin slices it
    /// from the text Prettier read with `\n` line endings.
    fn as_written(&mut self, identifier: TemplateNodeIdentifier) -> LayoutInstructionIdentifier {
        let span = self.c.node(identifier).span();
        // The JavaScript comments inside are printed with the rest of the source.
        self.embedder.kept.push(span);
        let mut out = self.take_buffer();
        for (j, line) in span.text(self.source_text).split('\n').enumerate() {
            if j > 0 {
                out.push(self.d().literalline());
            }
            out.push(self.d().text(line.strip_suffix('\r').unwrap_or(line)));
        }
        let doc = self.cat(&out);
        self.give_buffer(out);
        doc
    }

    /// The plugin's `isNodeTopLevelHTML`: the node is a child of the root.
    fn is_root_child(&self, identifier: TemplateNodeIdentifier) -> bool {
        let c = self.c;
        let start = c.node(identifier).span().start_offset;
        let root = c.children(c.root);
        root.binary_search_by_key(&start, |&n| c.node(n).span().start_offset)
            .is_ok_and(|i| root[i] == identifier)
    }

    /// `print` for one template node.
    pub(super) fn node(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        if self.keeps_source(identifier) {
            return Ok(self.as_written(identifier));
        }
        match *self.c.node(identifier) {
            TemplateNode::Text { .. } => Ok(self.text_node(identifier)),
            TemplateNode::Comment { data, .. } => {
                let data = data.text(self.source_text);
                match data.trim_matches(is_ecmascript_whitespace) {
                    "prettier-ignore-start" if self.is_root_child(identifier) => {
                        self.ignore.range = true;
                    }
                    "prettier-ignore-end" if self.is_root_child(identifier) => {
                        self.ignore.range = false;
                    }
                    "prettier-ignore" => self.ignore.next = true,
                    _ => {}
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
                let d = self.const_tag(declaration)?;
                let close = self.lit("}");
                Ok(self.cat(&[open, d, close]))
            }
            TemplateNode::Declaration { declaration, span } => {
                self.refuse_unembedded(span)?;
                let open = self.lit("{");
                let d = self.template_statement(declaration)?;
                let close = self.lit("}");
                Ok(self.cat(&[open, d, close]))
            }
            TemplateNode::Debug { identifiers, span } => {
                // The plugin prints the names only and deletes the comments.
                let comments = (self.c.tokens.within(span).iter())
                    .filter(|t| t.kind == TokenType::JavaScriptComment)
                    .map(|t| (t.span, "a comment in {@debug}, which the plugin deletes"));
                self.embedder.dropped.extend(comments);
                let javascript = &self.c.javascript;
                let names: Vec<&str> = self
                    .c
                    .debug_identifiers(identifiers)
                    .iter()
                    .filter_map(|&n| match javascript.get_expression(n) {
                        Expression::Identifier(identifier) => Some(identifier.name.as_str()),
                        _ => None,
                    })
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
