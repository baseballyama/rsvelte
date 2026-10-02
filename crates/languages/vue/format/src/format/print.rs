use super::{
    Embed, Kind2, LayoutInstructionIdentifier, LayoutInstructions, PRINT_WIDTH, Printer, R, ROOT,
    Unsupported,
};

impl Printer<'_, '_> {
    // ---- printer-html.js, print/element.js -------------------------------------------

    pub(super) fn print(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        match &self.n(i).kind {
            Kind2::Element { .. } => self.element(i),
            Kind2::Text(_) => self.text(i),
            Kind2::Interpolation(e) => {
                let e = *e;
                let start = self.opening_tag_start(i);
                let expression = self.expression(e, false)?;
                let l = self.d().line();
                let inner = self.cat(&[l, expression]);
                let indentation = self.d().indent(inner);
                let after = if self
                    .n(i)
                    .next
                    .is_some_and(|x| self.borrows_prev_close_end(x))
                {
                    self.lit(" ")
                } else {
                    self.d().line()
                };
                let end = self.closing_tag_end(i);
                Ok(self.cat(&[start, indentation, after, end]))
            }
            Kind2::Root => unreachable!("the root is printed by `format`"),
        }
    }

    pub(super) fn text(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        let parent = self.n(i).parent;
        if let Kind2::Element { embed, .. } = self.n(parent).kind
            && embed != Embed::None
        {
            let body = self.embedded(embed)?;
            let bp = self.d().break_parent();
            let prefix = self.opening_tag_prefix(i);
            let suffix = self.closing_tag_suffix(i);
            return Ok(self.cat(&[bp, prefix, body, suffix]));
        }
        let Kind2::Text(value) = &self.n(i).kind else {
            unreachable!("a text node")
        };
        let words: Vec<String> = value.split_ascii_whitespace().map(str::to_owned).collect();
        let prefix = self.opening_tag_prefix(i);
        let suffix = self.closing_tag_suffix(i);
        let mut parts = Vec::with_capacity(words.len() * 2);
        for (j, w) in words.iter().enumerate() {
            if j > 0 {
                parts.push(self.d().line());
            }
            parts.push(self.d().text(w));
        }
        parts[0] = self.cat(&[prefix, parts[0]]);
        let last = parts.len() - 1;
        parts[last] = self.cat(&[parts[last], suffix]);
        Ok(self.d().fill(&parts))
    }

    /// A script or style body, as `textToDoc` returns it (no trailing line).
    pub(super) fn embedded(&mut self, embed: Embed) -> R<LayoutInstructionIdentifier> {
        match embed {
            Embed::Script(program) => {
                let document = self.javascript.program(program)?;
                let mut v = vec![document];
                self.d().trim_right(&mut v, LayoutInstructions::is_line);
                Ok(self.cat(&v))
            }
            Embed::Style(index) => {
                let style = &self.c.styles[index];
                let stylesheet =
                    rsvelte_stylesheet_format::format(self.source_text, &style.sheet, "", "  ")?;
                if stylesheet
                    .lines()
                    .any(|l| rsvelte_kernel::output::document::string_width(l) > PRINT_WIDTH)
                {
                    return Err(Unsupported::at(
                        "a CSS line longer than the print width",
                        style.span,
                    ));
                }
                let mut parts = Vec::new();
                for (j, line) in stylesheet.trim_end_matches('\n').split('\n').enumerate() {
                    if j > 0 {
                        parts.push(self.d().hardline());
                    }
                    parts.push(self.d().text(line));
                }
                Ok(self.cat(&parts))
            }
            Embed::None => unreachable!("an embedding block"),
        }
    }

    /// `printElement`.
    pub(super) fn element(&mut self, i: usize) -> R<LayoutInstructionIdentifier> {
        let n = self.n(i);
        let children = n.children.clone();
        let should_hug = children.len() == 1 && {
            let f = self.n(children[0]);
            matches!(f.kind, Kind2::Interpolation(_))
                && f.sensitive.leading
                && !f.has.leading
                && f.sensitive.trailing
                && !f.has.trailing
        };
        let gid = self.d().new_group_identifier();
        let opening = self.opening_tag(i)?;
        let opening = self.d().group_with_identifier(&[opening], gid);
        if children.is_empty() {
            let n = self.n(i);
            let inner = if n.has.dangling && n.sensitive.dangling {
                self.d().line()
            } else {
                self.d().nil()
            };
            let closing = self.closing_tag(i);
            return Ok(self.d().group(&[opening, inner, closing]));
        }
        let first = children[0];
        let last = *children.last().expect("non-empty");
        let before = if should_hug {
            let soft = self.d().softline();
            let nil = self.d().nil();
            self.d().if_break_of(soft, nil, gid)
        } else if self.n(first).has.leading && self.n(first).sensitive.leading {
            self.d().line()
        } else {
            self.d().softline()
        };
        let printed = self.children(i)?;
        let mut body = vec![before];
        body.extend(printed);
        let body = self.cat(&body);
        let body = if should_hug {
            self.d().indent_if_break(body, gid)
        } else if self.t.is_script_like(i) && self.n(i).parent == ROOT {
            body
        } else {
            self.d().indent(body)
        };
        let after = if self.close_end_borrowed(i) {
            if self.n(last).has.trailing && self.n(last).sensitive.trailing {
                self.lit(" ")
            } else {
                self.d().nil()
            }
        } else if should_hug {
            let soft = self.d().softline();
            let nil = self.d().nil();
            self.d().if_break_of(soft, nil, gid)
        } else if self.n(last).has.trailing && self.n(last).sensitive.trailing {
            self.d().line()
        } else {
            self.d().softline()
        };
        let force = if self.force_break_content(i) {
            self.d().break_parent()
        } else {
            self.d().nil()
        };
        let closing = self.closing_tag(i);
        Ok(self.d().group(&[opening, force, body, after, closing]))
    }
}
