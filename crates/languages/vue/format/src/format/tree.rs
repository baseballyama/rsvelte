use super::{
    Attributes, Cow, Embed, Kind2, LineIndex, Node, R, REFUSED_TAGS, ROOT, SingleFileComponent,
    Span, TagAttributes, TemplateNode, TemplateNodeIdentifier, Tree, Unsupported, VOID_TAGS,
    only_ws,
};

impl<'a> Tree<'a> {
    pub(super) fn build(
        c: &'a SingleFileComponent,
        source_text: &'a str,
        lines: &'a LineIndex,
    ) -> R<Self> {
        // The parser has read the document, so its offsets fit in `u32`.
        let len = source_text.len() as u32;
        let mut t = Tree {
            n: vec![Node::new(Kind2::Root, usize::MAX, Span::new(0, len))],
            lines,
            source_text,
        };
        let mut blocks: Vec<(Span, usize)> = Vec::new();
        if let Some(tpl) = &c.template {
            let identifier = t.push(
                Kind2::Element {
                    name: "template",
                    attributes: Attributes::Block(&tpl.attributes),
                    embed: Embed::None,
                },
                ROOT,
                tpl.span,
            );
            t.n[identifier].open_end = tpl.content.start_offset;
            t.n[identifier].close_start = Some(tpl.content.end_offset);
            let children = t.template_nodes(c, identifier, c.children(tpl.root))?;
            t.n[identifier].children = children;
            blocks.push((tpl.span, identifier));
        }
        if let Some(s) = &c.script {
            let identifier = t.block(
                "script",
                &s.attributes,
                Embed::Script(s.program),
                s.span,
                s.content,
            );
            blocks.push((s.span, identifier));
        }
        for (i, s) in c.styles.iter().enumerate() {
            if s.attributes.iter().any(|(n, v)| {
                n.text(source_text) == "lang" && v.is_some_and(|v| v.text(source_text) != "css")
            }) {
                return Err(Unsupported::at("a style language other than CSS", s.span));
            }
            let identifier = t.block("style", &s.attributes, Embed::Style(i), s.span, s.content);
            blocks.push((s.span, identifier));
        }
        blocks.sort_by_key(|b| b.0.start_offset);
        let mut at = 0;
        for (i, &(span, identifier)) in blocks.iter().enumerate() {
            let gap = &source_text[at as usize..span.start_offset as usize];
            if !only_ws(gap) {
                return Err(Unsupported::at(
                    "content between the blocks",
                    Span::new(at, span.start_offset),
                ));
            }
            if !gap.is_empty() {
                t.n[identifier].has.leading = true;
                if i > 0 {
                    t.n[blocks[i - 1].1].has.trailing = true;
                }
            }
            at = span.end_offset;
        }
        if !only_ws(&source_text[at as usize..]) {
            return Err(Unsupported::at(
                "content after the blocks",
                Span::new(at, len),
            ));
        }
        if at < len
            && let Some(&(_, last)) = blocks.last()
        {
            t.n[last].has.trailing = true;
        }
        t.n[ROOT].children = blocks.iter().map(|b| b.1).collect();
        t.extract_whitespace();
        t.link();
        t.display_and_closing();
        t.space_sensitivity();
        t.merge_simple_elements();
        t.link();
        Ok(t)
    }

    pub(super) fn push(&mut self, kind: Kind2<'a>, parent: usize, span: Span) -> usize {
        self.n.push(Node::new(kind, parent, span));
        self.n.len() - 1
    }

    /// A `<script>` or `<style>` block: one raw text child, or none when only whitespace.
    pub(super) fn block(
        &mut self,
        name: &'static str,
        attributes: &'a [TagAttributes],
        embed: Embed,
        span: Span,
        content: Span,
    ) -> usize {
        let identifier = self.push(
            Kind2::Element {
                name,
                attributes: Attributes::Block(attributes),
                embed,
            },
            ROOT,
            span,
        );
        self.n[identifier].open_end = content.start_offset;
        self.n[identifier].close_start = Some(content.end_offset);
        let text = content.text(self.source_text);
        if only_ws(text) {
            self.n[identifier].has.dangling = !text.is_empty();
        } else {
            let t = self.push(Kind2::Text(Cow::Borrowed(text)), identifier, content);
            self.n[identifier].children = vec![t];
        }
        identifier
    }

    pub(super) fn template_nodes(
        &mut self,
        c: &'a SingleFileComponent,
        parent: usize,
        children: &[TemplateNodeIdentifier],
    ) -> R<Vec<usize>> {
        let mut out = Vec::with_capacity(children.len());
        for &k in children {
            let identifier = match *c.node(k) {
                TemplateNode::Text { span } => self.push(
                    Kind2::Text(Cow::Borrowed(span.text(self.source_text))),
                    parent,
                    span,
                ),
                TemplateNode::Comment { span, .. } => {
                    return Err(Unsupported::at("a template comment", span));
                }
                TemplateNode::Interpolation { expression, span } => {
                    self.push(Kind2::Interpolation(expression), parent, span)
                }
                TemplateNode::Element {
                    name,
                    attributes,
                    children,
                    start_tag,
                    self_closing,
                    span,
                } => {
                    let tag = name.text(self.source_text);
                    // An empty `<textarea>` has no content for its `white-space` to preserve.
                    let empty_textarea = tag == "textarea" && children.len == 0;
                    let refused = REFUSED_TAGS.contains(&tag) && !empty_textarea;
                    if refused || tag.contains('-') || tag.contains(':') {
                        return Err(Unsupported::at("this element", name));
                    }
                    let attributes = c.attributes(attributes);
                    let identifier = self.push(
                        Kind2::Element {
                            name: tag,
                            attributes: Attributes::Template(attributes),
                            embed: Embed::None,
                        },
                        parent,
                        span,
                    );
                    self.n[identifier].open_end = start_tag.end_offset;
                    let void = VOID_TAGS.contains(&tag);
                    self.n[identifier].self_closing = void || self_closing;
                    if !void && !self_closing {
                        let close = self.source_text[..span.end_offset as usize]
                            .rfind("</")
                            .ok_or_else(|| {
                                Unsupported::at("an element without an end tag", span)
                            })?;
                        self.n[identifier].close_start =
                            Some(span.start_offset + (close - span.start_offset as usize) as u32);
                    }
                    let children = self.template_nodes(c, identifier, c.children(children))?;
                    self.n[identifier].children = children;
                    identifier
                }
            };
            out.push(identifier);
        }
        Ok(out)
    }

    pub(super) fn link(&mut self) {
        for i in 0..self.n.len() {
            let children = self.n[i].children.clone();
            for (j, &k) in children.iter().enumerate() {
                self.n[k].parent = i;
                self.n[k].prev = j.checked_sub(1).map(|p| children[p]);
                self.n[k].next = children.get(j + 1).copied();
            }
        }
    }

    pub(super) fn is_element(&self, i: usize) -> bool {
        matches!(self.n[i].kind, Kind2::Element { .. })
    }

    pub(super) fn name(&self, i: usize) -> Option<&'a str> {
        match self.n[i].kind {
            Kind2::Element { name, .. } => Some(name),
            _ => None,
        }
    }

    /// `isScriptLikeTag`.
    pub(super) fn is_script_like(&self, i: usize) -> bool {
        matches!(self.name(i), Some("script" | "style"))
    }

    pub(super) fn is_text(&self, i: usize) -> bool {
        matches!(self.n[i].kind, Kind2::Text(_))
    }
}
