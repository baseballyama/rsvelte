use super::{
    Cow, LayoutInstructionIdentifier, LayoutInstructions, PRINT_WIDTH, Printer, R, Span, TAB_WIDTH,
    TagAttributes, TemplateNode, TemplateNodeIdentifier, Unsupported, only_ws,
};

impl Printer<'_, '_> {
    /// `printTopLevelParts` for `options-scripts-markup-styles`.
    pub(super) fn top_level(&mut self) -> R<LayoutInstructionIdentifier> {
        self.refuse_moved_comments()?;
        let mut parts = Vec::new();
        let c = self.c;
        if let Some(script) = &c.instance {
            let body = self.script_body(script.content, script.program)?;
            let tag = self.embed_tag("script", &script.attributes, body);
            let h = self.d().hardline();
            parts.push(self.cat(&[tag, h]));
        }
        let root = self.merged_root();
        let markup = self.fragment(&root)?;
        if let Some(markup) = markup {
            parts.push(markup);
        }
        if let Some(style) = &c.style {
            let body = self.style_body(style)?;
            let tag = self.embed_tag("style", &style.attributes, body);
            let h = self.d().hardline();
            parts.push(self.cat(&[tag, h]));
        }
        let sep = self.d().hardline();
        let joined = self.d().join(sep, &parts);
        Ok(self.group(&joined))
    }

    /// The plugin moves HTML comments right before a `<script>`/`<style>` along with it, and keeps
    /// `<!-- #endregion -->` below it; neither is ported.
    pub(super) fn refuse_moved_comments(&self) -> R<()> {
        let hoisted: Vec<Span> = self
            .c
            .instance
            .iter()
            .map(|s| s.span)
            .chain(self.c.style.iter().map(|s| s.span))
            .collect();
        for &identifier in self.c.children(self.c.root) {
            let TemplateNode::Comment { span, data } = *self.c.node(identifier) else {
                continue;
            };
            let data = data.text(self.source_text).trim();
            if data.starts_with("prettier-ignore") {
                return Err(Unsupported::at("prettier-ignore comments", span));
            }
            for h in &hoisted {
                let before = span.end_offset <= h.start_offset
                    && only_ws(
                        &self.source_text[span.end_offset as usize..h.start_offset as usize],
                    );
                let after = h.end_offset <= span.start_offset
                    && only_ws(
                        &self.source_text[h.end_offset as usize..span.start_offset as usize],
                    );
                if before || (after && data.contains("endregion")) {
                    return Err(Unsupported::at(
                        "comments attached to <script> or <style>",
                        span,
                    ));
                }
            }
        }
        Ok(())
    }

    /// `mergeAdjacentTextNodesInFragment` on the root, where removing `<script>` and `<style>`
    /// leaves text nodes side by side.
    pub(super) fn merged_root(&mut self) -> Vec<TemplateNodeIdentifier> {
        let mut out: Vec<TemplateNodeIdentifier> = Vec::new();
        let c = self.c;
        for &identifier in c.children(c.root) {
            if let Some(&prev) = out.last()
                && self.is_text(prev)
                && self.is_text(identifier)
            {
                self.trim_right(prev);
                let merged = format!("{}{}", self.raw(prev), self.raw(identifier));
                self.set_raw(prev, Cow::Owned(merged));
                continue;
            }
            out.push(identifier);
        }
        out
    }

    /// `embedTag` for a top-level `<script>` / `<style>`.
    pub(super) fn embed_tag(
        &mut self,
        tag: &'static str,
        attributes: &[TagAttributes],
        body: LayoutInstructionIdentifier,
    ) -> LayoutInstructionIdentifier {
        let mut inner = Vec::new();
        for &(name, value) in attributes {
            let line = self.d().line();
            let a = match value {
                None => {
                    let source_text = self.source_text;
                    self.d().text(name.text(source_text))
                }
                Some(v) => {
                    let text = format!(
                        "{}=\"{}\"",
                        name.text(self.source_text),
                        v.text(self.source_text)
                    );
                    self.d().text(&text)
                }
            };
            inner.push(self.cat(&[line, a]));
        }
        let soft = self.d().softline();
        inner.push(self.d().dedent(soft));
        let g = self.group(&inner);
        let attributes = self.d().indent(g);
        let lt = self.lit("<");
        let name = self.lit(tag);
        let gt = self.lit(">");
        let open = self.group(&[lt, name, attributes, gt]);
        let close = self.d().text(&format!("</{tag}>"));
        self.group(&[open, body, close])
    }

    /// `formatBodyContent` around the script's program.
    pub(super) fn script_body(
        &mut self,
        content: Span,
        program: rsvelte_typescript::NodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let text = content.text(self.source_text);
        if text.trim().is_empty() {
            return Ok(if text.is_empty() {
                self.d().nil()
            } else {
                self.d().hardline()
            });
        }
        let body = self.javascript.program(program)?;
        Ok(self.indented_body(body))
    }

    /// `[indent([hardline, body]), hardline]` after trimming the body's trailing lines.
    pub(super) fn indented_body(
        &mut self,
        body: LayoutInstructionIdentifier,
    ) -> LayoutInstructionIdentifier {
        let mut v = vec![body];
        self.d().trim_right(&mut v, LayoutInstructions::is_line);
        let h = self.d().hardline();
        let mut inner = vec![h];
        inner.extend(v);
        let inner = self.cat(&inner);
        let inner = self.d().indent(inner);
        let h = self.d().hardline();
        self.cat(&[inner, h])
    }

    pub(super) fn style_body(
        &mut self,
        style: &rsvelte_svelte::syntax::syntax_tree::Style,
    ) -> R<LayoutInstructionIdentifier> {
        if let Some((n, _)) = style.attributes.iter().find(|(n, v)| {
            matches!(n.text(self.source_text), "lang" | "type")
                && v.is_some_and(|v| v.text(self.source_text) != "css")
        }) {
            return Err(Unsupported::at("a style language other than CSS", *n));
        }
        let text = style.sheet.content.text(self.source_text);
        if text.trim().is_empty() {
            return Ok(if text.is_empty() {
                self.d().nil()
            } else {
                self.d().hardline()
            });
        }
        let stylesheet =
            rsvelte_stylesheet_format::format(self.source_text, &style.sheet, "", "  ")?;
        // The CSS printer makes no width decisions; it is exact only while no line has to wrap.
        if stylesheet
            .lines()
            .any(|l| TAB_WIDTH + rsvelte_kernel::output::document::string_width(l) > PRINT_WIDTH)
        {
            return Err(Unsupported::at(
                "a CSS line longer than the print width",
                style.span,
            ));
        }
        let mut parts = Vec::new();
        for (i, line) in stylesheet.trim_end_matches('\n').split('\n').enumerate() {
            if i > 0 {
                parts.push(self.d().hardline());
            }
            parts.push(self.d().text(line));
        }
        let body = self.cat(&parts);
        Ok(self.indented_body(body))
    }
}
