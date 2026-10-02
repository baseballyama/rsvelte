use rsvelte_svelte::compilation::compiler_syntax_tree::Each;

use crate::lower::client::{
    BindingIdentifier, ClientCompilationContext, CompilerNodeIdentifier, EACH_INDEX_REACTIVE,
    EACH_IS_CONTROLLED, EACH_ITEM_IMMUTABLE, EACH_ITEM_REACTIVE, Frag, Kind, Lists, NodeIdentifier,
    NodeKind, R, SourceLocation, has_dependency, unsupported,
};

/// The bindings an `{#each}` block declares: its item and its index.
#[derive(Clone, Copy)]
struct EachBindings {
    item: Option<BindingIdentifier>,
    index: Option<BindingIdentifier>,
}

impl EachBindings {
    fn iter(self) -> impl Iterator<Item = BindingIdentifier> {
        [self.item, self.index].into_iter().flatten()
    }
}

/// Where the index is read: in the body (or by a write to the item), and in the key.
struct IndexUse {
    body: bool,
    key: bool,
}

impl ClientCompilationContext<'_> {
    /// Upstream `EachBlock` (client, runes mode) for a block whose context is an identifier.
    pub(in crate::lower::client) fn each_block(
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
        let flags = self.each_flags(each, context, keyed, controlled);
        let bindings = EachBindings {
            item: res.sem.binding_of(context),
            index: each.index().and_then(|i| res.sem.binding_of(i)),
        };
        let collection_id = self
            .shadows_outer_name(bindings)
            .then(|| self.names.unique("$$array"));
        let index_name = each.index().map_or_else(
            || self.each_index[&identifier].clone(),
            |i| javascript.name(i).to_owned(),
        );
        let index_use = self.index_use(each, bindings);

        let body = self.each_body(each, context, bindings, flags)?;
        let key_function = if keyed {
            self.key_function(each, context, bindings, &index_name, index_use.key)
        } else {
            let ns = self.out.identifier("$");
            self.out.dot(ns, "index")
        };
        for b in bindings.iter() {
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
        if index_use.body || collection_id.is_some() {
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

    fn each_flags(
        &self,
        each: &Each,
        context: NodeIdentifier,
        keyed: bool,
        controlled: bool,
    ) -> u32 {
        let javascript = self.javascript;
        let mut flags = 0;
        if keyed && each.index().is_some() {
            flags |= EACH_INDEX_REACTIVE;
        }
        let key_is_item = each.key().is_some_and(|k| {
            matches!(javascript.kind(k), Kind::Identifier(_))
                && javascript.atom(k) == javascript.atom(context)
        });
        if !key_is_item && has_dependency(javascript, self.res, each.collection) {
            flags |= EACH_ITEM_REACTIVE;
        }
        flags |= EACH_ITEM_IMMUTABLE;
        if controlled {
            flags |= EACH_IS_CONTROLLED;
        }
        flags
    }

    /// Upstream passes the collection to the render function when the item or the index hides a
    /// name of an outer scope.
    fn shadows_outer_name(&self, bindings: EachBindings) -> bool {
        let sem = &self.res.sem;
        bindings.iter().any(|b| {
            let s = &sem.bindings[b];
            sem.scopes[s.scope]
                .parent
                .is_some_and(|p| sem.lookup(p, s.name).is_some())
        })
    }

    fn index_use(&self, each: &Each, bindings: EachBindings) -> IndexUse {
        let (javascript, sem) = (self.javascript, &self.res.sem);
        let key_span = each
            .key()
            .and_then(|k| javascript.source_location(k).span());
        let in_key = |n: NodeIdentifier| {
            let at = javascript.source_location(n).span();
            key_span.is_some_and(|k| {
                at.is_some_and(|a| k.start_offset <= a.start_offset && a.end_offset <= k.end_offset)
            })
        };
        let mut index_use = IndexUse {
            body: false,
            key: false,
        };
        if let Some(b) = bindings.index {
            for r in sem.references_to(b) {
                if in_key(r.node) {
                    index_use.key = true;
                } else {
                    index_use.body = true;
                }
            }
        }
        // Upstream's `assign` and `mutate` transforms of the item set `uses_index`.
        if let Some(b) = bindings.item {
            let s = &sem.bindings[b];
            index_use.body |= s.writes > 0 || s.mutations > 0;
        }
        index_use
    }

    /// The body lowered in the block's scope, where a read of the item or the index goes through
    /// `$.get` when it is reactive.
    fn each_body(
        &mut self,
        each: &Each,
        context: NodeIdentifier,
        bindings: EachBindings,
        flags: u32,
    ) -> R<Vec<NodeIdentifier>> {
        if let Some(b) = bindings.item {
            self.each.insert(b, flags & EACH_ITEM_REACTIVE != 0);
        }
        if let Some(b) = bindings.index {
            self.each.insert(b, flags & EACH_INDEX_REACTIVE != 0);
        }
        let outer = self.scope;
        self.scope = self
            .res
            .sem
            .scope_of(context)
            .expect("an `{#each}` context opens a scope");
        let body = self.fragment(each.body);
        self.scope = outer;
        body
    }

    /// The key function sees the item and the index as plain values.
    fn key_function(
        &mut self,
        each: &Each,
        context: NodeIdentifier,
        bindings: EachBindings,
        index_name: &str,
        key_uses_index: bool,
    ) -> NodeIdentifier {
        let javascript = self.javascript;
        for b in bindings.iter() {
            self.each.insert(b, false);
        }
        let pattern = self.out.ident(
            javascript.name(context),
            javascript.source_location(context),
        );
        let key = self.expression(each.key().expect("a keyed block has a key"));
        let mut parameters = vec![pattern];
        if key_uses_index {
            parameters.push(self.out.identifier(index_name));
        }
        self.out
            .arrow(&parameters, key, true, false, SourceLocation::SYNTHETIC)
    }
}
