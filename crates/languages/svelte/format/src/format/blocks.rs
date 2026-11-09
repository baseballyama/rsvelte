use super::{
    LayoutInstructionIdentifier, Printer, R, Span, TemplateNode, TemplateNodeIdentifier,
    Unsupported, ends_with_linebreak, only_ws, starts_with_linebreak,
};

#[derive(Clone, Copy, PartialEq, Eq)]
enum BlockWs {
    None,
    Space,
    Line,
}

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
        let open = self.lit("{#each ");
        let e = self.expression(expression, true, false)?;
        let mut def = vec![open, e];
        // `{#each items}` and `{#each items, i}` have no context.
        if context != rsvelte_typescript_syntax::NodeIdentifier::NONE {
            let context = format!(" as{}", self.expand(context)?);
            def.push(self.d().text(&context));
        }
        if index != rsvelte_typescript_syntax::NodeIdentifier::NONE {
            let index = format!(", {}", self.c.javascript.name(index));
            def.push(self.d().text(&index));
        }
        if key != rsvelte_typescript_syntax::NodeIdentifier::NONE {
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

    pub(super) fn key_block(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let TemplateNode::Key {
            expression, body, ..
        } = *self.c.node(identifier)
        else {
            unreachable!("a key block")
        };
        let open = self.lit("{#key ");
        let e = self.expression(expression, true, false)?;
        let close = self.lit("}");
        let c = self.c;
        let body = self.block_children(c.children(body))?;
        let end = self.lit("{/key}");
        let def = self.cat(&[open, e, close, body, end]);
        let bp = self.d().break_parent();
        Ok(self.group(&[def, bp]))
    }

    pub(super) fn await_block(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let TemplateNode::Await {
            expression,
            value,
            error,
            pending,
            then,
            catch,
            ..
        } = *self.c.node(identifier)
        else {
            unreachable!("an await block")
        };
        let c = self.c;
        let branch = |r: rsvelte_svelte_syntax::syntax_tree::Range| {
            r.present().map_or(&[][..], |r| c.children(r))
        };
        let (pending, then, catch) = (branch(pending), branch(then), branch(catch));
        let has = |p: &Self, children: &[TemplateNodeIdentifier]| {
            children.iter().any(|&n| !p.is_empty_text(n))
        };
        let (has_pending, has_then, has_catch) =
            (has(self, pending), has(self, then), has(self, catch));
        let mut block = Vec::new();
        let open = self.lit("{#await ");
        let e = self.expression(expression, true, false)?;
        if !has_pending && (has_then || has_catch) {
            let (word, pattern, children) = if has_then {
                (" then", value, then)
            } else {
                (" catch", error, catch)
            };
            let tail = format!("{word}{}}}", self.expand(pattern)?);
            let tail = self.d().text(&tail);
            block.push(self.group(&[open, e, tail]));
            block.push(self.block_children(children)?);
        } else {
            let close = self.lit("}");
            block.push(self.group(&[open, e, close]));
            if has_pending {
                block.push(self.block_children(pending)?);
            }
            if has_then {
                let tag = format!("{{:then{}}}", self.expand(value)?);
                let tag = self.d().text(&tag);
                block.push(self.group(&[tag]));
                block.push(self.block_children(then)?);
            }
        }
        if (has_pending || has_then) && has_catch {
            let tag = format!("{{:catch{}}}", self.expand(error)?);
            let tag = self.d().text(&tag);
            block.push(self.group(&[tag]));
            block.push(self.block_children(catch)?);
        }
        block.push(self.lit("{/await}"));
        Ok(self.group(&block))
    }

    pub(super) fn snippet_block(
        &mut self,
        identifier: TemplateNodeIdentifier,
    ) -> R<LayoutInstructionIdentifier> {
        let TemplateNode::Snippet {
            name,
            type_parameters,
            parameters,
            body,
            span,
        } = *self.c.node(identifier)
        else {
            unreachable!("a snippet block")
        };
        if let Some(t) = type_parameters {
            return Err(Unsupported::at("a snippet's type parameters", t));
        }
        self.refuse_unembedded(span)?;
        let c = self.c;
        // From the name to the `)`, the text the plugin formats as `function name(…) {}`.
        let name_start = c
            .javascript
            .source_location(name)
            .span()
            .expect("a parsed name has a source span")
            .start_offset;
        let parameters = c.javascript_list(parameters);
        let head_end = self.snippet_head_end(name, parameters, span)?;
        let signature =
            self.javascript
                .signature(name, parameters, Span::new(name_start, head_end))?;
        let open = self.lit("{#snippet ");
        let close = self.lit("}");
        let body = self.block_children(c.children(body))?;
        let end = self.lit("{/snippet}");
        Ok(self.cat(&[open, signature, close, body, end]))
    }

    /// Just past the `)` that closes a snippet's parameters.
    fn snippet_head_end(
        &self,
        name: rsvelte_typescript_syntax::NodeIdentifier,
        parameters: &[rsvelte_typescript_syntax::NodeIdentifier],
        span: Span,
    ) -> R<u32> {
        let javascript = &self.c.javascript;
        let after = parameters.last().copied().unwrap_or(name);
        let mut from = javascript
            .source_location(after)
            .span()
            .expect("a parsed node has a source span")
            .end_offset;
        // A parameter's type annotation ends after the node itself.
        if let Some(t) = self.javascript.annotation(after) {
            from = from.max(t.end_offset);
        }
        self.source_text[from as usize..span.end_offset as usize]
            .find(')')
            .map(|i| from + i as u32 + 1)
            .ok_or_else(|| Unsupported::at("a snippet without parameters' `)`", span))
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
        self.give_buffer(docs);
        let inner = self.cat(&[startline, g]);
        let inner = self.d().indent(inner);
        Ok(self.cat(&[inner, endline]))
    }

    /// `checkWhitespaceAtStartOfSvelteBlock` / `…AtEndOfSvelteBlock`.
    fn block_ws(&self, children: &[TemplateNodeIdentifier], start: bool) -> BlockWs {
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
            let bytes = self.source_text.as_bytes();
            if let Some(brace) = bytes[..(start_offset + 1).min(bytes.len())]
                .iter()
                .rposition(|&b| b == b'}')
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
