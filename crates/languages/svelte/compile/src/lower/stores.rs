//! Store subscriptions: upstream's synthetic `store_sub` bindings, one per `$name` that reads the
//! store `name`.

use oxc_ast::ast::Ident;
use oxc_semantic::ReferenceId;

use rsvelte_svelte_semantic::compiler_syntax_tree::{
    AttributeValue, ElementKind, MetadataTag, NodeKind,
};
use rustc_hash::FxHashSet;

use super::validation::unbound;
use super::{CompileInput, Diagnostic, Resolution, Span, span_of};

/// The `$name`s no binding declares, each with its references, in upstream's order: the module
/// script's, the instance script's, then the template's, each in the order upstream's scope walk
/// meets them.
pub(super) struct Names<'r> {
    names: Vec<(&'r str, Vec<ReferenceId>)>,
}

impl<'r> Names<'r> {
    pub(super) fn new(input: &CompileInput<'_>, res: &'r Resolution) -> Self {
        let javascript = input.component.javascript;
        let program = |p| javascript.get_program(p).span;
        let module = input.component.module.map(program);
        let instance = input.component.instance.map(program);
        let walk = TemplateWalk::new(input);
        let order = |r: ReferenceId| {
            let start = res.reference_span(r).start;
            let inside =
                |s: Option<oxc_span::Span>| s.is_some_and(|s| s.start <= start && start < s.end);
            if inside(module) {
                (0, 0, start, start)
            } else if inside(instance) {
                (1, 0, start, start)
            } else {
                walk.order(start)
            }
        };
        let dollar = |name: &str| {
            name.starts_with('$') && !matches!(name, "$$props" | "$$restProps" | "$$slots")
        };
        let mut names: Vec<_> = unbound(res, dollar)
            .filter(|(_, references)| !references.is_empty())
            .map(|(name, mut references)| {
                references.sort_unstable_by_key(|&r| order(r));
                (name, references)
            })
            .collect();
        names.sort_unstable_by_key(|(_, references)| order(references[0]));
        Self { names }
    }

    /// The store subscriptions, in upstream's order.
    pub(super) fn subscriptions(&self, res: &Resolution) -> Vec<String> {
        (self.names.iter())
            .filter(|(name, _)| res.is_store_subscription(name))
            .map(|&(name, _)| name.to_owned())
            .collect()
    }

    /// The references of the store subscriptions.
    pub(super) fn subscription_references(
        &self,
        res: &Resolution,
    ) -> impl Iterator<Item = ReferenceId> {
        (self.names.iter())
            .filter(move |(name, _)| res.is_store_subscription(name))
            .flat_map(|(_, references)| references.iter().copied())
    }

    /// Upstream's errors for a `$name` as it declares the subscriptions.
    ///
    /// # Errors
    ///
    /// `global_reference_invalid` for `$`, a `$$name` or an undeclared lowercase store;
    /// `store_invalid_scoped_subscription` for a store a nested scope declares; and
    /// `store_invalid_subscription` for a subscription in the module script.
    pub(super) fn check(
        &self,
        input: &CompileInput<'_>,
        res: &Resolution,
    ) -> Result<(), Diagnostic> {
        let scoping = res.scoping();
        let span = |r: ReferenceId| {
            let span = res.reference_span(r);
            Span::new(span.start, span.end)
        };
        let module =
            (input.component.module).map(|p| input.component.javascript.get_program(p).span);
        for (name, references) in &self.names {
            let name = *name;
            if name == "$" || name.starts_with("$$") {
                return global_reference_invalid(name, span(references[0]));
            }
            if !res.is_store_subscription(name) {
                continue;
            }
            let store = Ident::from(&name[1..]);
            let top = [scoping.root_scope_id(), res.instance_scope()];
            let scoped = references.iter().find(|&&r| {
                scoping
                    .find_binding(res.reference_scope(r), store)
                    .is_some_and(|s| !top.contains(&scoping.symbol_scope_id(s)))
            });
            if let Some(&r) = scoped {
                return super::special::invalid(
                    "store_invalid_scoped_subscription",
                    "Cannot subscribe to stores that are not declared at the top level of the component",
                    span(r),
                );
            }
            let declared = scoping.find_binding(res.instance_scope(), store).is_some();
            if !declared && name[1..].starts_with(|c: char| c.is_ascii_lowercase()) {
                return global_reference_invalid(name, span(references[0]));
            }
            let in_module = references.iter().find(|&&r| {
                let start = res.reference_span(r).start;
                module.is_some_and(|m| m.start < start && start < m.end)
            });
            if let Some(&r) = in_module {
                return super::special::invalid(
                    "store_invalid_subscription",
                    "Cannot reference store value inside `<script module>`",
                    span(r),
                );
            }
        }
        Ok(())
    }
}

/// Where upstream's template scope walk meets a reference, by its start. It references a
/// directive's name as it meets the directive, and every other name after the walk, in walk order,
/// which visits an `{#each}`'s fallback after its collection and a `<svelte:element>`'s `this`
/// after its children.
struct TemplateWalk {
    directives: FxHashSet<u32>,
    /// A reference in `start..end` is met at `at`.
    moved: Vec<(u32, u32, u32)>,
}

impl TemplateWalk {
    fn new(input: &CompileInput<'_>) -> Self {
        let tree = input.component.compiler_syntax_tree;
        let span = |e| span_of(input.component.javascript.get_expression(e));
        let mut walk = Self {
            directives: FxHashSet::default(),
            moved: Vec::new(),
        };
        for node in &tree.nodes {
            match &node.kind {
                NodeKind::Element(element) => {
                    for a in tree.attributes(element.attributes) {
                        if let AttributeValue::Use { action: name, .. }
                        | AttributeValue::Transition { function: name, .. }
                        | AttributeValue::Animate { function: name, .. } = a.value
                        {
                            walk.directives.insert(span(name).start_offset);
                        }
                    }
                    let dynamic = element.kind == ElementKind::Metadata(Some(MetadataTag::Element));
                    if let Some(this) = element.this.filter(|_| dynamic) {
                        let this = tree.attributes[this].span;
                        walk.moved
                            .push((this.start_offset, this.end_offset, node.span.end_offset));
                    }
                }
                NodeKind::Each(each) => {
                    let fallback = each
                        .fallback
                        .and_then(|f| tree.children(f).first().copied());
                    if let Some(first) = fallback {
                        let start = tree.node(first).span.start_offset;
                        let at = span(each.collection).end_offset;
                        walk.moved.push((start, node.span.end_offset, at));
                    }
                }
                _ => {}
            }
        }
        walk
    }

    fn order(&self, start: u32) -> (u8, u8, u32, u32) {
        if self.directives.contains(&start) {
            return (2, 0, start, start);
        }
        let at = (self.moved.iter())
            .find(|&&(from, to, _)| from <= start && start < to)
            .map_or(start, |&(_, _, at)| at);
        (2, 1, at, start)
    }
}

fn global_reference_invalid(name: &str, span: Span) -> Result<(), Diagnostic> {
    super::special::invalid(
        "global_reference_invalid",
        &format!(
            "`{name}` is an illegal variable name. To reference a global variable called `{name}`, use `globalThis.{name}`"
        ),
        span,
    )
}
