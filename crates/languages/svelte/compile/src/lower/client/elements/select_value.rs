use crate::lower::client::{
    AssignmentOperator, Attribute, AttributeValue, BinaryOperator, ClientCompilationContext,
    Element, Frag, Lists, LogicalOperator, NodeIdentifier, SourceLocation, flag, is_directive,
    normalize_attribute, synthetic_value,
};

impl ClientCompilationContext<'_> {
    /// The tail of upstream `RegularElement` for `<option>` and `<select>`: the value goes to the
    /// hidden `__value` once the children exist, then a `<select>` picks its option.
    pub(super) fn select_value(
        &mut self,
        el: &Element,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) {
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
            let value = self.memoize(frag, built, meta);
            self.special_value(tag, node, (value, meta.has_state), false, true, l);
        } else if let Some(a) = value_attribute {
            let built = self.attribute_value(a, frag);
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
            let (value, has_state) = self.attribute_value(a, frag);
            let x = self.out.identifier(node);
            let call = self.call("set_default_select_value", vec![Some(x), Some(value)]);
            let s = self.statement(call);
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
            let x = self.out.identifier(node);
            let call = self.call("init_select", vec![Some(x)]);
            l.initializer.push(self.statement(call));
        }
    }

    /// Upstream `build_element_special_value_attribute`.
    fn special_value(
        &mut self,
        tag: &str,
        node: &str,
        (value, has_state): (NodeIdentifier, bool),
        select_with_value: bool,
        synthetic: bool,
        l: &mut Lists,
    ) {
        let defined = self
            .res
            .evaluate_output(
                self.javascript,
                self.source_text,
                &self.out,
                value,
                self.scope,
            )
            .is_defined;
        let build_update = |context: &mut Self, v: NodeIdentifier| {
            let x = context.out.identifier(node);
            let hidden = context.out.dot(x, "__value");
            let assignment = context.out.assign(
                AssignmentOperator::Assign,
                hidden,
                v,
                SourceLocation::SYNTHETIC,
            );
            let set_value = |context: &mut Self| {
                let rhs = if defined {
                    assignment
                } else {
                    let empty = context.out.write_string("");
                    context.out.logical(
                        LogicalOperator::Nullish,
                        assignment,
                        empty,
                        SourceLocation::SYNTHETIC,
                    )
                };
                let x = context.out.identifier(node);
                let target = context.out.dot(x, "value");
                context.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    rhs,
                    SourceLocation::SYNTHETIC,
                )
            };
            let e = if select_with_value {
                let set = set_value(context);
                let x = context.out.identifier(node);
                let select = context.call("select_option", vec![Some(x), Some(v)]);
                context.out.seq(&[set, select], SourceLocation::SYNTHETIC)
            } else if synthetic {
                assignment
            } else {
                set_value(context)
            };
            context.statement(e)
        };
        if has_state {
            let identifier = self.names.generate(&format!("{node}_value"));
            let initializer =
                (tag == "option").then(|| self.out.object(&[], SourceLocation::SYNTHETIC));
            let target = self.out.identifier(&identifier);
            l.initializer
                .push(self.out.let_(flag::VAR, target, initializer));
            let read = self.out.identifier(&identifier);
            let target = self.out.identifier(&identifier);
            let assign = self.out.assign(
                AssignmentOperator::Assign,
                target,
                value,
                SourceLocation::SYNTHETIC,
            );
            let test = self.out.binary(
                BinaryOperator::StrictNotEq,
                read,
                assign,
                SourceLocation::SYNTHETIC,
            );
            let v = self.out.identifier(&identifier);
            let update = build_update(self, v);
            let block = self.out.block(&[update], SourceLocation::SYNTHETIC);
            l.update
                .push(self.out.if_(test, block, None, SourceLocation::SYNTHETIC));
        } else {
            let s = build_update(self, value);
            l.initializer.push(s);
        }
    }
}
