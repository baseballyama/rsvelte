use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{Range, TemplateNode, TemplateNodeIdentifier, TokenType};

use super::html::closing_tag_omitted;
use super::{End, ParseResult, Parser, element};

impl Parser<'_> {
    pub(super) fn fragment(&mut self, end: End<'_>) -> ParseResult<Range> {
        let children_start = self.pending_children.len();
        loop {
            let rest = self.rest();
            if rest.is_empty() {
                return match end {
                    End::Eof => Ok(self.finish_children(children_start)),
                    End::Tag { name, .. } => self.err(format!("`<{name}>` was left open")),
                    End::Block => self.err("block was left open"),
                };
            }
            let child = match rest.as_bytes()[0] {
                b'<' if rest.starts_with("</") => {
                    if let End::Tag { .. } = end {
                        return Ok(self.finish_children(children_start));
                    }
                    return self.err("unexpected closing tag");
                }
                b'<' if rest.starts_with("<!--") => self.comment()?,
                b'<' => {
                    if let End::Tag {
                        name,
                        regular: true,
                    } = end
                        && closing_tag_omitted(name, || element::peek_tag_name(&rest[1..]))
                    {
                        return Ok(self.finish_children(children_start));
                    }
                    match self.element(matches!(end, End::Eof))? {
                        Some(element) => element,
                        None => continue,
                    }
                }
                b'{' if self.at_block_continuation() => {
                    let End::Block = end else {
                        return self.err("unexpected block continuation or closing tag");
                    };
                    return Ok(self.finish_children(children_start));
                }
                b'{' => self.tag()?,
                _ => self.text(),
            };
            self.pending_children.push(child);
        }
    }

    fn at_block_continuation(&self) -> bool {
        let Some(after) = self.rest().strip_prefix('{') else {
            return false;
        };
        let after = super::whitespace::trim_ascii_start(after);
        after.starts_with(':')
            || (after.starts_with('/') && !after.starts_with("/*") && !after.starts_with("//"))
    }

    fn text(&mut self) -> TemplateNodeIdentifier {
        let start_offset = self.position;
        let rest = self.rest();
        let len = memchr::memchr2(b'<', b'{', rest.as_bytes()).unwrap_or(rest.len());
        self.position += len;
        self.token(TokenType::Text, start_offset);
        self.push_node(TemplateNode::Text {
            span: Span::new(start_offset as u32, self.position as u32),
        })
    }

    fn comment(&mut self) -> ParseResult<TemplateNodeIdentifier> {
        let start_offset = self.position;
        let Some(end) = memchr::memmem::find(self.rest().as_bytes(), b"-->") else {
            return self.err("unterminated comment");
        };
        let data = Span::new((start_offset + 4) as u32, (start_offset + end) as u32);
        self.position += end + 3;
        self.token(TokenType::MarkupComment, start_offset);
        Ok(self.push_node(TemplateNode::Comment {
            span: Span::new(start_offset as u32, self.position as u32),
            data,
        }))
    }
}
