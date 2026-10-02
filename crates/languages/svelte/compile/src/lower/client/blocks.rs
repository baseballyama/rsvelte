use super::{
    ClientCompilationContext, CompilerNodeIdentifier, EACH_INDEX_REACTIVE, EACH_IS_CONTROLLED,
    EACH_ITEM_IMMUTABLE, EACH_ITEM_REACTIVE, Frag, Kind, Lists, NodeIdentifier, NodeKind, R,
    SourceLocation, has_dependency, unsupported,
};

impl ClientCompilationContext<'_> {
    /// Upstream `IfBlock` (client), with `{:else if}` chains flattened.
    pub(super) fn if_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        frag.tpl.push_comment();
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::If {
            branches,
            otherwise,
        } = compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let mut statements = Vec::new();
        let mut tests_and_renders: Vec<(NodeIdentifier, NodeIdentifier)> = Vec::new();
        for (index, b) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let test = b.test;
            let body = self.fragment(b.body)?;
            let cid = self.names.generate("consequent");
            let arrow = self.anchor_arrow(&body);
            statements.push(self.var(&cid, arrow));
            let meta = self.an.meta(test);
            let mut t = self.expression(test);
            if meta.has_call {
                let d = self.names.generate("d");
                let thunk = self
                    .out
                    .arrow(&[], t, true, false, SourceLocation::SYNTHETIC);
                let derived = self.call("derived", vec![Some(thunk)]);
                statements.push(self.var(&d, derived));
                let x = self.out.identifier(&d);
                t = self.call("get", vec![Some(x)]);
            }
            let render = self.out.identifier("$$render");
            let c = self.out.identifier(&cid);
            let index = (index != 0).then(|| self.write_number(index as u32));
            let mut arguments = vec![c];
            arguments.extend(index);
            let call = self
                .out
                .call(render, &arguments, false, SourceLocation::SYNTHETIC);
            tests_and_renders.push((t, self.out.expression_statement(call)));
        }
        let else_statement = if let Some(o) = otherwise {
            let body = self.fragment(o)?;
            let aid = self.names.generate("alternate");
            let arrow = self.anchor_arrow(&body);
            statements.push(self.var(&aid, arrow));
            let render = self.out.identifier("$$render");
            let x = self.out.identifier(&aid);
            let minus = self.out.write_number(-1.0, SourceLocation::SYNTHETIC);
            let call = self
                .out
                .call(render, &[x, minus], false, SourceLocation::SYNTHETIC);
            Some(self.out.expression_statement(call))
        } else {
            None
        };
        let mut chain = else_statement;
        for (t, r) in tests_and_renders.into_iter().rev() {
            chain = Some(self.out.if_(t, r, chain, SourceLocation::SYNTHETIC));
        }
        let inner = self.out.block(
            &chain.into_iter().collect::<Vec<_>>(),
            SourceLocation::SYNTHETIC,
        );
        let render_param = self.out.identifier("$$render");
        let f = self.out.arrow(
            &[render_param],
            inner,
            false,
            false,
            SourceLocation::SYNTHETIC,
        );
        let x = self.out.identifier(node);
        // Upstream's third argument marks a nested `{:else if}` block; a chain is one node here.
        let call = self.call("if", vec![Some(x), Some(f)]);
        statements.push(self.statement(call));
        l.initializer
            .push(self.out.block(&statements, SourceLocation::SYNTHETIC));
        Ok(())
    }

    /// Upstream `EachBlock` (client, runes mode) for a block whose context is an identifier.
    #[expect(
        clippy::too_many_lines,
        reason = "ports upstream's `EachBlock` visitor in one piece"
    )]
    pub(super) fn each_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        controlled: bool,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript, res) =
            (self.compiler_syntax_tree, self.javascript, self.res);
        let NodeKind::Each(each) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let context = each.context().expect("the parser requires `as`");
        if !matches!(javascript.kind(context), Kind::Identifier(_)) {
            let span = javascript
                .source_location(context)
                .span()
                .expect("parsed from source");
            return unsupported("a destructuring `{#each}` context", span);
        }
        let collection = self.expression(each.collection);
        if !controlled {
            frag.tpl.push_comment();
        }
        let keyed = each.keyed(javascript);
        let mut flags = 0;
        if keyed && each.index().is_some() {
            flags |= EACH_INDEX_REACTIVE;
        }
        let key_is_item = each.key().is_some_and(|k| {
            matches!(javascript.kind(k), Kind::Identifier(_))
                && javascript.atom(k) == javascript.atom(context)
        });
        if !key_is_item && has_dependency(javascript, res, each.collection) {
            flags |= EACH_ITEM_REACTIVE;
        }
        flags |= EACH_ITEM_IMMUTABLE;
        if controlled {
            flags |= EACH_IS_CONTROLLED;
        }

        let item = res.sem.binding_of(context);
        let index = each.index().and_then(|i| res.sem.binding_of(i));
        let shadows = [item, index].into_iter().flatten().any(|b| {
            let s = &res.sem.bindings[b];
            res.sem.scopes[s.scope]
                .parent
                .is_some_and(|p| res.sem.lookup(p, s.name).is_some())
        });
        let collection_id = shadows.then(|| self.names.unique("$$array"));
        let index_name = each.index().map_or_else(
            || self.each_index[&identifier].clone(),
            |i| javascript.name(i).to_owned(),
        );

        let key_span = each
            .key()
            .and_then(|k| javascript.source_location(k).span());
        let in_key = |n: NodeIdentifier| {
            let at = javascript.source_location(n).span();
            key_span.is_some_and(|k| {
                at.is_some_and(|a| k.start_offset <= a.start_offset && a.end_offset <= k.end_offset)
            })
        };
        let (mut uses_index, mut key_uses_index) = (false, false);
        if let Some(b) = index {
            for r in res.sem.references_to(b) {
                if in_key(r.node) {
                    key_uses_index = true;
                } else {
                    uses_index = true;
                }
            }
        }
        // Upstream's `assign` and `mutate` transforms of the item set `uses_index`.
        if let Some(b) = item {
            let s = &res.sem.bindings[b];
            uses_index |= s.writes > 0 || s.mutations > 0;
        }

        if let Some(b) = item {
            self.each.insert(b, flags & EACH_ITEM_REACTIVE != 0);
        }
        if let Some(b) = index {
            self.each.insert(b, flags & EACH_INDEX_REACTIVE != 0);
        }
        let outer = self.scope;
        self.scope = res
            .sem
            .scope_of(context)
            .expect("an `{#each}` context opens a scope");
        let body = self.fragment(each.body);
        self.scope = outer;
        let body = body?;

        let key_function = if keyed {
            for b in [item, index].into_iter().flatten() {
                self.each.insert(b, false);
            }
            let pattern = self.out.ident(
                javascript.name(context),
                javascript.source_location(context),
            );
            let key = self.expression(each.key().expect("a keyed block has a key"));
            let mut parameters = vec![pattern];
            if key_uses_index {
                parameters.push(self.out.identifier(&index_name));
            }
            self.out
                .arrow(&parameters, key, true, false, SourceLocation::SYNTHETIC)
        } else {
            let ns = self.out.identifier("$");
            self.out.dot(ns, "index")
        };
        for b in [item, index].into_iter().flatten() {
            self.each.remove(&b);
        }

        let thunk = self.thunk(collection);
        let mut render_args = vec![
            self.out.identifier("$$anchor"),
            self.out.ident(
                javascript.name(context),
                javascript.source_location(context),
            ),
        ];
        if uses_index || collection_id.is_some() {
            render_args.push(self.out.identifier(&index_name));
        }
        if let Some(c) = &collection_id {
            render_args.push(self.out.identifier(c));
        }
        let block = self.out.block(&body, SourceLocation::SYNTHETIC);
        let render = self
            .out
            .arrow(&render_args, block, false, false, SourceLocation::SYNTHETIC);
        let x = self.out.identifier(node);
        let flags = self.write_number(flags);
        let mut arguments = vec![
            Some(x),
            Some(flags),
            Some(thunk),
            Some(key_function),
            Some(render),
        ];
        if let Some(f) = each.fallback {
            let fallback = self.fragment(f)?;
            arguments.push(Some(self.anchor_arrow(&fallback)));
        }
        let call = self.call("each", arguments);
        l.initializer.push(self.statement(call));
        Ok(())
    }

    pub(super) fn anchor_arrow(&mut self, body: &[NodeIdentifier]) -> NodeIdentifier {
        let block = self.out.block(body, SourceLocation::SYNTHETIC);
        let anchor = self.out.identifier("$$anchor");
        self.out
            .arrow(&[anchor], block, false, false, SourceLocation::SYNTHETIC)
    }
}
