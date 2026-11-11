mod destructure;

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{BindingIdentifier, BindingPattern, Expression, Statement};
use oxc_ast_visit::VisitMut;
use oxc_semantic::{SymbolFlags, SymbolId};
use oxc_span::GetSpan;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, Each, ElementKind, MetadataTag,
};
use rsvelte_svelte_semantic::resolve::TemplateScope;

use crate::lower::builder::Runtime;
use crate::lower::client::{
    ClientCompilationContext, CompilerNodeIdentifier, Frag, Lists, NodeKind, R, Read,
    has_dependency,
};

const EACH_ITEM_REACTIVE: u32 = 1;

const EACH_INDEX_REACTIVE: u32 = 1 << 1;

const EACH_IS_CONTROLLED: u32 = 1 << 2;

const EACH_IS_ANIMATED: u32 = 1 << 3;

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
    /// Upstream `EachBlock` (client, runes mode).
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
        let pattern = each.context.map(|c| &javascript.get_pattern(c).pattern);
        let (item, destructured) = match pattern {
            Some(BindingPattern::BindingIdentifier(item)) => (Some(&**item), None),
            pattern => (None, pattern),
        };
        let keyed = each.keyed(javascript);
        if let Some(pattern) = destructured {
            self.check_destructured(pattern)?;
        }
        let index = each
            .index
            .and_then(|i| javascript.get_pattern(i).pattern.get_binding_identifier());
        let collection = self.expression(each.collection);
        if !controlled {
            frag.tpl.push_comment();
        }
        let flags = self.each_flags(each, item, keyed, controlled);
        let bindings = EachBindings {
            item: item.and_then(|i| i.symbol_id.get()),
            index: index.and_then(|i| i.symbol_id.get()),
        };
        let collection_id = self
            .shadows_outer_name(identifier, each)
            .then(|| self.names.unique("$$array"));
        // A group reads the index by a name of its own, which the body declares as the index.
        let grouped = self.binding_groups.each.contains(&identifier);
        let index_name = match index {
            Some(i) if !grouped => i.name.as_str().to_owned(),
            _ => self.each_index[&identifier].clone(),
        };
        let mut index_use = self.index_use(each, bindings);
        index_use.body |= grouped;

        let destructured_names = destructured.map(destructure::names).unwrap_or_default();
        let mut body = self.each_body(each, identifier, bindings, flags, destructured)?;
        if grouped && let Some(i) = index {
            body.insert(0, b.let_(&i.name, Some(b.id(&index_name))));
        }
        let symbols: Vec<SymbolId> = bindings
            .iter()
            .chain(destructured_names.iter().map(|&(symbol, _)| symbol))
            .collect();
        let key_function = if keyed {
            let pattern = pattern.expect("a key follows `as`");
            self.key_function(each, pattern, &symbols, &index_name, index_use.key)
        } else {
            b.member(b.id("$"), "index")
        };
        for symbol in &symbols {
            self.reads.remove(symbol);
            self.invalidates.remove(symbol);
        }

        let thunk = b.thunk(collection);
        let mut render_args = vec![
            b.parameter(b.binding("$$anchor")),
            b.parameter(item.map_or_else(
                || b.binding("$$item"),
                |item| b.binding_at(&item.name, item.span),
            )),
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
        item: Option<&BindingIdentifier<'_>>,
        keyed: bool,
        controlled: bool,
    ) -> u32 {
        let javascript = self.javascript;
        let mut flags = 0;
        if keyed && each.index.is_some() {
            flags |= EACH_INDEX_REACTIVE;
        }
        let key_is_item = each.key.zip(item).is_some_and(|(k, item)| {
            let key = javascript.get_expression(k).get_inner_expression();
            matches!(key, Expression::Identifier(k) if k.name == item.name)
        });
        // A store's items may be mutated in place, so they are read again.
        let store = self
            .an
            .meta(each.collection)
            .first_store_subscription
            .is_some();
        let collection = javascript.get_expression(each.collection);
        if (!key_is_item || store) && has_dependency(self.res, collection.get_inner_expression()) {
            flags |= EACH_ITEM_REACTIVE;
        }
        if !store {
            flags |= EACH_ITEM_IMMUTABLE;
        }
        if each.key.is_some() && self.animated(each) {
            flags |= EACH_IS_ANIMATED;
        }
        if controlled {
            flags |= EACH_IS_CONTROLLED;
        }
        flags
    }

    /// Whether an element of the body has `animate:`, which only a keyed block's sole child may.
    fn animated(&self, each: &Each) -> bool {
        let tree = self.compiler_syntax_tree;
        tree.children(each.body).iter().any(|&child| {
            matches!(&tree.node(child).kind, NodeKind::Element(el)
                if matches!(el.kind, ElementKind::Regular | ElementKind::Metadata(Some(MetadataTag::Element)))
                    && tree
                        .attributes(el.attributes)
                        .iter()
                        .any(|a| matches!(a.value, AttributeValue::Animate { .. })))
        })
    }

    /// Upstream passes the collection to the render function when a name the block declares, in
    /// its context, its index or its body, hides a name of an outer scope.
    fn shadows_outer_name(&self, identifier: CompilerNodeIdentifier, each: &Each) -> bool {
        let scoping = self.res.scoping();
        let scopes = [
            TemplateScope::Each(identifier),
            TemplateScope::Fragment(each.body),
        ]
        .map(|scope| self.res.template_scope(scope));
        let Some(outer) = scopes
            .iter()
            .flatten()
            .next()
            .and_then(|&s| scoping.scope_parent_id(s))
        else {
            return false;
        };
        (scopes.into_iter().flatten())
            .flat_map(|scope| scoping.get_bindings(scope).keys())
            // Upstream erases the types first, so a type-only name shadows nothing.
            .any(|&name| {
                scoping.find_binding(outer, name).is_some_and(|symbol| {
                    scoping
                        .symbol_flags(symbol)
                        .intersects(SymbolFlags::Value | SymbolFlags::Import)
                })
            })
    }

    fn index_use(&self, each: &Each, bindings: EachBindings) -> IndexUse {
        let key_span = each.key.map(|k| {
            self.javascript
                .get_expression(k)
                .get_inner_expression()
                .span()
        });
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
        destructured: Option<&'o BindingPattern<'o>>,
    ) -> R<Vec<Statement<'o>>> {
        // Upstream invalidates the store after a write through the item or a name it destructures.
        let store = (self.an.meta(each.collection).first_store_subscription).map(|store| {
            let span = self.res.reference_span(store);
            &self.source_text[span.start as usize..span.end as usize]
        });
        let destructured_names = destructured.map(destructure::names).unwrap_or_default();
        let item_names = bindings.item.into_iter();
        if let Some(store) = store {
            for symbol in item_names.chain(destructured_names.iter().map(|&(symbol, _)| symbol)) {
                self.invalidates.insert(symbol, store);
            }
        }
        if let Some(symbol) = bindings.item {
            self.reads
                .insert(symbol, Read::get_if(flags & EACH_ITEM_REACTIVE != 0));
        }
        if let Some(symbol) = bindings.index {
            self.reads
                .insert(symbol, Read::get_if(flags & EACH_INDEX_REACTIVE != 0));
        }
        let outer = self.scope;
        // A block that declares no name opens no scope.
        if let Some(scope) = self.res.template_scope(TemplateScope::Each(identifier)) {
            self.scope = scope;
        }
        let mut declarations = Vec::new();
        if let Some(pattern) = destructured {
            self.destructure(pattern, flags & EACH_ITEM_REACTIVE != 0, &mut declarations);
        }
        let body = self.fragment(each.body);
        self.scope = outer;
        declarations.extend(body?);
        Ok(declarations)
    }

    /// The key function sees the item and the index as plain values.
    fn key_function(
        &mut self,
        each: &Each,
        pattern: &BindingPattern<'_>,
        symbols: &[SymbolId],
        index_name: &str,
        key_uses_index: bool,
    ) -> Expression<'o> {
        let b = self.b;
        for &symbol in symbols {
            self.reads.insert(symbol, Read::Plain);
        }
        let key = self.expression(each.key.expect("a keyed block has a key"));
        let mut pattern = pattern.clone_in_with_semantic_ids(b.allocator());
        self.rewriter(true).visit_binding_pattern(&mut pattern);
        let mut parameters = vec![b.parameter(pattern)];
        if key_uses_index {
            parameters.push(b.parameter(b.binding(index_name)));
        }
        b.arrow(b.formal_parameters(parameters), key)
    }
}
