use super::{
    Formatter, LayoutInstructionIdentifier, NodeIdentifier, R, Slot, Span, Unsupported, flag,
    make_string, preferred_quote,
};

impl Formatter<'_> {
    /// Template literals keep their raw text; each `${…}` must fit on its line.
    pub(super) fn template(
        &mut self,
        owner: NodeIdentifier,
        quasis: &[NodeIdentifier],
        expressions: &[NodeIdentifier],
    ) -> R<LayoutInstructionIdentifier> {
        let mut parts = vec![self.lit("`")];
        for (i, &q) in quasis.iter().enumerate() {
            if self.syntax_tree.flags(q) & flag::OWNED != 0 {
                return Err(Unsupported::at(
                    "synthesized template",
                    self.syntax_tree.source_location(q),
                ));
            }
            let [start_offset, end_offset] = self.syntax_tree.raw_data(q);
            let raw = Span::new(start_offset, end_offset).text(self.source_text);
            // `join(literalline, text.split("\n"))`: a line break in the text breaks every group
            // around the literal.
            for (j, line) in raw.split('\n').enumerate() {
                if j > 0 {
                    parts.push(self.docs.literalline());
                }
                parts.push(self.docs.text(line));
            }
            if let Some(&e) = expressions.get(i) {
                parts.push(self.lit("${"));
                let d = self.expression(e, Some(owner), Slot::Value)?;
                // `addAlignmentToDoc`: lines inside align to the indent of the text's last line.
                let aligned = raw
                    .rsplit_once('\n')
                    .is_some_and(|(_, last)| last.starts_with([' ', '\t']));
                if aligned && self.docs.will_break(d) {
                    return Err(Unsupported::at(
                        "a line break in `${}` after an indented line of the template",
                        self.syntax_tree.source_location(e),
                    ));
                }
                parts.push(self.docs.flat_only(d));
                parts.push(self.lit("}"));
            }
        }
        parts.push(self.lit("`"));
        Ok(self.cat(&parts))
    }

    /// Prettier's string printing: the preferred quote unless the other one needs fewer escapes.
    pub(super) fn string(&mut self, identifier: NodeIdentifier) -> LayoutInstructionIdentifier {
        let raw = self.span(identifier).text(self.source_text);
        let content = &raw[1..raw.len() - 1];
        let quote = if self.options.markup_attribute {
            '\''
        } else {
            preferred_quote(content, self.options.single_quote)
        };
        let s = make_string(content, quote);
        // A line continuation (`\` before a line break) is a literal line, as in a template.
        let mut parts = Vec::new();
        for (j, line) in s.split('\n').enumerate() {
            if j > 0 {
                parts.push(self.docs.literalline());
            }
            parts.push(self.docs.text(line));
        }
        self.cat(&parts)
    }
}
