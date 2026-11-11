use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKey};

use crate::lower::builder::Runtime;
use crate::lower::client::{
    Attribute, AttributeValue, ClientCompilationContext, CompilerNodeIdentifier, Lists, Memo, R,
    event_attribute, is_behaviour, is_directive, normalize_attribute,
};

impl<'o> ClientCompilationContext<'_, 'o> {
    /// Upstream `build_attribute_effect`: every attribute and spread, in order, as one object the
    /// runtime diffs, with its own memoized values.
    pub(in crate::lower::client) fn attribute_effect(
        &self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        remove_defaults: bool,
        l: &mut Lists<'o>,
    ) -> R<()> {
        let b = self.b;
        let mut memo = Memo::default();
        let mut values = Vec::with_capacity(attributes.len());
        let mut class_directives = Vec::new();
        let mut style_directives = Vec::new();
        let is = self.template_is(identifier, attributes);
        for a in attributes {
            if is.is_some_and(|is| std::ptr::eq(is, a)) {
                continue;
            }
            match a.value {
                _ if is_behaviour(&a.value) => continue,
                AttributeValue::Bind(_) => continue,
                AttributeValue::Class(_) => {
                    class_directives.push(a);
                    continue;
                }
                AttributeValue::Style { .. } => {
                    style_directives.push(a);
                    continue;
                }
                AttributeValue::Spread(e) => {
                    let built = self.expression(e);
                    let v = self.memoize(&mut memo, e, built, false);
                    values.push(b.spread_property(v));
                    continue;
                }
                _ => {}
            }
            let (value, _) = self.attribute_value(a, &mut memo, false);
            let raw_name = a.name.text(self.source_text);
            if event_attribute(self.source_text, a).is_some()
                && matches!(
                    value,
                    Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_)
                )
            {
                // A stable handler, so the runtime does not remove and re-add it on every update.
                let handler = self.names.generate("event_handler");
                l.initializer.push(b.var(&handler, value));
                values.push(b.init(raw_name, b.id(&handler)));
            } else {
                let name = if tag == "select" && normalize_attribute(raw_name) == "defaultValue" {
                    "defaultValue"
                } else {
                    raw_name
                };
                values.push(b.init(name, value));
            }
        }
        self.synthetic_attributes(
            identifier,
            attributes,
            &class_directives,
            &style_directives,
            &mut values,
        );
        if !class_directives.is_empty() {
            let props: Vec<_> = class_directives
                .iter()
                .map(|d| {
                    let AttributeValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let built = self.expression(e);
                    let v = self.memoize(&mut memo, e, built, false);
                    b.init(d.name.text(self.source_text), v)
                })
                .collect();
            let key = PropertyKey::from(b.member(b.id("$"), "CLASS"));
            values.push(b.property(key, b.object(props), true));
        }
        if !style_directives.is_empty() {
            let (object, _) = self.style_directives(&style_directives, &mut memo)?;
            let key = PropertyKey::from(b.member(b.id("$"), "STYLE"));
            values.push(b.property(key, object, true));
        }
        let object = b.object(values);
        let (parameters, sync) = memo.into_effect(b);
        let arrow = b.arrow(parameters, object);
        let hash = self.an.scoped[identifier]
            .then_some(self.identity.stylesheet_hash.as_deref())
            .flatten()
            .map(|h| b.string(h));
        let remove = remove_defaults.then(|| b.boolean(true));
        let call = b.runtime_some(
            "attribute_effect",
            vec![
                Some(b.id(node)),
                Some(arrow),
                sync,
                None,
                None,
                hash,
                remove,
            ],
        );
        l.initializer.push(b.stmt(call));
        Ok(())
    }

    /// Upstream's analysis gives an element without a spread an empty `class` when it is scoped
    /// or has class directives, and an empty `style` when it has style directives.
    fn synthetic_attributes(
        &self,
        identifier: CompilerNodeIdentifier,
        attributes: &[Attribute],
        class_directives: &[&Attribute],
        style_directives: &[&Attribute],
        values: &mut Vec<ObjectPropertyKind<'o>>,
    ) {
        let b = self.b;
        if attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)))
        {
            return;
        }
        let has = |name: &str| {
            attributes.iter().any(|a| {
                !is_directive(&a.value) && a.name.text(self.source_text).eq_ignore_ascii_case(name)
            })
        };
        if !has("class") && (self.an.scoped[identifier] || !class_directives.is_empty()) {
            values.push(b.init("class", b.string("")));
        }
        if !has("style") && !style_directives.is_empty() {
            values.push(b.init("style", b.string("")));
        }
    }
}
