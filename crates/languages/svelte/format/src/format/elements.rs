use super::{
    ElementKind, LayoutInstructionIdentifier, Printer, R, SELF_CLOSING, TemplateNode,
    TemplateNodeIdentifier, Unsupported,
};

impl Printer<'_, '_> {
    #[expect(
        clippy::too_many_lines,
        reason = "ports the plugin's element branch of `print` in one piece"
    )]
    pub(super) fn element(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let TemplateNode::Element {
            name,
            attributes,
            span,
            self_closing: did_self_close,
            ..
        } = *self.c.node(identifier)
        else {
            unreachable!("an element")
        };
        let name = name.text(self.source_text);
        if name.contains(':') {
            return Err(Unsupported::at("svelte: elements", span));
        }
        if name == "template"
            && attributes
                .get(&self.c.attributes)
                .iter()
                .any(|a| matches!(a.name.text(self.source_text), "lang" | "type"))
        {
            return Err(Unsupported::at("<template> with a language", span));
        }
        let children = self.children(identifier);
        let is_empty = children.iter().all(|&c| self.is_empty_text(c));
        let kind = Self::element_kind(name);
        let self_closing = is_empty && (did_self_close || SELF_CLOSING.contains(&name));
        let was_pre = self.in_pre;
        let is_pre_el = kind == ElementKind::Regular
            && matches!(name.to_ascii_lowercase().as_str(), "pre" | "textarea");
        let in_pre = was_pre || is_pre_el;

        let mut attribute_docs = Vec::new();
        let c = self.c;
        for a in attributes.get(&c.attributes) {
            let line = self.d().line();
            let document = self.attribute(a, kind)?;
            attribute_docs.push(self.cat(&[line, document]));
        }
        let lt = self.lit("<");
        let name_doc = self.d().text(name);
        if self_closing {
            let line = self.d().line();
            let dl = self.d().dedent(line);
            let mut inner = attribute_docs;
            inner.push(dl);
            let g = self.group(&inner);
            let indentation = self.d().indent(g);
            let close = self.lit("/>");
            return Ok(self.group(&[lt, name_doc, indentation, close]));
        }

        let first = children.first().copied();
        let last = children.last().copied();
        let is_inline = kind == ElementKind::Regular && !self.is_block(identifier) && !in_pre;
        let hug_start = self.should_hug(identifier, children, true);
        let hug_end = self.should_hug(identifier, children, false);

        let mut open_inner = attribute_docs;
        if (is_empty || !hug_start) && !in_pre {
            let soft = self.d().softline();
            open_inner.push(self.d().dedent(soft));
        }
        let g = self.group(&open_inner);
        let attributes_doc = self.d().indent(g);
        let opening = [lt, name_doc, attributes_doc];
        let close_full = self.d().text_parts(&["</", name, ">"]);

        if hug_start && hug_end {
            let body = self.element_body(children, is_empty, is_inline, in_pre)?;
            let soft = self.d().softline();
            let gt = self.lit(">");
            let close_open = self.d().text_parts(&["</", name]);
            let inner = self.group(&[gt, body, close_open]);
            let hugged = self.cat(&[soft, inner]);
            let hugged = if is_empty {
                self.group(&[hugged])
            } else {
                let indentation = self.d().indent(hugged);
                self.group(&[indentation])
            };
            let omit = is_empty;
            let mut parts = opening.to_vec();
            parts.push(hugged);
            if !omit {
                parts.push(self.d().softline());
            }
            parts.push(self.lit(">"));
            return Ok(self.group(&parts));
        }

        let (sep_start, sep_end) = if in_pre {
            (self.d().nil(), self.d().nil())
        } else {
            let mut sep_start = self.d().softline();
            let mut sep_end = self.d().softline();
            let mut did_set_end = false;
            if !hug_start && let Some(f) = first.filter(|&f| self.is_text(f)) {
                let l = last.expect("non-empty");
                if self.text_starts_linebreak(f) && f != l && (!is_inline || self.text_ends_ws(l)) {
                    sep_start = self.d().hardline();
                    sep_end = self.d().hardline();
                    did_set_end = true;
                } else if is_inline {
                    sep_start = self.d().line();
                }
                self.trim_left(f);
            }
            if !hug_end && let Some(l) = last.filter(|&l| self.is_text(l)) {
                if is_inline && !did_set_end {
                    sep_end = self.d().line();
                }
                self.trim_right(l);
            }
            (sep_start, sep_end)
        };

        if hug_start {
            let body = self.element_body(children, is_empty, is_inline, in_pre)?;
            let gt = self.lit(">");
            let inner = self.group(&[gt, body]);
            let soft = self.d().softline();
            let indentation = self.cat(&[soft, inner]);
            let indentation = self.d().indent(indentation);
            let mut parts = opening.to_vec();
            parts.extend([indentation, sep_end, close_full]);
            return Ok(self.group(&parts));
        }
        if hug_end {
            let body = self.element_body(children, is_empty, is_inline, in_pre)?;
            let close_open = self.d().text_parts(&["</", name]);
            let inner = self.group(&[body, close_open]);
            let indentation = self.cat(&[sep_start, inner]);
            let indentation = self.d().indent(indentation);
            let gt = self.lit(">");
            let soft = self.d().softline();
            let gt2 = self.lit(">");
            let mut parts = opening.to_vec();
            parts.extend([gt, indentation, soft, gt2]);
            return Ok(self.group(&parts));
        }
        let body = self.element_body(children, is_empty, is_inline, in_pre)?;
        let gt = self.lit(">");
        let mut parts = opening.to_vec();
        if is_empty {
            parts.extend([gt, body, close_full]);
            return Ok(self.group(&parts));
        }
        let indentation = self.cat(&[sep_start, body]);
        let indentation = self.d().indent(indentation);
        parts.extend([gt, indentation, sep_end, close_full]);
        Ok(self.group(&parts))
    }

    /// The element's `body()`, printed after the separators have trimmed its first/last text.
    pub(super) fn element_body(
        &mut self,
        children: &[TemplateNodeIdentifier],
        is_empty: bool,
        is_inline: bool,
        in_pre: bool,
    ) -> R<LayoutInstructionIdentifier> {
        if is_empty {
            return Ok(
                if is_inline && !children.is_empty() && self.text_starts_ws(children[0]) && !in_pre
                {
                    self.d().line()
                } else {
                    self.d().nil()
                },
            );
        }
        if in_pre {
            return self.pre(children);
        }
        let saved = self.in_pre;
        self.in_pre = false;
        let docs = self.print_children(children);
        self.in_pre = saved;
        let docs = docs?;
        Ok(self.cat(&docs))
    }

    /// `printPre`: text verbatim, line breaks as literal lines.
    pub(super) fn pre(
        &mut self,
        children: &[TemplateNodeIdentifier],
    ) -> R<LayoutInstructionIdentifier> {
        let saved = self.in_pre;
        self.in_pre = true;
        let mut out = Vec::new();
        for &c in children {
            if let TemplateNode::Text { span } = *self.c.node(c) {
                for (j, line) in span.text(self.source_text).split('\n').enumerate() {
                    if j > 0 {
                        out.push(self.d().literalline());
                    }
                    out.push(self.d().text(line.strip_suffix('\r').unwrap_or(line)));
                }
            } else {
                let d = self.node(c);
                match d {
                    Ok(d) => out.push(d),
                    Err(e) => {
                        self.in_pre = saved;
                        return Err(e);
                    }
                }
            }
        }
        self.in_pre = saved;
        Ok(self.cat(&out))
    }

    /// `shouldHugStart` / `shouldHugEnd`.
    pub(super) fn should_hug(
        &self,
        identifier: TemplateNodeIdentifier,
        children: &[TemplateNodeIdentifier],
        start: bool,
    ) -> bool {
        if self.is_block(identifier) {
            return false;
        }
        let Some(&edge) = (if start {
            children.first()
        } else {
            children.last()
        }) else {
            return true;
        };
        if start {
            !self.text_starts_ws(edge)
        } else {
            !self.text_ends_ws(edge)
        }
    }
}
