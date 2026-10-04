use rsvelte_typescript::copy::Verbatim;
use rustc_hash::{FxHashMap, FxHashSet};

use super::{
    ClientCompilationContext, Kind, NodeIdentifier, SourceLocation, copy, flag, init_property,
    runtime_call,
};
use crate::lower::BindingKind;
use crate::lower::custom_element::{Shadow, Tag, option_property};

impl ClientCompilationContext<'_> {
    pub(super) fn custom_element_stylesheet(
        &mut self,
        stylesheet: Option<&str>,
    ) -> Option<NodeIdentifier> {
        self.custom_element?;
        let stylesheet = stylesheet?;
        let hash = self.out.write_string(Self::stylesheet_hash(self.identity));
        let hash = init_property(&mut self.out, "hash", hash);
        let code = self.out.write_string(stylesheet);
        let code = init_property(&mut self.out, "code", code);
        let value = self.out.object(&[hash, code], SourceLocation::SYNTHETIC);
        let name = self.out.identifier("$$css");
        Some(self.out.let_(flag::CONST, name, Some(value)))
    }

    fn stylesheet_hash(identity: &crate::OutputIdentity) -> &str {
        identity
            .stylesheet_hash
            .as_deref()
            .expect("a stylesheet hash")
    }

    pub(super) fn custom_element_exports(&mut self) -> Vec<NodeIdentifier> {
        if self.custom_element.is_none() {
            return Vec::new();
        }
        let mut properties = Vec::new();
        for (identifier, binding) in self.res.bindings.iter_enumerated() {
            if !matches!(
                binding.kind,
                BindingKind::Property | BindingKind::BindableProperty
            ) {
                continue;
            }
            let name = self
                .javascript
                .atoms
                .get(self.res.sem.bindings[identifier].name);
            if name.starts_with("$$") {
                continue;
            }
            let key = self.property_key(binding.prop_key.expect("a property key"));
            let target = self.out.identifier(name);
            let read = self.out.call0(target, &[]);
            let read = self.out.return_(Some(read), SourceLocation::SYNTHETIC);
            properties.push(self.accessor(&key, &[], &[read], flag::GETTER));
            let value = self.out.identifier("$$value");
            let parameter = if let Some(initial) = binding.initial {
                let initial = copy(self.javascript, &mut self.out, &mut Verbatim, initial);
                self.out
                    .assign_pat(value, initial, SourceLocation::SYNTHETIC)
            } else {
                value
            };
            let call = self.out.call0(target, &[value]);
            let call = self.out.expression_statement(call);
            let flush = self.out.runtime("$", "flush", &[]);
            let flush = self.out.expression_statement(flush);
            properties.push(self.accessor(&key, &[parameter], &[call, flush], flag::SETTER));
        }
        properties
    }

    fn accessor(
        &mut self,
        key: &str,
        parameters: &[NodeIdentifier],
        body: &[NodeIdentifier],
        flags: u8,
    ) -> NodeIdentifier {
        let body = self.out.block(body, SourceLocation::SYNTHETIC);
        let function = self.out.function(
            false,
            None,
            parameters,
            body,
            false,
            SourceLocation::SYNTHETIC,
        );
        let property = init_property(&mut self.out, key, function);
        let Kind::Property {
            key,
            value,
            computed,
            ..
        } = self.out.kind(property)
        else {
            unreachable!("a property")
        };
        self.out.property(
            key,
            value,
            flags | if computed { flag::COMPUTED } else { 0 },
            SourceLocation::SYNTHETIC,
        )
    }

    fn property_key(&self, key: NodeIdentifier) -> String {
        if self.javascript.is_identifier(key) {
            self.javascript.name(key).to_owned()
        } else {
            self.javascript.str_value(key, self.source_text).to_owned()
        }
    }

    pub(super) fn custom_element_registration(&mut self) -> Option<NodeIdentifier> {
        let ce = self.custom_element.take()?;
        let props = self.custom_element_properties(ce.props);
        let props = self.out.object(&props, SourceLocation::SYNTHETIC);
        let slots = self.out.array(&[], SourceLocation::SYNTHETIC);
        let accessors = self.out.array(&[], SourceLocation::SYNTHETIC);
        let shadow = match &ce.shadow {
            Shadow::Open => {
                let mode = self.out.write_string("open");
                let mode = init_property(&mut self.out, "mode", mode);
                Some(self.out.object(&[mode], SourceLocation::SYNTHETIC))
            }
            Shadow::None => None,
            Shadow::Expression(expression) => Some(copy(
                self.javascript,
                &mut self.out,
                &mut Verbatim,
                *expression,
            )),
        };
        let extend = ce
            .extend
            .map(|e| copy(self.javascript, &mut self.out, &mut Verbatim, e));
        let name = self.out.identifier(&self.component_name);
        let create = runtime_call(
            &mut self.out,
            "create_custom_element",
            vec![
                Some(name),
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
                    Tag::Static(value) => self.out.write_string(value),
                    Tag::Expression(e) => copy(self.javascript, &mut self.out, &mut Verbatim, *e),
                };
                let registry = self.out.identifier("customElements");
                let define = self.out.dot(registry, "define");
                self.out.call0(define, &[tag, create])
            }
            None => create,
        };
        Some(self.out.expression_statement(call))
    }

    fn custom_element_properties(
        &mut self,
        configured: Option<NodeIdentifier>,
    ) -> Vec<NodeIdentifier> {
        let mut result = Vec::new();
        let mut definitions = FxHashMap::default();
        let mut names = Vec::new();
        if let Some(configured) = configured {
            let Kind::Object(properties) = self.javascript.kind(configured) else {
                unreachable!("validated custom element properties")
            };
            for &property in properties {
                let (name, value) =
                    option_property(self.javascript, property).expect("a validated property");
                if definitions.insert(name, value).is_none() {
                    names.push(name);
                }
            }
        }
        let bindings = (!names.is_empty()).then(|| {
            self.res
                .sem
                .bindings
                .iter_enumerated()
                .filter(|(_, binding)| {
                    binding.scope == rsvelte_typescript::scope::ScopeIdentifier::ROOT
                })
                .map(|(id, binding)| (self.javascript.atoms.get(binding.name), id))
                .collect::<FxHashMap<_, _>>()
        });
        let mut configured_names = FxHashSet::default();
        for name in names {
            configured_names.insert(name);
            let mut attribute = None;
            let mut reflect = None;
            let mut property_type = None;
            let Kind::Object(fields) = self.javascript.kind(definitions[name]) else {
                unreachable!("a validated property definition")
            };
            for &field in fields {
                let (key, value) =
                    option_property(self.javascript, field).expect("a validated field");
                match key {
                    "attribute" => attribute = Some(value),
                    "reflect" => reflect = Some(value),
                    "type" => property_type = Some(value),
                    _ => unreachable!("a validated property field"),
                }
            }
            let info = bindings
                .as_ref()
                .and_then(|bindings| bindings.get(name))
                .map(|&id| self.res.bindings[id]);
            let key = info
                .and_then(|info| info.prop_key)
                .map_or_else(|| name.to_owned(), |key| self.property_key(key));
            let mut fields = Vec::with_capacity(3);
            if let Some(attribute) =
                attribute.filter(|&e| !self.javascript.str_value(e, self.source_text).is_empty())
            {
                let value = copy(self.javascript, &mut self.out, &mut Verbatim, attribute);
                fields.push(init_property(&mut self.out, "attribute", value));
            }
            if reflect.is_some_and(|e| matches!(self.javascript.kind(e), Kind::Boolean(true))) {
                let value = self.tru();
                fields.push(init_property(&mut self.out, "reflect", value));
            }
            let property_type = property_type
                .map(|e| copy(self.javascript, &mut self.out, &mut Verbatim, e))
                .or_else(|| {
                    info.and_then(|i| i.initial)
                        .filter(|&e| matches!(self.javascript.kind(e), Kind::Boolean(_)))
                        .map(|_| self.out.write_string("Boolean"))
                });
            if let Some(property_type) = property_type {
                fields.push(init_property(&mut self.out, "type", property_type));
            }
            let value = self.out.object(&fields, SourceLocation::SYNTHETIC);
            result.push(init_property(&mut self.out, &key, value));
        }
        for binding in &self.res.bindings {
            if !matches!(
                binding.kind,
                BindingKind::Property | BindingKind::BindableProperty
            ) {
                continue;
            }
            let key = self.property_key(binding.prop_key.expect("a property key"));
            if configured_names.contains(key.as_str()) {
                continue;
            }
            let value = self.out.object(&[], SourceLocation::SYNTHETIC);
            result.push(init_property(&mut self.out, &key, value));
        }
        result
    }
}
