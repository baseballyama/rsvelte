use super::embed::is_javascript_whitespace;
use super::{
    Attribute, AttributeKind, AttributeValue, ElementKind, LayoutInstructionIdentifier, Part,
    Printer, R, TemplateNode, TemplateNodeIdentifier, Unsupported, is_collapse_ws,
};
use crate::options::WhitespaceSensitivity;

/// prettier-plugin-svelte `selfClosingTags`.
const SELF_CLOSING: &[&str] = &[
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source",
    "track", "wbr",
];

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
        // Only `svelteSortOrder: "none"` leaves it among the root's children.
        if name == "svelte:options" {
            return self.options_tag(identifier);
        }
        if matches!(name, "script" | "style") {
            return Err(Unsupported::at(
                "<script> or <style> inside an element",
                span,
            ));
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
        let kind = self.element_kind(name);
        let is_doctype = name.eq_ignore_ascii_case("!DOCTYPE");
        let self_closing = is_empty
            && (did_self_close
                || SELF_CLOSING.contains(&name)
                || is_doctype
                || name == "svelte:window");
        let was_pre = self.in_pre;
        let is_pre_el = kind == ElementKind::Regular
            && matches!(name.to_ascii_lowercase().as_str(), "pre" | "textarea");
        let in_pre = was_pre || is_pre_el;

        let mut attribute_docs = Vec::new();
        let c = self.c;
        let attributes = attributes.get(&c.attributes);
        // Svelte takes `this` out of the attributes, and the plugin prints it first.
        let this = matches!(name, "svelte:component" | "svelte:element")
            .then(|| {
                attributes.iter().position(|a| {
                    a.kind == AttributeKind::Attribute && a.name.text(self.source_text) == "this"
                })
            })
            .flatten();
        let many = attributes.len() - usize::from(this.is_some()) > 1
            || (this.is_some() && attributes.len() > 1);
        if let Some(i) = this {
            let line = self.attribute_line(many);
            let document = self.this_binding(&attributes[i], name == "svelte:element")?;
            attribute_docs.push(self.cat(&[line, document]));
        }
        // The plugin's `isPreTagContent` counts the `<pre>` itself, attributes included.
        self.in_pre = in_pre;
        for (i, a) in attributes.iter().enumerate() {
            if Some(i) == this {
                continue;
            }
            let line = self.attribute_line(many);
            let document = self.attribute(a, kind);
            let document = match document {
                Ok(d) => d,
                Err(e) => {
                    self.in_pre = was_pre;
                    return Err(e);
                }
            };
            attribute_docs.push(self.cat(&[line, document]));
        }
        self.in_pre = was_pre;
        // What the children see: Svelte's `parent_is_head` and `parent_is_shadowroot_template`.
        let context = (
            match (name, kind) {
                ("svelte:head", _) => true,
                (_, ElementKind::Regular) => false,
                _ if rsvelte_svelte_syntax::names::is_component_name(name) => false,
                _ => self.in_head,
            },
            self.in_shadow_root
                || (kind == ElementKind::Regular
                    && attributes.iter().any(|a| {
                        a.kind == AttributeKind::Attribute
                            && a.name.text(self.source_text) == "shadowrootmode"
                    })),
            self.is_block(identifier)
                .then(|| {
                    children
                        .iter()
                        .rev()
                        .copied()
                        .find(|&c| !self.is_empty_text(c))
                })
                .flatten(),
        );
        let same_line = self.options.bracket_same_line;
        let lt = self.lit("<");
        let name_doc = self.d().text(name);
        if self_closing {
            let mut inner = attribute_docs;
            if !same_line && !is_doctype {
                let line = self.d().line();
                inner.push(self.d().dedent(line));
            }
            let g = self.group(&inner);
            let indentation = self.d().indent(g);
            let close = self.lit(match (is_doctype, same_line) {
                (true, _) => ">",
                (false, true) => " />",
                (false, false) => "/>",
            });
            return Ok(self.group(&[lt, name_doc, indentation, close]));
        }

        let first = children.first().copied();
        let last = children.last().copied();
        let is_inline = kind == ElementKind::Regular && !self.is_block(identifier) && !in_pre;
        let hug_start = self.should_hug(identifier, children, true);
        let hug_end = self.should_hug(identifier, children, false);
        // Decided before the separators below trim the first text.
        let empty_line = is_empty
            && is_inline
            && children.first().is_some_and(|&f| self.text_starts_ws(f))
            && !in_pre;

        let mut open_inner = attribute_docs;
        if (is_empty || !hug_start) && !same_line && !in_pre {
            let soft = self.d().softline();
            open_inner.push(self.d().dedent(soft));
        }
        let g = self.group(&open_inner);
        let attributes_doc = self.d().indent(g);
        let opening = [lt, name_doc, attributes_doc];
        let close_full = self.d().text_parts(&["</", name, ">"]);

        if hug_start && hug_end {
            let body = self.element_body(children, is_empty, empty_line, in_pre, context)?;
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
            let omit =
                (is_empty && !same_line) || self.can_omit_softline_before_closing_tag(identifier);
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
            let body = self.element_body(children, is_empty, empty_line, in_pre, context)?;
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
            let body = self.element_body(children, is_empty, empty_line, in_pre, context)?;
            let close_open = self.d().text_parts(&["</", name]);
            let inner = self.group(&[body, close_open]);
            let indentation = self.cat(&[sep_start, inner]);
            let indentation = self.d().indent(indentation);
            let gt = self.lit(">");
            let mut parts = opening.to_vec();
            parts.extend([gt, indentation]);
            if !self.can_omit_softline_before_closing_tag(identifier) {
                parts.push(self.d().softline());
            }
            parts.push(self.lit(">"));
            return Ok(self.group(&parts));
        }
        let body = self.element_body(children, is_empty, empty_line, in_pre, context)?;
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
        empty_line: bool,
        in_pre: bool,
        (in_head, in_shadow_root, last_in_block): (bool, bool, Option<TemplateNodeIdentifier>),
    ) -> R<LayoutInstructionIdentifier> {
        if is_empty {
            return Ok(if empty_line {
                self.d().line()
            } else if self.options.bracket_same_line {
                self.d().softline()
            } else {
                self.d().nil()
            });
        }
        let saved = (
            self.in_pre,
            self.in_head,
            self.in_shadow_root,
            self.last_in_block,
        );
        (self.in_head, self.in_shadow_root, self.last_in_block) =
            (in_head, in_shadow_root, last_in_block);
        let docs = if in_pre {
            self.pre(children).map(|d| vec![d])
        } else {
            self.in_pre = false;
            self.print_children(children)
        };
        (
            self.in_pre,
            self.in_head,
            self.in_shadow_root,
            self.last_in_block,
        ) = saved;
        let docs = docs?;
        let d = self.cat(&docs);
        self.give_buffer(docs);
        Ok(d)
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
        if self.is_block(identifier) || self.element_name(identifier) == Some("svelte:boundary") {
            return false;
        }
        let Some(&edge) = (if start {
            children.first()
        } else {
            children.last()
        }) else {
            return true;
        };
        if self.options.markup_whitespace_sensitivity == WhitespaceSensitivity::Ignore {
            return false;
        }
        if start {
            !self.text_starts_ws(edge)
        } else {
            !self.text_ends_ws(edge)
        }
    }
}

impl Printer<'_, '_> {
    /// `this=` of `<svelte:component>` or `<svelte:element>`. Svelte reads a string `this` of
    /// `<svelte:element>` into a literal, which the plugin prints in double quotes, in braces if
    /// it was written in braces.
    fn this_binding(&mut self, a: &Attribute, element: bool) -> R<LayoutInstructionIdentifier> {
        let (c, source_text) = (self.c, self.source_text);
        let parts = match a.value {
            AttributeValue::Parts(r) => r.get(&c.parts),
            AttributeValue::True => &[][..],
        };
        let quoted = |value: &str| {
            if value.contains(['"', '&', '\\']) {
                Err(Unsupported::at(
                    "a `this` the plugin would print unescaped",
                    a.span,
                ))
            } else {
                Ok(value.to_owned())
            }
        };
        let text = match *parts {
            [Part::Text(span)] if element => {
                format!("this=\"{}\"", quoted(span.text(source_text))?)
            }
            [Part::Expression { expression, span }] => {
                let literal = element
                    && matches!(
                        c.javascript.kind(expression),
                        rsvelte_typescript_syntax::Kind::String
                    );
                if !literal {
                    let open = self.lit("this={");
                    let e = self.expression(expression, false, false)?;
                    let close = self.lit("}");
                    return Ok(self.cat(&[open, e, close]));
                }
                let raw = c
                    .javascript
                    .source_location(expression)
                    .span()
                    .expect("a parsed expression has a source span");
                let value = quoted(&raw.text(source_text)[1..raw.len() as usize - 1])?;
                // `originalText[tag.start - 1] === '{'`.
                if raw.start_offset == span.start_offset + 1 {
                    format!("this={{\"{value}\"}}")
                } else {
                    format!("this=\"{value}\"")
                }
            }
            _ => return Err(Unsupported::at("this `this`", a.span)),
        };
        Ok(self.d().text(&text))
    }
}

impl Printer<'_, '_> {
    /// `canOmitSoftlineBeforeClosingTag`: under `bracketSameLine`, when the element does not hug
    /// what follows it, or is the last child of a block element.
    fn can_omit_softline_before_closing_tag(&self, identifier: TemplateNodeIdentifier) -> bool {
        if !self.options.bracket_same_line {
            return false;
        }
        // `hugsStartOfNextNode`, on the trimmed source the plugin sees.
        let end = self.c.node(identifier).span().end_offset as usize;
        let rest = self.source_text[end..].trim_end_matches(is_javascript_whitespace);
        let hugs_next = !rest.is_empty() && !rest.starts_with(is_collapse_ws);
        !hugs_next || self.last_in_block == Some(identifier)
    }
}
