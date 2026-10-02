use super::{
    BlockWs, LayoutInstructionIdentifier, Printer, R, TemplateNode, TemplateNodeIdentifier,
    Unsupported, ends_with_linebreak, only_ws, starts_with_linebreak,
};

impl Printer<'_, '_> {
    pub(super) fn if_block(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let TemplateNode::If {
            test, consequent, ..
        } = *self.c.node(identifier)
        else {
            unreachable!("an if block")
        };
        let open = self.lit("{#if ");
        let t = self.expression(test, true, false)?;
        let close = self.lit("}");
        let c = self.c;
        let body = self.block_children(c.children(consequent))?;
        let mut def = vec![open, t, close, body];
        def.push(self.if_alternate(identifier)?);
        def.push(self.lit("{/if}"));
        let def = self.cat(&def);
        let bp = self.d().break_parent();
        Ok(self.group(&[def, bp]))
    }

    pub(super) fn each_block(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let TemplateNode::Each {
            expression,
            context,
            index,
            key,
            body,
            fallback,
            has_fallback,
            ..
        } = *self.c.node(identifier)
        else {
            unreachable!("an each block")
        };
        let javascript = &self.c.javascript;
        if !matches!(
            javascript.kind(context),
            rsvelte_typescript::Kind::Identifier(_)
        ) {
            let span = javascript
                .source_location(context)
                .span()
                .unwrap_or_else(|| self.c.node(identifier).span());
            return Err(Unsupported::at("destructuring in {#each}", span));
        }
        let open = self.lit("{#each ");
        let e = self.expression(expression, true, false)?;
        let mut def = vec![open, e];
        let context = format!(" as {}", self.c.javascript.name(context));
        def.push(self.d().text(&context));
        if index != rsvelte_typescript::NodeIdentifier::NONE {
            let index = format!(", {}", self.c.javascript.name(index));
            def.push(self.d().text(&index));
        }
        if key != rsvelte_typescript::NodeIdentifier::NONE {
            def.push(self.lit(" ("));
            def.push(self.expression(key, true, false)?);
            def.push(self.lit(")"));
        }
        def.push(self.lit("}"));
        let c = self.c;
        def.push(self.block_children(c.children(body))?);
        if has_fallback {
            #[expect(
                clippy::literal_string_with_formatting_args,
                reason = "Svelte's `{:else}` tag"
            )]
            let open = self.lit("{:else}");
            def.push(open);
            def.push(self.block_children(c.children(fallback))?);
        }
        def.push(self.lit("{/each}"));
        let def = self.cat(&def);
        let bp = self.d().break_parent();
        Ok(self.group(&[def, bp]))
    }

    /// `printIfBlockAlternate`.
    pub(super) fn if_alternate(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let TemplateNode::If { alternate, .. } = *self.c.node(identifier) else {
            unreachable!("an if block")
        };
        let Some(alternate) = alternate else {
            return Ok(self.d().nil());
        };
        let c = self.c;
        let children = c.children(alternate);
        if let [only] = children
            && let TemplateNode::If {
                test,
                consequent,
                elseif: true,
                ..
            } = *self.c.node(*only)
        {
            let open = self.lit("{:else if ");
            let t = self.expression(test, true, false)?;
            let close = self.lit("}");
            let c = self.c;
            let body = self.block_children(c.children(consequent))?;
            let rest = self.if_alternate(*only)?;
            return Ok(self.cat(&[open, t, close, body, rest]));
        }
        #[expect(
            clippy::literal_string_with_formatting_args,
            reason = "Svelte's `{:else}` tag"
        )]
        let open = self.lit("{:else}");
        let body = self.block_children(children)?;
        Ok(self.cat(&[open, body]))
    }

    /// `printSvelteBlockChildren`.
    pub(super) fn block_children(
        &mut self,
        children: &[TemplateNodeIdentifier],
    ) -> R<LayoutInstructionIdentifier> {
        if children.is_empty() {
            return Ok(self.d().nil());
        }
        let start = self.block_ws(children, true);
        let end = self.block_ws(children, false);
        let any_line = start == BlockWs::Line || end == BlockWs::Line;
        let startline = match start {
            BlockWs::None => self.d().nil(),
            _ if any_line => self.d().hardline(),
            _ => self.d().line(),
        };
        let endline = match end {
            BlockWs::None => self.d().nil(),
            _ if any_line => self.d().hardline(),
            _ => self.d().line(),
        };
        let first = children[0];
        let last = *children.last().expect("non-empty");
        if self.text_starts_ws(first) {
            self.trim_left(first);
        }
        if self.text_ends_ws(last) {
            self.trim_right(last);
        }
        let docs = self.print_children(children)?;
        let g = self.group(&docs);
        let inner = self.cat(&[startline, g]);
        let inner = self.d().indent(inner);
        Ok(self.cat(&[inner, endline]))
    }

    /// `checkWhitespaceAtStartOfSvelteBlock` / `…AtEndOfSvelteBlock`.
    pub(super) fn block_ws(&self, children: &[TemplateNodeIdentifier], start: bool) -> BlockWs {
        let edge = if start {
            children[0]
        } else {
            *children.last().expect("non-empty")
        };
        if start {
            if self.text_starts_linebreak(edge) {
                return BlockWs::Line;
            }
            if self.text_starts_ws(edge) {
                return BlockWs::Space;
            }
            // The Svelte parser may swallow whitespace between the block's `}` and its first child.
            let start_offset = self.c.node(edge).span().start_offset as usize;
            if let Some(brace) =
                self.source_text[..(start_offset + 1).min(self.source_text.len())].rfind('}')
                && brace > 0
                && start_offset > brace + 1
            {
                let between = &self.source_text[brace + 1..start_offset];
                if only_ws(between) {
                    return if starts_with_linebreak(between, 1) {
                        BlockWs::Line
                    } else {
                        BlockWs::Space
                    };
                }
            }
        } else {
            if self.text_ends_linebreak(edge, 1) {
                return BlockWs::Line;
            }
            if self.text_ends_ws(edge) {
                return BlockWs::Space;
            }
            let end_offset = self.c.node(edge).span().end_offset as usize;
            if let Some(offset) = self.source_text[end_offset..].find('{') {
                let brace = end_offset + offset;
                if brace > 0 && end_offset < brace {
                    let between = &self.source_text[end_offset..brace];
                    if only_ws(between) {
                        return if ends_with_linebreak(between, 1) {
                            BlockWs::Line
                        } else {
                            BlockWs::Space
                        };
                    }
                }
            }
        }
        BlockWs::None
    }
}
