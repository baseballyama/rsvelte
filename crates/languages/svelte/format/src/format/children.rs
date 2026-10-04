use super::{
    Cow, JavaScriptOptions, LayoutInstructionIdentifier, Printer, R, TemplateNode,
    TemplateNodeIdentifier, Unsupported, ends_with_linebreak, is_collapse_ws, only_ws,
    starts_with_linebreak,
};

impl Printer<'_, '_> {
    /// `print` for the root `Fragment`; `None` for the plugin's empty result.
    pub(super) fn fragment(
        &mut self,
        children: &[TemplateNodeIdentifier],
    ) -> R<Option<LayoutInstructionIdentifier>> {
        if children.is_empty() || children.iter().all(|&c| self.is_empty_text(c)) {
            return Ok(None);
        }
        self.trim_children(children);
        let printed = self.print_children(children)?;
        let inner = self.cat(&printed);
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
    pub(super) fn trim_children(&mut self, children: &[TemplateNodeIdentifier]) {
        let first = children
            .iter()
            .position(|&c| !self.is_empty_text(c))
            .unwrap_or(children.len() - 1);
        let last = children
            .iter()
            .rposition(|&c| !self.is_empty_text(c))
            .unwrap_or(0);
        for &c in &children[..=first] {
            if self.is_text(c) {
                self.trim_left(c);
            }
        }
        for &c in children[last..].iter().rev() {
            if self.is_text(c) {
                self.trim_right(c);
            }
        }
    }

    /// `printChildren` (outside `<pre>`).
    pub(super) fn print_children(
        &mut self,
        children: &[TemplateNodeIdentifier],
    ) -> R<Vec<LayoutInstructionIdentifier>> {
        let in_pre = self.in_pre;
        // `prepareChildren`: text emptied by earlier trims is gone.
        let prepared: Vec<TemplateNodeIdentifier> = children
            .iter()
            .copied()
            .filter(|&c| !(self.is_text(c) && self.raw(c).is_empty()))
            .collect();
        if prepared.is_empty() {
            return Ok(Vec::new());
        }
        let mut docs: Vec<LayoutInstructionIdentifier> = Vec::new();
        let mut ws_of_prev_text = false;
        let n = prepared.len();
        for i in 0..n {
            let child = prepared[i];
            if self.is_text(child) {
                ws_of_prev_text = false;
                if i == 0 || i == n - 1 {
                    docs.push(self.node(child)?);
                    continue;
                }
                let prev = prepared[i - 1];
                let next = prepared[i + 1];
                if self.text_starts_ws(child) && !self.is_empty_text(child) {
                    if self.is_inline(prev, in_pre) && !self.text_starts_linebreak(child) {
                        self.trim_left(child);
                        let last = docs.pop().expect("a previous child was printed");
                        let line = self.d().line();
                        docs.push(self.group(&[last, line]));
                    }
                    if self.is_block(prev) && !self.text_starts_linebreak(child) {
                        self.trim_left(child);
                    }
                }
                if self.text_ends_ws(child) {
                    if self.is_inline(next, in_pre) && !self.text_ends_linebreak(child, 1) {
                        ws_of_prev_text = !self.is_block(prev);
                        self.trim_right(child);
                    }
                    if self.is_block(next) && !self.text_ends_linebreak(child, 2) {
                        ws_of_prev_text = !self.is_block(prev);
                        self.trim_right(child);
                    }
                }
                docs.push(self.node(child)?);
            } else if self.is_block(child) {
                let prev = i.checked_sub(1).map(|j| prepared[j]);
                if let Some(p) = prev
                    && !self.is_block(p)
                    && (!self.is_text(p) || ws_of_prev_text || !self.text_ends_ws(p))
                {
                    docs.push(self.d().softline());
                }
                docs.push(self.node(child)?);
                if let Some(&next) = prepared.get(i + 1) {
                    let followed_by_inline = prepared
                        .get(i + 2)
                        .is_some_and(|&x| self.is_inline(x, in_pre));
                    if !self.is_text(next)
                        || ((!self.is_empty_text(next) || followed_by_inline)
                            && !self.text_starts_linebreak(next))
                    {
                        docs.push(self.d().softline());
                    }
                }
                ws_of_prev_text = false;
            } else if self.is_inline(child, in_pre) {
                let d = self.node(child)?;
                if ws_of_prev_text {
                    let line = self.d().line();
                    docs.push(self.group(&[line, d]));
                } else {
                    docs.push(d);
                }
                ws_of_prev_text = false;
            } else {
                docs.push(self.node(child)?);
                ws_of_prev_text = false;
            }
        }
        if n > 1 && prepared.iter().any(|&c| self.is_block(c)) {
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
            _ => Err(Unsupported::at(
                "blocks and special tags",
                self.c.node(identifier).span(),
            )),
        }
    }

    /// An embedded expression (`printJS`), optionally forced onto one line or into single quotes.
    pub(super) fn expression(
        &mut self,
        e: rsvelte_typescript::NodeIdentifier,
        single_line: bool,
        single_quote: bool,
    ) -> R<LayoutInstructionIdentifier> {
        self.javascript.set_options(JavaScriptOptions {
            single_quote,
            ..JavaScriptOptions::default()
        });
        let d = self.javascript.format_expression(e);
        self.javascript.set_options(JavaScriptOptions::default());
        let d = d?;
        Ok(if single_line {
            self.d().remove_lines(d)
        } else {
            d
        })
    }

    pub(super) fn text_node(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> LayoutInstructionIdentifier {
        // The source's text, borrowed; a copy only of text the printer has rewritten.
        let (c, source_text) = (self.c, self.source_text);
        let raw = match (&self.text[identifier as usize], c.node(identifier)) {
            (Some(t), _) => t.clone(),
            (None, TemplateNode::Text { span }) => Cow::Borrowed(span.text(source_text)),
            (None, _) => unreachable!("only text nodes have text"),
        };
        if self.in_pre {
            return self.d().text(&raw);
        }
        if only_ws(&raw) {
            return self.whitespace(&raw);
        }
        let docs = self.split_text(&raw);
        self.d().fill(&docs)
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
    pub(super) fn split_text(&mut self, text: &str) -> Vec<LayoutInstructionIdentifier> {
        let words: Vec<&str> = text.split(is_collapse_ws).collect();
        let mut docs: Vec<LayoutInstructionIdentifier> = Vec::new();
        let mut pending_line = false;
        for (i, w) in words.iter().enumerate() {
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
        docs
    }
}
