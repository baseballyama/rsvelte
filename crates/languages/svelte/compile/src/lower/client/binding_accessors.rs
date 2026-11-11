use oxc_ast::ast::{
    BindingIdentifier, ChainElement, Expression, IdentifierName, IdentifierReference,
};
use oxc_ast_visit::Visit;
use oxc_semantic::{ScopeId, SymbolId};
use oxc_span::SPAN;
use rsvelte_svelte_semantic::compiler_syntax_tree::{CompilerSyntaxTree, NodeKind};
use rsvelte_svelte_semantic::resolve::{Resolution, TemplateScope};
use rsvelte_typescript_tree::ExpressionIdentifier;
use rustc_hash::FxHashSet;

use super::{ClientCompilationContext, Read, ScriptRewrite};
use crate::lower::BindingKind;
use crate::lower::builder::Runtime;

impl<'o> ClientCompilationContext<'_, 'o> {
    pub(super) fn binding_accessors(
        &self,
        expression: ExpressionIdentifier,
        primitive: bool,
    ) -> (Expression<'o>, Expression<'o>) {
        if let Expression::SequenceExpression(s) = self
            .javascript
            .get_expression(expression)
            .get_inner_expression()
            && let [get, set] = s.expressions.as_slice()
        {
            return (self.rewrite(get, true), self.rewrite(set, true));
        }
        let get = self.b.thunk(self.expression(expression));
        let set = self.binding_setter(expression, primitive);
        (get, set)
    }

    /// Upstream `build_bind_this`: `$.bind_this(node, set, get, values)`. The `{#each}` names the
    /// target reads are passed to both accessors, so that a torn down item clears its own entry.
    /// A regular element is the only value written unproxied.
    pub(super) fn bind_this(
        &self,
        expression: ExpressionIdentifier,
        node: Expression<'o>,
        element: bool,
    ) -> Expression<'o> {
        let b = self.b;
        let source = self
            .javascript
            .get_expression(expression)
            .get_inner_expression();
        let (getter, setter) = match source {
            Expression::SequenceExpression(s) if let [get, set] = s.expressions.as_slice() => {
                (get, Some(set))
            }
            _ => (source, None),
        };
        let names = each_names(self.res, &self.each_scopes, getter);
        let mut reads = self.reads.clone();
        for &(symbol, _) in &names {
            reads.insert(symbol, Read::Plain);
        }
        let read = self.rewriter(true);
        let values: Vec<_> = (names.iter())
            .map(|&(symbol, name)| {
                read.read_symbol(symbol, name, SPAN)
                    .unwrap_or_else(|| b.id(name))
            })
            .collect();
        let ids = names.iter().map(|&(_, name)| name);
        let mut rewrite = ScriptRewrite {
            template: Some(&reads),
            ..self.rewriter(true)
        };
        let get = rewrite.expression(getter);
        let set = match setter {
            Some(set) => rewrite.expression(set),
            None => rewrite.binding_assignment(source, element),
        };
        let parameter = |name| b.parameter(b.binding(name));
        let get = match get {
            Expression::ArrowFunctionExpression(mut f) => {
                f.params = b.parameters(ids.clone());
                Expression::ArrowFunctionExpression(f)
            }
            get if setter.is_some() => get,
            get => b.arrow(b.parameters(ids.clone()), optional_chain(b, get)),
        };
        let set = match set {
            Expression::ArrowFunctionExpression(mut f) => {
                let first = if f.params.items.is_empty() {
                    parameter("_")
                } else {
                    f.params.items.remove(0)
                };
                f.params = b.formal_parameters(std::iter::once(first).chain(ids.map(parameter)));
                Expression::ArrowFunctionExpression(f)
            }
            set if setter.is_some() => set,
            set => b.arrow(b.parameters(std::iter::once("$$value").chain(ids)), set),
        };
        let values = (!values.is_empty()).then(|| b.thunk(b.array(values)));
        b.runtime_some("bind_this", vec![Some(node), Some(set), Some(get), values])
    }

    pub(super) fn binding_setter(
        &self,
        expression: ExpressionIdentifier,
        primitive: bool,
    ) -> Expression<'o> {
        if let Expression::SequenceExpression(s) = self
            .javascript
            .get_expression(expression)
            .get_inner_expression()
            && let [_, set] = s.expressions.as_slice()
        {
            return self.rewrite(set, true);
        }
        let b = self.b;
        let assignment = self.binding_assignment(expression, primitive);
        crate::lower::builder::unthunk(b.arrow(b.parameters(["$$value"]), assignment))
    }

    /// `expression = $$value`, as the script rewrites an assignment to it.
    pub(super) fn binding_assignment(
        &self,
        expression: ExpressionIdentifier,
        primitive: bool,
    ) -> Expression<'o> {
        let source = self
            .javascript
            .get_expression(expression)
            .get_inner_expression();
        self.rewriter(true).binding_assignment(source, primitive)
    }
}

/// Upstream's scope of each `{#each}`, which holds its context, its index and the `{@const}`s
/// of its body; this tree opens a scope for the context and another for the body.
pub(super) fn each_scopes(tree: &CompilerSyntaxTree, res: &Resolution) -> FxHashSet<ScopeId> {
    let mut scopes = FxHashSet::default();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        if let NodeKind::Each(each) = &node.kind {
            let opened = [
                TemplateScope::Each(identifier),
                TemplateScope::Fragment(each.body),
            ];
            scopes.extend(
                opened
                    .into_iter()
                    .filter_map(|scope| res.template_scope(scope)),
            );
        }
    }
    scopes
}

/// The names a `bind:this` target reads that an `{#each}`'s scope declares, in order, except a
/// signal, which the accessors read themselves. Upstream skips a name it has met before as
/// anything, even a property key.
fn each_names<'e>(
    res: &Resolution,
    each_scopes: &FxHashSet<ScopeId>,
    e: &Expression<'e>,
) -> Vec<(SymbolId, &'e str)> {
    struct Names<'r, 'e> {
        res: &'r Resolution,
        each_scopes: &'r FxHashSet<ScopeId>,
        seen: FxHashSet<&'e str>,
        found: Vec<(SymbolId, &'e str)>,
    }
    impl<'e> Names<'_, 'e> {
        fn first(&mut self, name: &'e str) -> bool {
            self.seen.insert(name)
        }
    }
    impl<'e> Visit<'e> for Names<'_, 'e> {
        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'e>) {
            let name = it.name.as_str();
            if self.first(name)
                && let Some(symbol) = self.res.symbol(it)
                && self
                    .each_scopes
                    .contains(&self.res.scoping().symbol_scope_id(symbol))
                && !self.res.is_state_source(symbol)
                && !matches!(
                    self.res.binding(symbol).kind,
                    BindingKind::Derived | BindingKind::DerivedBy
                )
            {
                self.found.push((symbol, name));
            }
        }

        fn visit_identifier_name(&mut self, it: &IdentifierName<'e>) {
            self.first(it.name.as_str());
        }

        fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'e>) {
            self.first(it.name.as_str());
        }
    }
    let mut names = Names {
        res,
        each_scopes,
        seen: FxHashSet::default(),
        found: Vec::new(),
    };
    names.visit_expression(e);
    names.found
}

/// Upstream makes every member of a `bind:this` getter optional, as the object may be gone.
fn optional_chain<'o>(b: &crate::lower::Builder<'o>, mut get: Expression<'o>) -> Expression<'o> {
    let mut link = &mut get;
    loop {
        match link {
            Expression::StaticMemberExpression(m) => {
                m.optional = true;
                link = &mut m.object;
            }
            Expression::ComputedMemberExpression(m) => {
                m.optional = true;
                link = &mut m.object;
            }
            _ => break,
        }
    }
    let element = match get {
        Expression::StaticMemberExpression(m) => ChainElement::StaticMemberExpression(m),
        Expression::ComputedMemberExpression(m) => ChainElement::ComputedMemberExpression(m),
        get => return get,
    };
    Expression::new_chain_expression(SPAN, element, b)
}
