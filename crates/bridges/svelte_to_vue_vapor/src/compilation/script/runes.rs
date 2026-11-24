use oxc_ast::ast::{
    AssignmentExpression, AssignmentPattern, BindingPattern, CallExpression, Expression,
    PropertyDefinition, PropertyKey, VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};
use oxc_semantic::NodeId;
use rsvelte_svelte_compile::lower::is_expression_async;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_tree::{document_span, node_span};
use rustc_hash::FxHashSet;

use super::{Plan, Root};
use crate::compilation::{R, markers, unsupported};

pub(super) fn collect(
    res: &Resolution,
    root: &Root<'_>,
    plan: &mut Plan,
    consumed: &mut FxHashSet<NodeId>,
) -> R<()> {
    super::constructors::collect(res, root, &mut plan.constructors)?;
    let mut v = Collect {
        res,
        plan,
        consumed,
        result: Ok(()),
    };
    root.visit(&mut v);
    v.result
}

struct Collect<'r> {
    res: &'r Resolution,
    plan: &'r mut Plan,
    consumed: &'r mut FxHashSet<NodeId>,
    result: R<()>,
}

impl Collect<'_> {
    /// A value rune initialising `pattern` (`None` for a class field, `named` when its key is a
    /// name).
    fn value(
        &mut self,
        pattern: Option<&BindingPattern<'_>>,
        named: bool,
        init: &Expression<'_>,
    ) -> R<()> {
        let Some((name, argument)) = self.res.rune(init).filter(|(name, _)| value(name)) else {
            return Ok(());
        };
        self.plan.value_runes.insert(name);
        if name == "$derived"
            && let Some(argument) = argument
        {
            self.plan.async_values |= is_expression_async(argument);
        }
        let Expression::CallExpression(call) = init.get_inner_expression() else {
            unreachable!("a rune is a call")
        };
        let arity = if matches!(name, "$state" | "$state.raw") {
            call.arguments.len() <= 1
        } else {
            call.arguments.len() == 1
        };
        let pattern_supported = named
            && pattern.is_none_or(|p| {
                matches!(
                    p,
                    BindingPattern::BindingIdentifier(_)
                        | BindingPattern::ObjectPattern(_)
                        | BindingPattern::ArrayPattern(_)
                )
            });
        if !pattern_supported || !arity {
            return Err(unsupported(
                format_args!("this use of `{name}`"),
                node_span(init),
            ));
        }
        self.plan.destructured_value_runes |=
            pattern.is_some_and(|p| !matches!(p, BindingPattern::BindingIdentifier(_)));
        self.consumed.insert(root(&call.callee));
        Ok(())
    }

    fn call(&mut self, e: &Expression<'_>, call: &CallExpression<'_>) -> R<()> {
        let Some((name, _)) = self.res.rune(e) else {
            return Ok(());
        };
        let arity = match name {
            "$effect" | "$effect.pre" | "$effect.root" | "$state.snapshot" | "$state.eager" => {
                Some(1)
            }
            "$effect.tracking" | "$effect.pending" | "$host" => Some(0),
            "$inspect" | "$inspect.trace" => None,
            _ => return Ok(()),
        };
        if arity.is_some_and(|arity| call.arguments.len() != arity) {
            return Err(unsupported(
                format_args!("this use of `{name}`"),
                document_span(call.span),
            ));
        }
        self.consumed.insert(root(&call.callee));
        if !eager(name) {
            self.plan
                .called_runes
                .insert(name, document_span(call.span));
        }
        Ok(())
    }

    fn record(&mut self, result: R<()>) {
        if self.result.is_ok() {
            self.result = result;
        }
    }
}

impl<'a> Visit<'a> for Collect<'_> {
    fn visit_assignment_pattern(&mut self, it: &AssignmentPattern<'a>) {
        if let Some(("$bindable", _)) = self.res.rune(&it.right)
            && let Expression::CallExpression(call) = it.right.get_inner_expression()
        {
            self.consumed.insert(root(&call.callee));
        }
        walk::walk_assignment_pattern(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        if let Some(init) = &it.init {
            let result = self.value(Some(&it.id), true, init);
            self.record(result);
        }
        walk::walk_variable_declarator(self, it);
    }

    fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
        if !it.key.is_computed()
            && let Some(value) = &it.value
        {
            let named = matches!(
                it.key,
                PropertyKey::StaticIdentifier(_) | PropertyKey::PrivateIdentifier(_)
            );
            let result = self.value(None, named, value);
            self.record(result);
        }
        walk::walk_property_definition(self, it);
    }

    fn visit_assignment_expression(&mut self, it: &AssignmentExpression<'a>) {
        if self
            .plan
            .constructors
            .assignments
            .contains(&it.node_id.get())
        {
            let result = self.value(None, true, &it.right);
            self.record(result);
        }
        walk::walk_assignment_expression(self, it);
    }

    fn visit_expression(&mut self, it: &Expression<'a>) {
        if let Expression::CallExpression(call) = it {
            let result = self.call(it, call);
            self.record(result);
        }
        walk::walk_expression(self, it);
    }
}

/// The identifier a rune's callee starts with: `$state` of `$state.raw`.
pub(super) fn root(callee: &Expression<'_>) -> NodeId {
    match callee.get_inner_expression() {
        Expression::StaticMemberExpression(m) => root(&m.object),
        Expression::Identifier(id) => id.node_id.get(),
        _ => unreachable!("a rune's callee is a name"),
    }
}

pub(crate) fn eager(name: &str) -> bool {
    name == "$state.eager"
}

pub(crate) fn local(name: &str) -> Option<&'static str> {
    Some(match name {
        "$effect" => "$$effect",
        "$effect.pre" => "$$effect_pre",
        "$effect.root" => "$$effect_root",
        "$effect.tracking" => "$$effect_tracking",
        "$effect.pending" => "$$effect_pending",
        "$state.snapshot" => "$$snapshot",
        "$host" => markers::HOST,
        _ => return None,
    })
}

pub(super) fn inspect(name: &str) -> bool {
    matches!(name, "$inspect" | "$inspect.trace" | "$inspect().with")
}

pub(super) const SOURCE: &str = include_str!("runes.js");

/// The runes whose value the translation stores in a cell.
pub(crate) const VALUE: [&str; 4] = ["$state", "$state.raw", "$derived", "$derived.by"];

pub(crate) fn value(name: &str) -> bool {
    VALUE.contains(&name)
}
