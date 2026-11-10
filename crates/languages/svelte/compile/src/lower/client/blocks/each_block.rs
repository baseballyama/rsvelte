use oxc_ast::ast::{BindingIdentifier, Expression, Statement};
use oxc_semantic::SymbolId;
use oxc_span::GetSpan;
use rsvelte_svelte_semantic::compiler_syntax_tree::Each;
use rsvelte_svelte_semantic::resolve::TemplateScope;

use crate::lower::client::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind, R, Read,
    has_dependency, unsupported,
};
use crate::lower::span_of;

const EACH_ITEM_REACTIVE: u32 = 1;

const EACH_INDEX_REACTIVE: u32 = 1 << 1;

const EACH_IS_CONTROLLED: u32 = 1 << 2;

const EACH_ITEM_IMMUTABLE: u32 = 1 << 4;

/// The bindings an `{#each}` block declares: its item and its index.
#[derive(Clone, Copy)]
struct EachBindings {
    item: Option<SymbolId>,
    index: Option<SymbolId>,
}

impl EachBindings {
    fn iter(self) -> impl Iterator<Item = SymbolId> {
        [self.item, self.index].into_iter().flatten()
    }
}

/// Where the index is read: in the body (or by a write to the item), and in the key.
struct IndexUse {
    body: bool,
    key: bool,
}

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `EachBlock` (client, runes mode) for a block whose context is an identifier.
    pub(in crate::lower::client) fn each_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        controlled: bool,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let (compiler_syntax_tree, javascript, b) =
            (self.compiler_syntax_tree, self.javascript, self.b);
        let NodeKind::Each(each) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let context = each.context.expect("the parser requires `as`");
        let context_pattern = &javascript.get_pattern(context).pattern;
        let Some(context) = context_pattern.get_binding_identifier() else {
            return unsupported(
                "a destructuring `{#each}` context",
                span_of(context_pattern),
            );
        };
        let index = each
            .index
            .and_then(|i| javascript.get_pattern(i).pattern.get_binding_identifier());
        let collection = self.expression(each.collection);
        if !controlled {
            frag.tpl.push_comment();
        }
        let keyed = each.keyed(javascript);
        let flags = self.each_flags(each, context, keyed, controlled);
        let bindings = EachBindings {
            item: context.symbol_id.get(),
            index: index.and_then(|i| i.symbol_id.get()),
        };
        let collection_id = self
            .shadows_outer_name(bindings)
            .then(|| self.names.unique("$$array"));
        let index_name = index.map_or_else(
            || self.each_index[&identifier].clone(),
            |i| i.name.as_str().to_owned(),
        );
        let index_use = self.index_use(each, bindings);

        let body = self.each_body(each, identifier, bindings, flags)?;
        let key_function = if keyed {
            self.key_function(each, context, bindings, &index_name, index_use.key)
        } else {
            b.member(b.id("$"), "index")
        };
        for symbol in bindings.iter() {
            self.reads.remove(&symbol);
        }

        let thunk = b.thunk(collection);
        let mut render_args = vec![
            b.parameter(b.binding("$$anchor")),
            b.parameter(b.binding_at(&context.name, context.span)),
        ];
        if index_use.body || collection_id.is_some() {
            render_args.push(b.parameter(b.binding(&index_name)));
        }
        if let Some(c) = &collection_id {
            render_args.push(b.parameter(b.binding(c)));
        }
        let render = b.arrow_block(b.formal_parameters(render_args), body, false);
        let mut arguments = vec![
            Some(b.id(node)),
            Some(b.number(f64::from(flags))),
            Some(thunk),
            Some(key_function),
            Some(render),
        ];
        if let Some(f) = each.fallback {
            let fallback = self.fragment(f)?;
            arguments.push(Some(self.anchor_arrow(fallback)));
        }
        l.initializer
            .push(b.stmt(b.runtime_some("each", arguments)));
        Ok(())
    }

    fn each_flags(
        &self,
        each: &Each,
        context: &BindingIdentifier<'_>,
        keyed: bool,
        controlled: bool,
    ) -> u32 {
        let javascript = self.javascript;
        let mut flags = 0;
        if keyed && each.index.is_some() {
            flags |= EACH_INDEX_REACTIVE;
        }
        let key_is_item = each.key.is_some_and(|k| {
            let key = javascript.get_expression(k);
            matches!(key, Expression::Identifier(k) if k.name == context.name)
        });
        if !key_is_item && has_dependency(self.res, javascript.get_expression(each.collection)) {
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
        let scoping = self.res.scoping();
        bindings.iter().any(|symbol| {
            scoping
                .scope_parent_id(scoping.symbol_scope_id(symbol))
                .is_some_and(|p| {
                    scoping
                        .find_binding(p, scoping.symbol_name(symbol).into())
                        .is_some()
                })
        })
    }

    fn index_use(&self, each: &Each, bindings: EachBindings) -> IndexUse {
        let key_span = each.key.map(|k| self.javascript.get_expression(k).span());
        let mut index_use = IndexUse {
            body: false,
            key: false,
        };
        if let Some(symbol) = bindings.index {
            for &reference in self.res.scoping().get_resolved_reference_ids(symbol) {
                let at = self.res.reference_span(reference);
                if key_span.is_some_and(|k| k.start <= at.start && at.end <= k.end) {
                    index_use.key = true;
                } else {
                    index_use.body = true;
                }
            }
        }
        // Upstream's `assign` and `mutate` transforms of the item set `uses_index`.
        if let Some(symbol) = bindings.item {
            index_use.body |= self.res.writes(symbol) > 0 || self.res.mutations(symbol) > 0;
        }
        index_use
    }

    /// The body lowered in the block's scope, where a read of the item or the index goes through
    /// `$.get` when it is reactive.
    fn each_body(
        &mut self,
        each: &Each,
        identifier: CompilerNodeIdentifier,
        bindings: EachBindings,
        flags: u32,
    ) -> R<Vec<Statement<'o>>> {
        if let Some(symbol) = bindings.item {
            self.reads
                .insert(symbol, Read::get_if(flags & EACH_ITEM_REACTIVE != 0));
        }
        if let Some(symbol) = bindings.index {
            self.reads
                .insert(symbol, Read::get_if(flags & EACH_INDEX_REACTIVE != 0));
        }
        let outer = self.scope;
        self.scope = self
            .res
            .template_scope(TemplateScope::Each(identifier))
            .expect("an `{#each}` context opens a scope");
        let body = self.fragment(each.body);
        self.scope = outer;
        body
    }

    /// The key function sees the item and the index as plain values.
    fn key_function(
        &mut self,
        each: &Each,
        context: &BindingIdentifier<'_>,
        bindings: EachBindings,
        index_name: &str,
        key_uses_index: bool,
    ) -> Expression<'o> {
        let b = self.b;
        for symbol in bindings.iter() {
            self.reads.insert(symbol, Read::Plain);
        }
        let key = self.expression(each.key.expect("a keyed block has a key"));
        let mut parameters = vec![b.parameter(b.binding_at(&context.name, context.span))];
        if key_uses_index {
            parameters.push(b.parameter(b.binding(index_name)));
        }
        b.arrow(b.formal_parameters(parameters), key)
    }
}
