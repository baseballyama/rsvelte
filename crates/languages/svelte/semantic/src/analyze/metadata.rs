use oxc_ast::ast::{
    Argument, ArrowFunctionExpression, CallExpression, ChainElement, ChainExpression,
    ComputedMemberExpression, Expression, Function, IdentifierReference, NewExpression,
    PrivateFieldExpression, SpreadElement, StaticMemberExpression, TSType,
    TaggedTemplateExpression,
};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::{ScopeFlags, SymbolFlags};
use rustc_hash::{FxBuildHasher, FxHashMap, FxHashSet};

use super::ExpressionMetadata;
use super::evaluation::BindingValues;
use crate::resolve::{BindingKind, Resolution};
use crate::typescript::without_typescript;

/// Computes [`ExpressionMetadata`] the way upstream's analysis visitors do, and `needs_context`.
pub(super) struct MetadataWalker<'r, 'walk, const COLLECT_METADATA: bool> {
    res: &'r Resolution,
    values: &'walk mut BindingValues<'r>,
    meta: ExpressionMetadata,
    /// Bindings referenced so far (upstream `metadata.dependencies`, as a count).
    deps: u32,
    needs_context: bool,
    function_depth: u32,
    /// Each walked call's `is_pure`, by address, so a chain `f()()…` is judged once per link, not
    /// once per link per enclosing call.
    pure_calls: FxHashMap<usize, bool>,
    /// The calls that end an optional chain, by address: upstream's `ChainExpression` names no
    /// rune.
    chain_calls: FxHashSet<usize>,
}

fn address<T>(node: &T) -> usize {
    std::ptr::from_ref(node).addr()
}

impl<'r, 'walk, const COLLECT_METADATA: bool> MetadataWalker<'r, 'walk, COLLECT_METADATA> {
    pub(super) fn new(res: &'r Resolution, values: &'walk mut BindingValues<'r>) -> Self {
        Self {
            res,
            values,
            meta: ExpressionMetadata::default(),
            deps: 0,
            needs_context: false,
            function_depth: 0,
            pure_calls: FxHashMap::with_hasher(FxBuildHasher),
            chain_calls: FxHashSet::with_hasher(FxBuildHasher),
        }
    }

    pub(super) const fn metadata(&self) -> ExpressionMetadata {
        self.meta
    }

    pub(super) const fn needs_context(&self) -> bool {
        self.needs_context
    }

    /// A function's expression state does not reach the enclosing expression.
    fn in_function(&mut self, walk: impl FnOnce(&mut Self)) {
        let (meta, deps) = (self.meta, self.deps);
        self.function_depth += 1;
        walk(self);
        self.function_depth -= 1;
        self.meta = meta;
        self.deps = deps;
    }

    /// Judges a member whose object is not itself a member: every link of a chain `a.b.c…` shares
    /// its root, so only the innermost one is judged.
    fn member(&mut self, object: &Expression<'_>) {
        if without_typescript(object).is_member_expression() {
            return;
        }
        self.meta.has_member = true;
        if COLLECT_METADATA && !self.is_pure_member(object) {
            self.meta.has_state = true;
        }
        if !self.is_safe_member(object) {
            self.needs_context = true;
        }
    }

    /// Whether an unbound reference is upstream's synthetic `store_sub` binding.
    fn is_store_subscription(&self, identifier: &IdentifierReference<'_>) -> bool {
        self.res.symbol(identifier).is_none()
            && self.res.is_store_subscription(identifier.name.as_str())
    }

    fn reference(&mut self, identifier: &IdentifierReference<'_>) {
        self.meta.has_reference = true;
        let Some(symbol) = self.res.symbol(identifier) else {
            // A subscription is never static, a function or known, so it is state.
            if self.is_store_subscription(identifier) {
                self.deps += 1;
                self.meta.has_state = true;
                if self.meta.first_store_subscription.is_none() {
                    self.meta.first_store_subscription = Some(identifier.reference_id());
                }
            }
            return;
        };
        self.deps += 1;
        let info = self.res.binding(symbol);
        let prop = matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
        );
        if info.kind != BindingKind::StaticIndex
            && (prop || !info.is_function)
            && !self.values.is_known(symbol, identifier)
        {
            self.meta.has_state = true;
        }
    }

    /// Upstream `is_pure` of a member whose object is `object`: an optional chain there never is.
    fn is_pure_member(&self, object: &Expression<'_>) -> bool {
        !matches!(object, Expression::ChainExpression(_)) && self.is_pure(object)
    }

    /// Upstream `is_pure`. A chain `f().a()…` is followed by a loop: a member's object that is
    /// not an identifier is pure when it is, and an optional chain there never is.
    fn is_pure(&self, mut e: &Expression<'_>) -> bool {
        loop {
            match e {
                Expression::StringLiteral(_)
                | Expression::RegExpLiteral(_)
                | Expression::BigIntLiteral(_)
                | Expression::NumericLiteral(_)
                | Expression::BooleanLiteral(_)
                | Expression::NullLiteral(_) => return true,
                Expression::CallExpression(call) => {
                    if let Some(&pure) = self.pure_calls.get(&address(&**call)) {
                        return pure;
                    }
                    if !self.is_pure_call(call) {
                        return false;
                    }
                    e = &call.callee;
                }
                Expression::Identifier(identifier) => {
                    return self.res.symbol(identifier).is_none()
                        && !self.is_store_subscription(identifier);
                }
                _ => match e.as_member_expression() {
                    Some(member) => {
                        if matches!(member.object(), Expression::ChainExpression(_)) {
                            return false;
                        }
                        e = member.object();
                    }
                    None => return false,
                },
            }
        }
    }

    /// Whether a call's arguments are pure and its callee is no optional chain; the callee itself
    /// is judged by the caller.
    fn is_pure_call(&self, call: &CallExpression<'_>) -> bool {
        call.arguments.iter().all(|a| match a {
            Argument::SpreadElement(_) => false,
            a => a.as_expression().is_some_and(|a| self.is_pure(a)),
        }) && !matches!(call.callee, Expression::ChainExpression(_))
    }

    /// Upstream `is_safe_identifier` of a member whose object is `object`.
    fn is_safe_member(&self, object: &Expression<'_>) -> bool {
        root(object).is_some_and(|root| self.is_safe_root(root))
    }

    /// Upstream `is_safe_identifier`.
    fn is_safe(&self, e: &Expression<'_>) -> bool {
        root(e).is_some_and(|root| self.is_safe_root(root))
    }

    fn is_safe_root(&self, root: &IdentifierReference<'_>) -> bool {
        let symbol = match self.res.symbol(root) {
            Some(symbol) => symbol,
            // Upstream asks of a subscription what it asks of its store.
            None if self.is_store_subscription(root) => {
                let store = &root.name.as_str()[1..];
                let scope = self.res.instance_scope();
                match self.res.scoping().find_binding(scope, store.into()) {
                    Some(symbol) => symbol,
                    None => return true,
                }
            }
            None => return true,
        };
        !self
            .res
            .scoping()
            .symbol_flags(symbol)
            .contains(SymbolFlags::Import)
            && !matches!(
                self.res.binding(symbol).kind,
                BindingKind::Property | BindingKind::BindableProperty | BindingKind::RestProperty
            )
    }

    fn call_end(&mut self, call: &CallExpression<'_>, rune: Option<&'static str>) {
        // Inner calls end first, so this reads their recorded purity instead of walking them.
        if COLLECT_METADATA {
            let pure = self.is_pure_call(call) && self.is_pure(&call.callee);
            self.pure_calls.insert(address(call), pure);
        }
        // A whole optional chain as the callee is upstream's `ChainExpression`.
        let chain = matches!(call.callee, Expression::ChainExpression(_));
        if rune.is_none() {
            if chain || !self.is_safe(&call.callee) {
                self.needs_context = true;
            }
            if COLLECT_METADATA && (chain || !self.is_pure(&call.callee) || self.deps > 0) {
                self.meta.has_call = true;
                self.meta.has_state = true;
            }
        } else if rune == Some("$effect.pending") {
            self.meta.has_state = true;
        } else if COLLECT_METADATA && rune == Some("$effect.tracking") {
            // Upstream's `is_pure` calls it impure, so it is read inside an effect.
            self.meta.has_call = true;
            self.meta.has_state = true;
        } else if matches!(rune, Some("$effect" | "$effect.pre" | "$bindable")) {
            self.needs_context = true;
        }
    }
}

impl<'a, const COLLECT_METADATA: bool> Visit<'a> for MetadataWalker<'_, '_, COLLECT_METADATA> {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        if COLLECT_METADATA {
            self.reference(it);
        }
    }

    fn visit_static_member_expression(&mut self, it: &StaticMemberExpression<'a>) {
        self.member(&it.object);
        walk::walk_static_member_expression(self, it);
    }

    fn visit_computed_member_expression(&mut self, it: &ComputedMemberExpression<'a>) {
        self.member(&it.object);
        walk::walk_computed_member_expression(self, it);
    }

    fn visit_private_field_expression(&mut self, it: &PrivateFieldExpression<'a>) {
        self.member(&it.object);
        walk::walk_private_field_expression(self, it);
    }

    fn visit_chain_expression(&mut self, it: &ChainExpression<'a>) {
        if let ChainElement::CallExpression(call) = &it.expression {
            self.chain_calls.insert(address(&**call));
        }
        walk::walk_chain_expression(self, it);
    }

    fn visit_call_expression(&mut self, it: &CallExpression<'a>) {
        let rune = if self.chain_calls.contains(&address(it))
            || matches!(it.callee, Expression::ChainExpression(_))
        {
            None
        } else {
            self.res.rune_of_call(it)
        };
        walk::walk_call_expression(self, it);
        self.call_end(it, rune);
    }

    fn visit_new_expression(&mut self, it: &NewExpression<'a>) {
        self.needs_context = true;
        walk::walk_new_expression(self, it);
    }

    // Upstream `TaggedTemplateExpression`: a tag is a call.
    fn visit_tagged_template_expression(&mut self, it: &TaggedTemplateExpression<'a>) {
        if COLLECT_METADATA && !self.is_pure(&it.tag) {
            self.meta.has_call = true;
            self.meta.has_state = true;
        }
        walk::walk_tagged_template_expression(self, it);
    }

    // Upstream `SpreadElement`: `[...x]` reads like `[...x.values()]`. Its expression state is
    // cleared inside functions.
    fn visit_spread_element(&mut self, it: &SpreadElement<'a>) {
        if self.function_depth == 0 {
            self.meta.has_call = true;
            self.meta.has_state = true;
        }
        walk::walk_spread_element(self, it);
    }

    fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
        self.in_function(|walker| walk::walk_function(walker, it, flags));
    }

    fn visit_arrow_function_expression(&mut self, it: &ArrowFunctionExpression<'a>) {
        self.in_function(|walker| walk::walk_arrow_function_expression(walker, it));
    }

    // Types name no runtime value.
    fn visit_ts_type(&mut self, _: &TSType<'a>) {}
}

/// The identifier a member chain starts from; an optional chain as an object has none.
fn root<'e>(mut e: &'e Expression<'e>) -> Option<&'e IdentifierReference<'e>> {
    loop {
        e = without_typescript(e);
        if let Expression::Identifier(identifier) = e {
            return Some(identifier);
        }
        let member = e.as_member_expression()?;
        if matches!(member.object(), Expression::ChainExpression(_)) {
            return None;
        }
        e = member.object();
    }
}
