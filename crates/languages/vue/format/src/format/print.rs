//! prettier's `printer-html.js` and `print/element.js`.

use super::{Embed, LayoutInstructionIdentifier, NodeIdentifier, NodeKind, Printer, R};

impl Printer<'_, '_, '_> {
    pub(super) fn print(&mut self, i: NodeIdentifier) -> R<LayoutInstructionIdentifier> {
        match &self.node(i).kind {
            NodeKind::Element { .. } => self.element(i),
            NodeKind::Text(_) => self.text(i),
            &NodeKind::Interpolation(span) => {
                let start = self.opening_tag_start(i);
                let expression = self.interpolation(span)?;
                let l = self.docs.line();
                let inner = self.cat(&[l, expression]);
                let indentation = self.docs.indent(inner);
                let after = if self
                    .node(i)
                    .next
                    .is_some_and(|x| self.borrows_prev_close_end(x))
                {
                    self.lit(" ")
                } else {
                    self.docs.line()
                };
                let end = self.closing_tag_end(i);
                Ok(self.cat(&[start, indentation, after, end]))
            }
            NodeKind::Root => unreachable!("the root is printed by `format`"),
        }
    }

    pub(super) fn text(&mut self, i: NodeIdentifier) -> R<LayoutInstructionIdentifier> {
        let parent = self.tree.parent(i);
        if let NodeKind::Element { embed, .. } = self.node(parent).kind
            && embed != Embed::None
        {
            let body = self.embedded(embed)?;
            let bp = self.docs.break_parent();
            let prefix = self.opening_tag_prefix(i);
            let suffix = self.closing_tag_suffix(i);
            return Ok(self.cat(&[bp, prefix, body, suffix]));
        }
        let NodeKind::Text(value) = &self.node(i).kind else {
            unreachable!("a text node")
        };
        let words: Vec<String> = value.split_ascii_whitespace().map(str::to_owned).collect();
        let prefix = self.opening_tag_prefix(i);
        let suffix = self.closing_tag_suffix(i);
        let mut parts = Vec::with_capacity(words.len() * 2);
        for (j, w) in words.iter().enumerate() {
            if j > 0 {
                parts.push(self.docs.line());
            }
            parts.push(self.docs.text(w));
        }
        parts[0] = self.cat(&[prefix, parts[0]]);
        let last = parts.len() - 1;
        parts[last] = self.cat(&[parts[last], suffix]);
        Ok(self.docs.fill(&parts))
    }

    /// A script or style body, as `textToDoc` returns it (no trailing line).
    pub(super) fn embedded(&mut self, embed: Embed) -> R<LayoutInstructionIdentifier> {
        match embed {
            Embed::Script(content) => self.script(content),
            Embed::Style(index) => self.style(self.component.styles[index].content),
            Embed::None => unreachable!("an embedding block"),
        }
    }

    /// `printElement`.
    pub(super) fn element(&mut self, i: NodeIdentifier) -> R<LayoutInstructionIdentifier> {
        let n = self.node(i);
        let children = n.children.clone();
        let should_hug = children.len() == 1 && {
            let f = self.node(children[0]);
            matches!(f.kind, NodeKind::Interpolation(_))
                && f.sensitive.leading
                && !f.has.leading
                && f.sensitive.trailing
                && !f.has.trailing
        };
        let gid = self.docs.new_group_identifier();
        let opening = self.opening_tag(i)?;
        let opening = self.docs.group_with_identifier(&[opening], gid);
        if children.is_empty() {
            let n = self.node(i);
            let inner = if n.has.dangling && n.sensitive.dangling {
                self.docs.line()
            } else {
                self.docs.nil()
            };
            let closing = self.closing_tag(i);
            return Ok(self.docs.group(&[opening, inner, closing]));
        }
        let first = children[0];
        let last = *children.last().expect("non-empty");
        let before = if should_hug {
            let soft = self.docs.softline();
            let nil = self.docs.nil();
            self.docs.if_break_of(soft, nil, gid)
        } else if self.node(first).has.leading && self.node(first).sensitive.leading {
            self.docs.line()
        } else {
            self.docs.softline()
        };
        let printed = self.children(i)?;
        let mut body = vec![before];
        body.extend(printed);
        let body = self.cat(&body);
        let body = if should_hug {
            self.docs.indent_if_break(body, gid)
        } else if self.tree.is_script_like(i) && self.tree.is_top_level(i) {
            body
        } else {
            self.docs.indent(body)
        };
        let after = if self.close_end_borrowed(i) {
            if self.node(last).has.trailing && self.node(last).sensitive.trailing {
                self.lit(" ")
            } else {
                self.docs.nil()
            }
        } else if should_hug {
            let soft = self.docs.softline();
            let nil = self.docs.nil();
            self.docs.if_break_of(soft, nil, gid)
        } else if self.node(last).has.trailing && self.node(last).sensitive.trailing {
            self.docs.line()
        } else {
            self.docs.softline()
        };
        let force = if self.force_break_content(i) {
            self.docs.break_parent()
        } else {
            self.docs.nil()
        };
        let closing = self.closing_tag(i);
        Ok(self.docs.group(&[opening, force, body, after, closing]))
    }
}
