use std::borrow::Cow;

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{Expression, ObjectPropertyKind, PropertyKind, Statement};
use oxc_semantic::SymbolId;
use rsvelte_typescript_tree::Tree;
use rustc_hash::{FxHashMap, FxHashSet};

use super::ClientCompilationContext;
use crate::lower::BindingKind;
use crate::lower::builder::Runtime;
use crate::lower::custom_element::{CustomElement, Shadow, Tag, option_property};
use crate::lower::javascript::prop_alias;
use crate::lower::slot_element::slot_names;

impl<'o> ClientCompilationContext<'_, 'o> {
    /// The props the instance declares, in declaration order.
    fn props(&self) -> impl Iterator<Item = SymbolId> {
        let res = self.res;
        res.scoping().symbol_ids().filter(move |&symbol| {
            matches!(
                res.binding(symbol).kind,
                BindingKind::Property | BindingKind::BindableProperty
            )
        })
    }

    pub(super) fn custom_element_exports(&self) -> Vec<ObjectPropertyKind<'o>> {
        if self.custom_element.is_none() {
            return Vec::new();
        }
        let b = self.b;
        let mut properties = Vec::new();
        for symbol in self.props() {
            let binding = self.res.binding(symbol);
            let name = self.res.scoping().symbol_name(symbol);
            if name.starts_with("$$") {
                continue;
            }
            let key = prop_alias(binding.prop_key.expect("a property key"));
            let read = b.return_(Some(b.call(b.id(name), [])));
            properties.push(b.accessor(PropertyKind::Get, &key, b.parameters([]), [read]));
            let parameter = binding.initial.map_or_else(
                || b.parameter(b.binding("$$value")),
                |initial| b.default_parameter("$$value", initial.clone_in(b.allocator())),
            );
            let call = b.statement(b.call(b.id(name), [b.id("$$value")]));
            let flush = b.statement(b.runtime("flush", []));
            properties.push(b.accessor(
                PropertyKind::Set,
                &key,
                b.formal_parameters([parameter]),
                [call, flush],
            ));
        }
        properties
    }

    pub(super) fn custom_element_registration(
        &mut self,
        exports: &[crate::lower::script::Export<'_>],
    ) -> Option<Statement<'o>> {
        let b = self.b;
        let ce = self.custom_element.take()?;
        let javascript = self.javascript;
        let verbatim = |e: &Expression<'_>| e.clone_in(b.allocator());
        let props = b.object(self.custom_element_properties(ce.option(javascript, "props")));
        let names = slot_names(self.compiler_syntax_tree, self.source_text);
        let slots = b.array(names.into_iter().map(|name| b.string(name)));
        let accessors = b.array(exports.iter().map(|export| b.string(export.alias)));
        let shadow = match &ce.shadow {
            Shadow::Open => Some(b.object([b.init("mode", b.string("open"))])),
            Shadow::None => None,
            Shadow::Expression => Some(verbatim(validated_option(ce, javascript, "shadow"))),
        };
        let extend = ce.option(javascript, "extend").map(verbatim);
        let create = b.runtime_some(
            "create_custom_element",
            vec![
                Some(b.id(&self.component_name)),
                Some(props),
                Some(slots),
                Some(accessors),
                shadow,
                extend,
            ],
        );
        let call = match &ce.tag {
            Some(tag) => {
                let tag = match tag {
                    Tag::Static(value) => b.string(value),
                    Tag::Expression => verbatim(validated_option(ce, javascript, "tag")),
                };
                b.call(b.member(b.id("customElements"), "define"), [tag, create])
            }
            None => create,
        };
        Some(b.statement(call))
    }

    fn custom_element_properties(
        &self,
        configured: Option<&Expression<'_>>,
    ) -> Vec<ObjectPropertyKind<'o>> {
        let b = self.b;
        let scoping = self.res.scoping();
        let mut result = Vec::new();
        let mut definitions = FxHashMap::default();
        let mut names = Vec::new();
        if let Some(configured) = configured {
            let Expression::ObjectExpression(object) = configured else {
                unreachable!("validated custom element properties")
            };
            for property in &object.properties {
                let (name, value) = option_property(property).expect("a validated property");
                if definitions.insert(name, value).is_none() {
                    names.push(name);
                }
            }
        }
        let mut configured_names = FxHashSet::default();
        for name in names {
            configured_names.insert(name);
            let mut attribute = None;
            let mut reflect = None;
            let mut property_type = None;
            let Expression::ObjectExpression(fields) = definitions[name] else {
                unreachable!("a validated property definition")
            };
            for field in &fields.properties {
                let (key, value) = option_property(field).expect("a validated field");
                match key {
                    "attribute" => attribute = Some(value),
                    "reflect" => reflect = Some(value),
                    "type" => property_type = Some(value),
                    _ => unreachable!("a validated property field"),
                }
            }
            let info = scoping
                .get_binding(self.res.instance_scope(), name.into())
                .map(|symbol| self.res.binding(symbol));
            let key = info
                .and_then(|info| info.prop_key)
                .map_or(Cow::Borrowed(name), prop_alias);
            let mut fields = Vec::with_capacity(3);
            if let Some(attribute) = attribute
                .filter(|e| !matches!(e, Expression::StringLiteral(s) if s.value.is_empty()))
            {
                fields.push(b.init("attribute", attribute.clone_in(b.allocator())));
            }
            if reflect.is_some_and(|e| matches!(e, Expression::BooleanLiteral(l) if l.value)) {
                fields.push(b.init("reflect", b.boolean(true)));
            }
            let property_type = property_type
                .map(|e| e.clone_in(b.allocator()))
                .or_else(|| {
                    info.and_then(|i| i.initial)
                        .filter(|e| matches!(e, Expression::BooleanLiteral(_)))
                        .map(|_| b.string("Boolean"))
                });
            if let Some(property_type) = property_type {
                fields.push(b.init("type", property_type));
            }
            result.push(b.init(&key, b.object(fields)));
        }
        for symbol in self.props() {
            let key = prop_alias(self.res.binding(symbol).prop_key.expect("a property key"));
            if configured_names.contains(&*key) {
                continue;
            }
            result.push(b.init(&key, b.object([])));
        }
        result
    }
}

/// An option that `parse` found, as the shadow or the tag it read from it says.
fn validated_option<'t>(ce: &CustomElement, tree: &'t Tree, name: &str) -> &'t Expression<'t> {
    ce.option(tree, name)
        .expect("a validated custom element option")
}
