use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{BinaryOperator, Expression, LogicalOperator, VariableDeclarationKind};
use rsvelte_svelte_semantic::evaluate::Evaluator;

use crate::lower::client::{
    Attribute, AttributeValue, ClientCompilationContext, Element, Frag, Lists, is_directive,
    normalize_attribute, synthetic_value,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The tail of upstream `RegularElement` for `<option>` and `<select>`: the value goes to the
    /// hidden `__value` once the children exist, then a `<select>` picks its option.
    pub(super) fn select_value(
        &mut self,
        el: &Element,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        frag: &mut Frag<'o>,
        l: &mut Lists<'o>,
    ) {
        let b = self.b;
        if !matches!(tag, "option" | "select") {
            return;
        }
        let source_text = self.source_text;
        let value_attribute = attributes
            .iter()
            .find(|a| !is_directive(&a.value) && a.name.text(source_text) == "value");
        if let Some(e) = synthetic_value(self.compiler_syntax_tree, source_text, tag, el) {
            let meta = self.an.meta(e);
            let built = self.expression(e);
            let value = self.memoize(&mut frag.memo, e, built, false);
            self.special_value(tag, node, (value, meta.has_state), false, true, l);
        } else if let Some(a) = value_attribute {
            let built = self.attribute_value(a, &mut frag.memo, false);
            let dynamic = !matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_));
            self.special_value(tag, node, built, tag == "select" && dynamic, false, l);
        }
        if tag != "select" {
            return;
        }
        let default_value = attributes.iter().find(|a| {
            !is_directive(&a.value)
                && normalize_attribute(a.name.text(source_text)) == "defaultValue"
        });
        if let Some(a) = default_value {
            let (value, has_state) = self.attribute_value(a, &mut frag.memo, false);
            let s = b.stmt(b.runtime("set_default_select_value", [b.id(node), value]));
            if has_state {
                l.update.push(s);
            } else {
                l.initializer.push(s);
            }
        }
        let dynamic_value = value_attribute.is_some_and(|a| {
            !matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_))
        });
        let bound = attributes.iter().any(|a| {
            matches!(a.value, AttributeValue::Bind(_)) && a.name.text(source_text) == "value"
        });
        if default_value.is_some() || dynamic_value || bound {
            l.initializer
                .push(b.stmt(b.runtime("init_select", [b.id(node)])));
        }
    }

    /// Upstream `build_element_special_value_attribute`.
    fn special_value(
        &mut self,
        tag: &str,
        node: &str,
        (value, has_state): (Expression<'o>, bool),
        select_with_value: bool,
        synthetic: bool,
        l: &mut Lists<'o>,
    ) {
        let b = self.b;
        let defined = Evaluator::in_scope(self.res, self.scope)
            .evaluate(&value)
            .is_defined;
        let build_update = |v: Expression<'o>| {
            let hidden = b.member(b.id(node), "__value");
            let second = select_with_value.then(|| v.clone_in(b.allocator()));
            let assignment = b.assign_member(hidden, v);
            let set_value = |assignment: Expression<'o>| {
                let rhs = if defined {
                    assignment
                } else {
                    b.logical(assignment, LogicalOperator::Coalesce, b.string(""))
                };
                b.assign_member(b.member(b.id(node), "value"), rhs)
            };
            let e = if let Some(v) = second {
                let select = b.runtime("select_option", [b.id(node), v]);
                b.sequence([set_value(assignment), select])
            } else if synthetic {
                assignment
            } else {
                set_value(assignment)
            };
            b.stmt(e)
        };
        if has_state {
            let identifier = self.names.generate(&format!("{node}_value"));
            let initializer = (tag == "option").then(|| b.object([]));
            l.initializer
                .push(b.declare(VariableDeclarationKind::Var, &identifier, initializer));
            let test = b.binary(
                b.id(&identifier),
                BinaryOperator::StrictInequality,
                b.assign_name(&identifier, value),
            );
            let update = build_update(b.id(&identifier));
            l.update.push(b.if_(test, b.block([update]), None));
        } else {
            l.initializer.push(build_update(value));
        }
    }
}
