//! svelte2tsx's store subscriptions: a `$x` declaration for each store `x` the component reads as
//! `$x`.

use oxc_ast::AstKind;
use oxc_ast::ast::Statement;
use oxc_span::GetSpan;
use oxc_syntax::symbol::SymbolId;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_tree::document_span;

use super::super::{Buffer, Builder, Node, Span};
use super::Edit;

/// Where svelte2tsx declares a store subscription.
#[derive(Clone, Copy)]
enum StoreAt {
    /// After the top-level statement that ends here.
    After(u32),
    /// First in the instance, or before the template without one.
    Start,
}

/// Each store subscription `$x` whose store `x` a variable or an import of the instance binds, for
/// which svelte2tsx declares `$x`: the name, the store's symbol, and whether an import binds it.
fn subscribed_stores<'a>(
    resolution: &'a Resolution,
    declared: &'a [SymbolId],
) -> impl Iterator<Item = (&'a str, SymbolId, bool)> {
    let scoping = resolution.scoping();
    resolution
        .unresolved_names()
        .chain(declared.iter().map(|&symbol| scoping.symbol_name(symbol)))
        .filter(|name| resolution.is_store_subscription(name))
        .filter_map(move |name| {
            let symbol = scoping.find_binding(resolution.instance_scope(), name[1..].into())?;
            match resolution.declaration(symbol) {
                AstKind::VariableDeclarator(_) => Some((name, symbol, false)),
                AstKind::ImportSpecifier(_)
                | AstKind::ImportDefaultSpecifier(_)
                | AstKind::ImportNamespaceSpecifier(_) => Some((name, symbol, true)),
                _ => None,
            }
        })
}

/// Each `$x` the component declares itself at the top of a script and reads: svelte2tsx still
/// declares a subscription for it, which TypeScript reports as declared twice.
fn declared_subscriptions(resolution: &Resolution) -> Vec<SymbolId> {
    let scoping = resolution.scoping();
    let top = [resolution.instance_scope(), scoping.root_scope_id()];
    scoping
        .symbol_ids()
        .filter(|&symbol| {
            scoping.symbol_name(symbol).starts_with('$')
                && top.contains(&scoping.symbol_scope_id(symbol))
                && !scoping.get_resolved_reference_ids(symbol).is_empty()
        })
        .collect()
}

/// Each store `x` that the projection reads as `$x`, by its name's range, with where the
/// component reads `$x`.
#[must_use]
pub fn store_reads(resolution: &Resolution) -> Vec<(Span, Vec<Span>)> {
    let scoping = resolution.scoping();
    let declared_all = declared_subscriptions(resolution);
    subscribed_stores(resolution, &declared_all)
        .map(|(name, symbol, _)| {
            let declared = declared_all
                .iter()
                .filter(|&&own| scoping.symbol_name(own) == name)
                .flat_map(|&own| scoping.get_resolved_reference_ids(own));
            let reads = (scoping.root_unresolved_references().get(name).into_iter())
                .flatten()
                .chain(declared)
                .map(|&reference| document_span(resolution.reference_span(reference)))
                .collect();
            (document_span(scoping.symbol_span(symbol)), reads)
        })
        .collect()
}

impl Builder<'_> {
    /// Pushes the module script with its store declarations, and returns the instance's.
    /// The instance's store edits, and where the render function starts in the scratch: after the
    /// module script.
    pub(super) fn module_and_store_edits(&mut self) -> (Buffer<Edit>, usize) {
        let stores = self.store_subscriptions();
        let after = |content: Span| {
            stores.iter().filter_map(move |&(at, store)| match at {
                StoreAt::After(end) if content.start_offset <= end && end <= content.end_offset => {
                    Some((end, store))
                }
                _ => None,
            })
        };
        if let Some(script) = &self.component.module {
            let mut edits: Vec<Edit> = after(script.content)
                .map(|(end, store)| self.store_edit(end, store))
                .collect();
            let program = self.component.javascript.get_program(script.program);
            // Without an instance script, svelte2tsx moves snippets after the module's imports.
            if self.component.instance.is_none()
                && let Some(snippets) = self.module_snippets.take()
            {
                let at = program
                    .body
                    .iter()
                    .take_while(|s| matches!(s, Statement::ImportDeclaration(_)))
                    .last()
                    .map_or(script.content.start_offset, |s| s.span().end);
                edits.push(Edit {
                    span: Span::new(at, at),
                    replacement: Some(snippets),
                });
            }
            self.type_assertions(program, &mut edits);
            self.script_parts(script, &edits);
        }
        let render_start = self.scratch.len();
        let mut edits = Buffer::new(0);
        let first = stores.iter().filter(|(at, _)| matches!(at, StoreAt::Start));
        if let Some(script) = &self.component.instance {
            let start = script.content.start_offset;
            for &(_, store) in first {
                edits.push(self.store_edit(start, store));
            }
            for (end, store) in after(script.content) {
                edits.push(self.store_edit(end, store));
            }
        } else {
            for &(_, store) in first {
                self.scratch
                    .push(self.tree.push(Node::StoreSubscription(store)));
            }
        }
        (edits, render_start)
    }

    /// svelte2tsx declares `$x` for each store subscription whose store `x` a variable or an import
    /// binds: after the variable's statement, or first in the instance.
    fn store_subscriptions(&self) -> Vec<(StoreAt, Span)> {
        let Some(resolution) = (self.resolution)() else {
            return Vec::new();
        };
        let scoping = resolution.scoping();
        let programs = [&self.component.module, &self.component.instance];
        let statement_end = |at: oxc_span::Span| {
            programs
                .iter()
                .filter_map(|script| script.as_ref())
                .flat_map(|script| &self.component.javascript.get_program(script.program).body)
                .find(|statement| {
                    let s = statement.span();
                    s.start <= at.start && at.end <= s.end
                })
                .map(|statement| statement.span().end)
        };
        let declared = declared_subscriptions(resolution);
        let mut out: Vec<_> = subscribed_stores(resolution, &declared)
            .filter_map(|(_, symbol, import)| {
                let store = scoping.symbol_span(symbol);
                let at = if import {
                    StoreAt::Start
                } else {
                    StoreAt::After(statement_end(store)?)
                };
                Some((at, document_span(store)))
            })
            .collect();
        out.sort_unstable_by_key(|&(_, store)| store.start_offset);
        out
    }

    fn store_edit(&mut self, at: u32, store: Span) -> Edit {
        Edit {
            span: Span::new(at, at),
            replacement: Some(self.tree.push(Node::StoreSubscription(store))),
        }
    }
}
