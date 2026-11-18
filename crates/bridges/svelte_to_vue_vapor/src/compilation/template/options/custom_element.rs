use oxc_ast::ast::{Expression, ObjectPropertyKind};
use rsvelte_svelte_semantic::resolve::BindingKind;
use rustc_hash::FxHashSet;

use super::super::{CustomElementValues, Template};
use super::{CustomElement, key_name, option};
use crate::compilation::string_key;

impl<'t> Template<'_, '_, 't> {
    /// The options the emitter reads, their expressions copied into the component's tree.
    pub(in super::super) fn custom_element_values(
        &mut self,
        options: &CustomElement,
    ) -> CustomElementValues {
        let mut values = CustomElementValues {
            tag: options.tag.clone(),
            shadow_root: options.shadow_root,
            shadow: None,
            props: None,
            extend: None,
        };
        let Some(expression) = options.options else {
            return values;
        };
        let Expression::ObjectExpression(object) = self.source(expression).get_inner_expression()
        else {
            unreachable!("checked custom element options")
        };
        if let Some(shadow) = option(object, "shadow")
            && matches!(
                shadow.get_inner_expression(),
                Expression::ObjectExpression(_)
            )
        {
            let value = self.verbatim(shadow);
            values.shadow = Some(self.keep(value));
        }
        if let Some(extend) = option(object, "extend") {
            let value = self.verbatim(extend);
            values.extend = Some(self.keep(value));
        }
        if let Some(Expression::ObjectExpression(props)) =
            option(object, "props").map(Expression::get_inner_expression)
        {
            let value = self.properties(props);
            values.props = Some(self.keep(value));
        }
        values
    }

    /// `e` copied as written, without its types.
    fn verbatim(&self, e: &Expression<'_>) -> Expression<'t> {
        let mut value =
            oxc_allocator::CloneIn::clone_in(e, oxc_allocator::GetAllocator::allocator(self.b));
        oxc_ast_visit::VisitMut::visit_expression(
            &mut rsvelte_typescript_compile::strip::Strip::new(
                oxc_allocator::GetAllocator::allocator(self.b),
            ),
            &mut value,
        );
        value
    }

    /// The `props` option, keyed by each prop's key, a boolean default's `type` inferred, and an
    /// empty definition for each prop it leaves out.
    fn properties(&self, options: &oxc_ast::ast::ObjectExpression<'_>) -> Expression<'t> {
        let (b, res) = (self.b, self.i.resolution);
        let scoping = res.scoping();
        let props: Vec<_> = scoping
            .symbol_ids()
            .filter(|&s| {
                matches!(
                    res.binding(s).kind,
                    BindingKind::Property | BindingKind::BindableProperty
                )
            })
            .collect();
        let mut names = FxHashSet::default();
        let mut out = Vec::new();
        for property in &options.properties {
            let ObjectPropertyKind::ObjectProperty(p) = property else {
                unreachable!("checked custom element prop")
            };
            let name = key_name(&p.key).expect("checked custom element prop");
            let binding = props
                .iter()
                .find(|&&s| scoping.symbol_name(s) == name)
                .map(|&s| res.binding(s));
            names.insert(name.to_owned());
            let key = binding
                .and_then(|binding| binding.prop_key)
                .and_then(|key| key.static_name()?.into_cow_str())
                .map_or_else(|| name.to_owned(), std::borrow::Cow::into_owned);
            let Expression::ObjectExpression(definitions) = p.value.get_inner_expression() else {
                unreachable!("checked custom element prop options")
            };
            let mut inferred = binding
                .and_then(|binding| binding.initial)
                .is_some_and(|initial| matches!(initial, Expression::BooleanLiteral(_)));
            let mut fields = Vec::with_capacity(definitions.properties.len() + 1);
            for definition in &definitions.properties {
                let ObjectPropertyKind::ObjectProperty(d) = definition else {
                    unreachable!("checked custom element prop option")
                };
                inferred &= key_name(&d.key) != Some("type");
                fields.push(oxc_allocator::CloneIn::clone_in(
                    definition,
                    oxc_allocator::GetAllocator::allocator(b),
                ));
            }
            if inferred {
                fields.push(b.init("type", b.string("Boolean")));
            }
            out.push(b.property(string_key(b, &key), b.object(fields), false));
        }
        for &symbol in &props {
            let Some(key) = res
                .binding(symbol)
                .prop_key
                .and_then(|k| k.static_name()?.into_cow_str())
            else {
                continue;
            };
            if names.contains(&*key) {
                continue;
            }
            out.push(b.property(string_key(b, &key), b.object([]), false));
        }
        b.object(out)
    }
}
