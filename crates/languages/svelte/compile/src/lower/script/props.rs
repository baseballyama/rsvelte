use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    AssignmentPattern, BindingPattern, BindingProperty, BindingRestElement, Expression,
    PropertyKey, Statement, VariableDeclarator,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_span::SPAN;

use super::writes::is_prop_source;
use super::{BindingKind, Names, ScriptRewrite, should_proxy_read};
use crate::lower::builder::Runtime;
use crate::lower::javascript::{is_simple_expression, prop_alias};

/// Upstream server `$props` declaration: `$$slots` and `$$events` go beside the rest, and
/// `x = $bindable(d)` becomes `x = d`.
pub(super) fn server_props_pattern<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    pattern: &BindingPattern<'_>,
) -> BindingPattern<'o> {
    let b = rw.b;
    // A component that reads `$$slots` declares it, so the pattern takes another name.
    let slots = if crate::lower::uses_slots(rw.res) {
        "$$slots_"
    } else {
        "$$slots"
    };
    let hidden = || {
        [("$$slots", slots), ("$$events", "$$events")].map(|(key, name)| {
            BindingProperty::new(
                SPAN,
                PropertyKey::new_static_identifier(SPAN, key, b),
                b.binding(name),
                key == name,
                false,
                b,
            )
        })
    };
    let mut pattern = pattern.clone_in_with_semantic_ids(b.allocator());
    UnwrapBindable(rw).visit_binding_pattern(&mut pattern);
    match pattern {
        BindingPattern::ObjectPattern(mut object) if object.rest.is_some() => {
            object.properties.extend(hidden());
            BindingPattern::ObjectPattern(object)
        }
        BindingPattern::BindingIdentifier(name) => {
            let rest = BindingRestElement::boxed(SPAN, BindingPattern::BindingIdentifier(name), b);
            BindingPattern::new_object_pattern(SPAN, b.vec(hidden()), Some(rest), b)
        }
        pattern => pattern,
    }
}

struct UnwrapBindable<'w, 'r, 'o>(&'w mut ScriptRewrite<'r, 'o>);

impl<'o> VisitMut<'o> for UnwrapBindable<'_, '_, 'o> {
    fn visit_assignment_pattern(&mut self, it: &mut AssignmentPattern<'o>) {
        if let Some(("$bindable", argument)) = self.0.res.rune(it.right.get_inner_expression()) {
            let argument = argument.map(|a| a.clone_in_with_semantic_ids(self.0.b.allocator()));
            it.right = argument.unwrap_or_else(|| self.0.b.void0());
        }
        walk_mut::walk_assignment_pattern(self, it);
    }

    fn visit_expression(&mut self, it: &mut Expression<'o>) {
        self.0.visit_expression(it);
    }
}

/// Upstream client `VariableDeclaration`, `$props` branch: only props that need a source get a
/// declaration (`$.prop(…)`); the rest are read as `$$props.x`, and a rest pattern is
/// `$.rest_props` without the names declared before it.
pub(super) fn lower_client_props<'o>(
    rw: &mut ScriptRewrite<'_, 'o>,
    pattern: &BindingPattern<'_>,
    out: &mut Vec<VariableDeclarator<'o>>,
    hoisted: &mut Vec<Statement<'o>>,
    names: &Names,
) {
    let (b, res) = (rw.b, rw.res);
    let mut seen: Vec<String> = ["$$slots", "$$events", "$$legacy"]
        .map(str::to_owned)
        .to_vec();
    if rw.accessors {
        seen.push("$$host".to_owned());
    }
    let mut rest_props = |target: &str, seen: &[String]| {
        let exclude = names.unique("rest_excludes");
        let set = b.new_(b.id("Set"), [b.array(seen.iter().map(|n| b.string(n)))]);
        hoisted.push(b.var(&exclude, set));
        let call = b.runtime("rest_props", [b.id("$$props"), b.id(&exclude)]);
        b.declarator(b.binding(target), Some(call))
    };
    let BindingPattern::ObjectPattern(object) = pattern else {
        let name = pattern
            .get_binding_identifier()
            .expect("validation refuses a `$props()` pattern of another shape");
        out.push(rest_props(&name.name, &seen));
        return;
    };
    for property in &object.properties {
        let key_name = prop_alias(&property.key);
        // Upstream excludes a number key as a number, which a rest object's string keys never
        // match.
        seen.push(key_name.clone().into_owned());
        let local = match &property.value {
            BindingPattern::AssignmentPattern(assignment) => &assignment.left,
            value => value,
        };
        let Some(local) = local.get_binding_identifier() else {
            continue;
        };
        let Some(symbol) = local.symbol_id.get() else {
            continue;
        };
        if !is_prop_source(res, rw.accessors, symbol) {
            continue;
        }
        let info = res.binding(symbol);
        let mut flags = 1 | 2; // PROPS_IS_IMMUTABLE | PROPS_IS_RUNES
        if info.kind == BindingKind::BindableProperty {
            flags |= 8;
        }
        if rw.accessors || res.reassigned(symbol) || res.mutations(symbol) > 0 {
            flags |= 4; // PROPS_IS_UPDATED
        }
        // Upstream passes the key's own value, which reads the same prop.
        let key_argument = match &property.key {
            PropertyKey::NumericLiteral(literal) => b.number(literal.value),
            _ => b.string(&key_name),
        };
        let initial = info.initial.map(|i| {
            let initializer = rw.expression(i);
            if info.kind == BindingKind::BindableProperty && should_proxy_read(res, i) {
                b.runtime("proxy", [initializer])
            } else {
                initializer
            }
        });
        let argument = initial.map(|initializer| {
            if is_simple_expression(&initializer) {
                return initializer;
            }
            flags |= 16; // PROPS_IS_LAZY_INITIAL
            match initializer {
                Expression::CallExpression(call)
                    if call.arguments.is_empty()
                        && matches!(call.callee, Expression::Identifier(_)) =>
                {
                    call.unbox().callee
                }
                initializer => b.arrow(b.parameters([]), initializer),
            }
        });
        let mut arguments = vec![b.id("$$props"), key_argument, b.number(f64::from(flags))];
        arguments.extend(argument);
        let mut declarator = b.declarator(
            b.binding_at(&local.name, local.span),
            Some(b.runtime("prop", arguments)),
        );
        declarator.span = oxc_span::GetSpan::span(property);
        out.push(declarator);
    }
    if let Some(rest) = &object.rest {
        let name = rest
            .argument
            .get_binding_identifier()
            .expect("validation refuses a nested `$props()` rest");
        out.push(rest_props(&name.name, &seen));
    }
}
