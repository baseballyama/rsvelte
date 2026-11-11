use oxc_ast::ast::Expression;
use rsvelte_svelte_semantic::compiler_syntax_tree::{Modifiers, StyleValue};

use super::{Attribute, AttributeValue, Helper, R, Steps, Template, unsupported};
use crate::compilation::string_key;

impl<'t> Template<'_, '_, 't> {
    /// `style:` directives with the `style` attribute: `$$styles` after each patch (client).
    pub(super) fn styles(&mut self, attributes: &[Attribute], steps: &mut Steps<'t>) -> R<()> {
        let b = self.b;
        let mut base = b.string("");
        let declarations = self.style_declarations(attributes);
        for attribute in attributes {
            if attribute.name.text(self.i.source_text) != "style"
                || matches!(attribute.value, AttributeValue::Style { .. })
            {
                continue;
            }
            base = match &attribute.value {
                AttributeValue::Static(value) => b.string(value),
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression)) => self.template_expression(expression),
                AttributeValue::Interpolated(parts) => self.interpolated(parts),
                _ => {
                    return Err(unsupported(
                        "this style attribute beside style directives",
                        attribute.span,
                    ));
                }
            };
        }
        self.helpers.insert(Helper::Style);
        let call = self.call("$$styles", [b.id("$$el"), base, declarations]);
        steps.mounted.push(call);
        Ok(())
    }

    pub(super) fn style_value(&mut self, value: &StyleValue) -> Expression<'t> {
        match value {
            StyleValue::Empty => self.b.string(""),
            StyleValue::Static(value) => self.b.string(value),
            &(StyleValue::Expression { expression, .. } | StyleValue::Shorthand(expression)) => {
                self.template_expression(expression)
            }
            StyleValue::Interpolated(parts) => self.interpolated(parts),
        }
    }

    /// `{ name: [value, important] }` for each `style:` directive.
    pub(super) fn style_declarations(&mut self, attributes: &[Attribute]) -> Expression<'t> {
        let b = self.b;
        let mut declarations = Vec::new();
        for attribute in attributes {
            if let AttributeValue::Style { value, modifiers } = &attribute.value {
                let value = self.style_value(value);
                let important = b.boolean(modifiers.contains(Modifiers::IMPORTANT));
                let name = attribute.name.text(self.i.source_text);
                declarations.push(b.property(
                    string_key(b, name),
                    b.array([value, important]),
                    false,
                ));
            }
        }
        self.helpers.insert(Helper::Style);
        b.object(declarations)
    }
}
