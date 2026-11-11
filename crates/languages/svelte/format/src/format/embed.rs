use rsvelte_kernel::source::characters::is_ecmascript_whitespace;

use super::children::Child;
use super::javascript::{Adjust, Part as JavaScriptPart};
use super::{
    Attribute, AttributeKind, AttributeValue, Cow, ElementKind, LayoutInstructionIdentifier,
    LayoutInstructions, Part, Printer, R, Span, TagAttributes, TemplateNode,
    TemplateNodeIdentifier, Unsupported, only_ws,
};
use crate::options::Part as SortPart;

impl Printer<'_, '_, '_> {
    /// `printTopLevelParts`: options, scripts, markup and styles in `svelteSortOrder`, or in the
    /// source's order without one.
    pub(super) fn top_level(&mut self) -> R<LayoutInstructionIdentifier> {
        self.refuse_moved_comments()?;
        let c = self.c;
        for span in c
            .module
            .iter()
            .chain(&c.instance)
            .map(|s| s.span)
            .chain(c.style.iter().map(|s| s.span))
        {
            self.refuse_unembedded(span)?;
        }
        let mut root = c.children(c.root).to_vec();
        let mut hoisted = Vec::new();
        for script in c.module.iter().chain(&c.instance) {
            let comments = self.leading_comments(&mut root, script.span.start_offset);
            let body = if self.ignores(&comments) {
                self.preformatted(script.content)
            } else {
                self.refuse_script_language(&script.attributes)?;
                self.script_body(script.content)?
            };
            let tag = self.embed_tag("script", &script.attributes, body);
            let tag = self.with_comments(&comments, tag);
            hoisted.push((SortPart::Scripts, script.span, tag));
        }
        if let Some(style) = &c.style {
            let comments = self.leading_comments(&mut root, style.span.start_offset);
            let body = if self.ignores(&comments) {
                // The task formats only a component whose style sheet parsed.
                if style.sheet.is_err() {
                    return Err(Unsupported::at(
                        "a style sheet that does not parse",
                        style.content,
                    ));
                }
                self.preformatted(style.content)
            } else {
                self.style_body(style)?
            };
            let tag = self.embed_tag("style", &style.attributes, body);
            let tag = self.with_comments(&comments, tag);
            hoisted.push((SortPart::Styles, style.span, tag));
        }
        let pragma = self.options.insert_pragma && !super::has_pragma(self.source_text);
        let Some(order) = self.options.svelte_sort_order.0 else {
            let markup = self.in_source_order(&root, &hoisted)?;
            return Ok(self.with_pragma(pragma, markup));
        };
        let (options, root) = self.svelte_options(root)?;
        let root: Vec<Child> = root.into_iter().map(Child::Node).collect();
        let root = self.merged_root(&root);
        let markup = self.fragment(&root)?;
        let mut parts = Vec::new();
        for part in order {
            match part {
                SortPart::Options => parts.extend(options),
                SortPart::Markup => parts.extend(markup),
                SortPart::Scripts | SortPart::Styles => {
                    for &(_, _, tag) in hoisted.iter().filter(|h| h.0 == part) {
                        let h = self.d().hardline();
                        parts.push(self.cat(&[tag, h]));
                    }
                }
            }
        }
        if pragma {
            // The plugin groups the parts without joining them here.
            let parts = self.group(&parts);
            return Ok(self.with_pragma(true, parts));
        }
        let sep = self.d().hardline();
        let joined = self.d().join(sep, &parts);
        Ok(self.group(&joined))
    }

    /// `insertPragma`: `<!-- @format -->` on a line of its own above the rest.
    fn with_pragma(
        &mut self,
        pragma: bool,
        rest: LayoutInstructionIdentifier,
    ) -> LayoutInstructionIdentifier {
        if !pragma {
            return rest;
        }
        let comment = self.lit("<!-- @format -->");
        let h = self.d().hardline();
        self.cat(&[comment, h, rest])
    }

    /// `svelteSortOrder: "none"`: each `<script>` and `<style>` goes back before the root node that
    /// starts where it ends, or after the last node if that ends where it starts. The plugin
    /// drops a part that finds no such place and repeats one that finds two, so those are refused.
    fn in_source_order(
        &mut self,
        root: &[TemplateNodeIdentifier],
        hoisted: &[(SortPart, Span, LayoutInstructionIdentifier)],
    ) -> R<LayoutInstructionIdentifier> {
        let c = self.c;
        let end = self.source_text.len() as u32;
        // The plugin parses the trimmed source, where whitespace alone at either end is no node.
        let mut children: Vec<(Child, Span)> = root
            .iter()
            .filter(|&&n| {
                let span = c.node(n).span();
                !(self.is_text(n)
                    && (span.start_offset == 0 || span.end_offset == end)
                    && self
                        .raw(n)
                        .trim_matches(is_ecmascript_whitespace)
                        .is_empty())
            })
            .map(|&n| (Child::Node(n), c.node(n).span()))
            .collect();
        let mut by_end = vec![true; hoisted.len()];
        let mut placed = vec![0_u32; hoisted.len()];
        let mut i = 0;
        while i < children.len() {
            let span = children[i].1;
            if let Some(h) = (0..hoisted.len())
                .find(|&h| by_end[h] && hoisted[h].1.end_offset == span.start_offset)
            {
                by_end[h] = false;
                placed[h] += 1;
                children.insert(i, (Child::Printed(hoisted[h].2), hoisted[h].1));
            } else if i + 1 == children.len()
                && let Some(h) =
                    (0..hoisted.len()).find(|&h| hoisted[h].1.start_offset == span.end_offset)
            {
                placed[h] += 1;
                children.push((Child::Printed(hoisted[h].2), hoisted[h].1));
            }
            i += 1;
        }
        if let Some(h) = placed.iter().position(|&n| n != 1) {
            return Err(Unsupported::at(
                "a <script> or <style> that `svelteSortOrder: none` drops or repeats",
                hoisted[h].1,
            ));
        }
        let children: Vec<Child> = children.into_iter().map(|(c, _)| c).collect();
        let root = self.merged_root(&children);
        let markup = self.fragment(&root)?;
        Ok(markup.unwrap_or_else(|| self.d().nil()))
    }

    /// `<svelte:options …/>`, as the plugin prints it at the top or, unsorted, in place.
    pub(super) fn options_tag(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let c = self.c;
        let TemplateNode::Element {
            attributes, span, ..
        } = *c.node(identifier)
        else {
            unreachable!("an element")
        };
        // Svelte rejects any child, and the plugin throws on a blank one.
        if !self.children(identifier).is_empty() {
            return Err(Unsupported::at("`<svelte:options>` with children", span));
        }
        let mut inner = Vec::new();
        let attributes = attributes.get(&c.attributes);
        for a in attributes {
            if !self.is_valid_option(a) {
                return Err(Unsupported::at(
                    "a `<svelte:options>` attribute Svelte may reject",
                    a.span,
                ));
            }
            let line = self.attribute_line(attributes.len() > 1);
            let document = self.attribute(a, ElementKind::Other)?;
            inner.push(self.cat(&[line, document]));
        }
        let same_line = self.options.bracket_same_line;
        if !same_line {
            let line = self.d().line();
            inner.push(self.d().dedent(line));
        }
        let g = self.group(&inner);
        let attributes = self.d().indent(g);
        let open = self.lit("<svelte:options");
        let close = self.lit(if same_line { " />" } else { "/>" });
        Ok(self.group(&[open, attributes, close]))
    }

    /// `printSvelteOptions` with `stripSvelteOptionsComment`: Svelte takes `<svelte:options>` out
    /// of the root, and the plugin moves the comment right above it along. Returns its layout and
    /// the root's children without them.
    fn svelte_options(
        &mut self,
        mut root: Vec<TemplateNodeIdentifier>,
    ) -> R<(
        Option<LayoutInstructionIdentifier>,
        Vec<TemplateNodeIdentifier>,
    )> {
        let c = self.c;
        let Some(at) = root
            .iter()
            .position(|&n| self.element_name(n) == Some("svelte:options"))
        else {
            return Ok((None, root));
        };
        let identifier = root.remove(at);
        let span = c.node(identifier).span();
        let mut comment = None;
        for i in 0..root.len() {
            let TemplateNode::Comment { span: s, .. } = *c.node(root[i]) else {
                continue;
            };
            if s.end_offset == span.start_offset {
                comment = Some(root.remove(i));
                break;
            }
            if root.get(i + 1).is_some_and(|&n| {
                self.is_text(n)
                    && only_ws(self.raw(n))
                    && c.node(n).span().end_offset == span.start_offset
            }) {
                comment = Some(root.remove(i));
                root.remove(i);
                break;
            }
        }
        let tag = self.options_tag(identifier)?;
        let h = self.d().hardline();
        let mut doc = self.group(&[tag, h]);
        if let Some(comment) = comment {
            let comment = self.node(comment)?;
            let h = self.d().hardline();
            doc = self.group(&[comment, h, doc]);
        }
        Ok((Some(doc), root))
    }

    /// `removeAndGetLeadingComments`: the comments right above the root part that starts at
    /// `start`, in source order, each with whether an empty line follows it. They and the
    /// whitespace after each leave `root`; the whitespace above the first stays.
    fn leading_comments(
        &self,
        root: &mut Vec<TemplateNodeIdentifier>,
        start: u32,
    ) -> Vec<(Span, bool)> {
        let c = self.c;
        let mut comments = Vec::new();
        let mut after: Vec<Option<TemplateNodeIdentifier>> = Vec::new();
        let mut at = start;
        while let Some(&previous) = root.iter().find(|&&n| c.node(n).span().end_offset == at) {
            if let TemplateNode::Comment { data, .. } = *c.node(previous)
                && !matches!(
                    data.text(self.source_text)
                        .trim_matches(is_ecmascript_whitespace),
                    "prettier-ignore-start" | "prettier-ignore-end"
                )
            {
                comments.push((previous, data));
                if comments.len() != after.len() {
                    after.push(None);
                }
            } else if self.is_text(previous) && only_ws(self.raw(previous)) {
                after.push(Some(previous));
            } else {
                break;
            }
            at = c.node(previous).span().start_offset;
        }
        after.truncate(comments.len());
        root.retain(|n| {
            !comments.iter().any(|&(comment, _)| comment == *n) && !after.contains(&Some(*n))
        });
        comments
            .iter()
            .zip(&after)
            .rev()
            .map(|(&(_, data), text)| {
                let empty_line = text.is_some_and(|t| self.raw(t).split('\n').count() > 2);
                (data, empty_line)
            })
            .collect()
    }

    /// `embedTag` keeps the body as it is when the comment right above is `prettier-ignore`.
    fn ignores(&self, comments: &[(Span, bool)]) -> bool {
        comments.last().is_some_and(|&(data, _)| {
            data.text(self.source_text)
                .trim_matches(is_ecmascript_whitespace)
                == "prettier-ignore"
        })
    }

    /// `preformattedBody`: the text without its first and last line break, on a literal line.
    fn preformatted(&mut self, content: Span) -> LayoutInstructionIdentifier {
        self.embedder.kept.push(content);
        let text = content.text(self.source_text);
        if text.is_empty() {
            return self.d().nil();
        }
        let blank = |c: char| matches!(c, '\t' | '\x0C' | '\r' | ' ');
        let start = text
            .find(|c: char| !blank(c))
            .filter(|&i| text[i..].starts_with('\n'))
            .map_or(0, |i| i + 1);
        let text = &text[start..];
        let end = text
            .rfind(|c: char| !blank(c))
            .filter(|&i| text[i..].starts_with('\n'))
            .unwrap_or(text.len());
        let mut parts = vec![self.d().literalline()];
        for (i, line) in text[..end].split('\n').enumerate() {
            if i > 0 {
                parts.push(self.d().literalline());
            }
            parts.push(self.d().text(line.strip_suffix('\r').unwrap_or(line)));
        }
        parts.push(self.d().hardline());
        self.cat(&parts)
    }

    /// `embedTag`'s moved comments, each on its own line above the tag.
    fn with_comments(
        &mut self,
        comments: &[(Span, bool)],
        tag: LayoutInstructionIdentifier,
    ) -> LayoutInstructionIdentifier {
        let mut parts = Vec::new();
        for &(data, empty_line) in comments {
            let text = format!("<!--{}-->", data.text(self.source_text));
            parts.push(self.d().text(&text));
            parts.push(self.d().hardline());
            if empty_line {
                parts.push(self.d().hardline());
            }
        }
        parts.push(tag);
        self.cat(&parts)
    }

    /// The plugin keeps `<!-- #endregion -->` below a `<script>`/`<style>`; that is not ported.
    pub(super) fn refuse_moved_comments(&self) -> R<()> {
        let hoisted: Vec<Span> = self
            .c
            .module
            .iter()
            .chain(&self.c.instance)
            .map(|s| s.span)
            .chain(self.c.style.iter().map(|s| s.span))
            .collect();
        let options: Vec<Span> = self
            .c
            .children(self.c.root)
            .iter()
            .filter(|&&n| self.element_name(n) == Some("svelte:options"))
            .map(|&n| self.c.node(n).span())
            .collect();
        for &identifier in self.c.children(self.c.root) {
            let TemplateNode::Comment { span, data } = *self.c.node(identifier) else {
                continue;
            };
            let data = data
                .text(self.source_text)
                .trim_matches(is_ecmascript_whitespace);
            for h in &hoisted {
                let after = h.end_offset <= span.start_offset
                    && only_ws(
                        &self.source_text[h.end_offset as usize..span.start_offset as usize],
                    );
                if after && data.to_ascii_lowercase().contains("endregion") {
                    return Err(Unsupported::at(
                        "`<!-- #endregion -->` after <script> or <style>",
                        span,
                    ));
                }
            }
            for o in &options {
                let after = o.end_offset <= span.start_offset
                    && only_ws(
                        &self.source_text[o.end_offset as usize..span.start_offset as usize],
                    );
                if after && data.to_ascii_lowercase().contains("endregion") {
                    return Err(Unsupported::at(
                        "`<!-- #endregion -->` after <svelte:options>",
                        span,
                    ));
                }
            }
        }
        Ok(())
    }

    /// `mergeAdjacentTextNodesInFragment` on the root, where removing `<script>` and `<style>`
    /// leaves text nodes side by side, after the plugin's `text.trim()` of the whole source.
    pub(super) fn merged_root(&mut self, root: &[Child]) -> Vec<Child> {
        let mut out: Vec<Child> = Vec::new();
        let c = self.c;
        // Only text at the source's own ends: a hoisted `<script>` or `<style>` may stand
        // between the first or last root child and the end.
        if let Some(first) = root
            .first()
            .and_then(|&f| self.child_text(f))
            .filter(|&f| c.node(f).span().start_offset == 0)
        {
            let t = self.raw(first).trim_start_matches(is_ecmascript_whitespace);
            self.set_raw(first, Cow::Owned(t.to_owned()));
        }
        let end = self.source_text.len();
        if let Some(last) = root
            .last()
            .and_then(|&l| self.child_text(l))
            .filter(|&l| c.node(l).span().end_offset as usize == end)
        {
            let t = self.raw(last).trim_end_matches(is_ecmascript_whitespace);
            self.set_raw(last, Cow::Owned(t.to_owned()));
        }
        for &child in root {
            if let Some(prev) = out.last().and_then(|&p| self.child_text(p))
                && let Some(text) = self.child_text(child)
            {
                self.trim_right(prev);
                let merged = format!("{}{}", self.raw(prev), self.raw(text));
                self.set_raw(prev, Cow::Owned(merged));
                continue;
            }
            out.push(child);
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
        let many = attributes.len() > 1;
        for &(name, value) in attributes {
            let line = self.attribute_line(many);
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
        if !self.options.bracket_same_line {
            let soft = self.d().softline();
            inner.push(self.d().dedent(soft));
        }
        let g = self.group(&inner);
        let attributes = self.d().indent(g);
        let lt = self.lit("<");
        let name = self.lit(tag);
        let gt = self.lit(">");
        let open = self.group(&[lt, name, attributes, gt]);
        let close = self.d().text(&format!("</{tag}>"));
        self.group(&[open, body, close])
    }

    /// The plugin's `getLangAttribute` names a language other than JavaScript or TypeScript: JSON
    /// goes to Prettier's JSON printer, and any other body the plugin keeps when it does not parse.
    fn refuse_script_language(&self, attributes: &[TagAttributes]) -> R<()> {
        let value = |name: &str| {
            attributes
                .iter()
                .find(|(n, _)| n.text(self.source_text) == name)
                .and_then(|&(n, v)| v.map(|v| (n, v.text(self.source_text))))
                .filter(|(_, v)| !v.is_empty())
        };
        let Some((at, lang)) = value("lang").or_else(|| value("type")) else {
            return Ok(());
        };
        let lang = lang.strip_prefix("text/").unwrap_or(lang);
        if matches!(
            lang,
            "ts" | "typescript" | "js" | "javascript" | "module" | "application/javascript"
        ) {
            Ok(())
        } else {
            Err(Unsupported::at(
                "a script language other than JavaScript",
                at,
            ))
        }
    }

    /// `formatBodyContent` around the script's program.
    pub(super) fn script_body(&mut self, content: Span) -> R<LayoutInstructionIdentifier> {
        let text = content.text(self.source_text);
        if text.trim_matches(is_ecmascript_whitespace).is_empty() {
            return Ok(if text.is_empty() {
                self.d().nil()
            } else {
                self.d().hardline()
            });
        }
        let body = self.embed(content, JavaScriptPart::Script, Adjust::default())?;
        Ok(self.indented_body(body))
    }

    /// `[indent([hardline, body]), hardline]` after trimming the body's trailing lines, without
    /// the `indent` when `svelteIndentScriptAndStyle` is off.
    pub(super) fn indented_body(
        &mut self,
        body: LayoutInstructionIdentifier,
    ) -> LayoutInstructionIdentifier {
        let mut v = vec![body];
        self.d().trim_right(&mut v, LayoutInstructions::is_line);
        let h = self.d().hardline();
        let mut inner = vec![h];
        inner.extend(v);
        let mut inner = self.cat(&inner);
        if self.options.svelte_indent_script_and_style {
            inner = self.d().indent(inner);
        }
        let h = self.d().hardline();
        self.cat(&[inner, h])
    }

    /// `getAttributeLine`: each attribute on its own line under `singleAttributePerLine`, when
    /// there is more than one.
    pub(super) fn attribute_line(&mut self, many: bool) -> LayoutInstructionIdentifier {
        if self.options.single_attribute_per_line && many {
            self.d().hardline()
        } else {
            self.d().line()
        }
    }

    pub(super) fn style_body(
        &mut self,
        style: &rsvelte_svelte_syntax::syntax_tree::Style,
    ) -> R<LayoutInstructionIdentifier> {
        // The plugin's `getLangAttribute`: `lang`, else `type`, without a `text/` prefix.
        let language = ["lang", "type"].iter().find_map(|&name| {
            style
                .attributes
                .iter()
                .find(|(n, _)| n.text(self.source_text) == name)
                .and_then(|&(n, v)| Some((n, v?.text(self.source_text))))
                .filter(|(_, value)| !value.is_empty())
        });
        // Prettier formats any other language, such as `postcss`, with its CSS parser.
        if let Some((n, language)) = language
            && matches!(
                language.strip_prefix("text/").unwrap_or(language),
                "less" | "scss" | "sass" | "styl" | "stylus"
            )
        {
            return Err(Unsupported::at("a Less, Sass or Stylus style", n));
        }
        // The task formats only a component whose style sheet parsed.
        if style.sheet.is_err() {
            return Err(Unsupported::at(
                "a style sheet that does not parse",
                style.content,
            ));
        }
        let text = style.content.text(self.source_text);
        if text.trim_matches(is_ecmascript_whitespace).is_empty() {
            return Ok(if text.is_empty() {
                self.d().nil()
            } else {
                self.d().hardline()
            });
        }
        let text = oxc_formatter_core::normalize_newlines(text, ['\r']);
        let core = &self.embedder.options;
        let options = oxc_formatter_css::CssFormatOptions {
            indent_style: core.indent_style,
            indent_width: core.indent_width,
            line_width: core.line_width,
            line_ending: core.line_ending,
            single_quote: self.options.single_quote.into(),
            ..oxc_formatter_css::CssFormatOptions::default()
        };
        #[expect(
            clippy::map_err_ignore,
            reason = "oxc's diagnostic points into the sheet, not the component"
        )]
        let ir = oxc_formatter_css::format_to_ir(
            self.embedder.embedding.session(),
            &text,
            options,
            None,
        )
        .map_err(|_| Unsupported::at("CSS that oxc's formatter does not format", style.content))?;
        let body = self.keep(ir.ir);
        Ok(self.indented_body(body))
    }
}

mod options;
