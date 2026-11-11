use super::{
    BindingType, Cg, Cid, DirectiveName, Exp, Expression, ExpressionIdentifier, Helper, Lit,
    NOT_CONSTANT, Nid, Node, Property, PropertyIdentifier, PropertyKind, R, Transform, Unsupported,
    camelize, collect_identifiers, is_keyboard_event, resolve_modifiers, to_handler_key,
};
use crate::compile::document_span;

impl Transform<'_> {
    /// The directive transforms `buildProps` runs: the property, and the runtime directive.
    pub(super) fn directive_transform(
        &mut self,
        dir: DirectiveName,
        arg: String,
        raw: Option<ExpressionIdentifier>,
        exp: Option<Exp>,
        identifier: PropertyIdentifier,
        model_runtime: Option<Helper>,
    ) -> R<(String, Cid, Option<Cid>)> {
        let value = || raw.expect("only v-else has no value, and it is removed");
        Ok(match dir {
            DirectiveName::Bind => {
                let exp = exp.expect("transformExpression processed it");
                (arg, self.cgn(Cg::Exp(exp)), None)
            }
            DirectiveName::On => {
                let PropertyKind::Directive(d) = &self.compiler_syntax_tree.props[identifier].kind
                else {
                    unreachable!("v-on is a directive")
                };
                let modifiers: Vec<&str> = d
                    .modifiers
                    .iter()
                    .map(|m| m.text(self.source_text))
                    .collect();
                let (key, handler) = self.transform_on(&arg, value(), &modifiers)?;
                (key, handler, None)
            }
            DirectiveName::Model => {
                let exp = exp.expect("transformExpression processed it");
                let runtime = model_runtime.expect("an element v-model has a runtime");
                let (update, arguments) =
                    self.transform_model(value(), exp, identifier, runtime)?;
                ("onUpdate:modelValue".to_owned(), update, Some(arguments))
            }
            _ => unreachable!("structural directives are removed"),
        })
    }

    /// compiler-dom `transformModel`'s choice of runtime directive for an element's `v-model`,
    /// refusing what upstream reports as an error or the port does not compile; `None` without a
    /// `v-model`.
    pub(super) fn model_runtime(&self, n: Nid) -> R<Option<Helper>> {
        let Node::Element { tag, props, .. } = &self.tree[n] else {
            return Ok(None);
        };
        let Some(identifier) = props.iter().find_map(|p| match p {
            Property::Dir {
                name: DirectiveName::Model,
                identifier,
                ..
            } => Some(*identifier),
            _ => None,
        }) else {
            return Ok(None);
        };
        let span = self.compiler_syntax_tree.props[identifier].span;
        let PropertyKind::Directive(d) = &self.compiler_syntax_tree.props[identifier].kind else {
            unreachable!("v-model is a directive")
        };
        if d.arg.is_some() {
            return Err(Unsupported::at("a v-model argument on an element", span));
        }
        // `checkDuplicatedValue`: only the first `v-bind` is looked at.
        let duplicated_value = || {
            props.iter().find_map(|p| match p {
                Property::Dir {
                    name: DirectiveName::Bind,
                    arg,
                    ..
                } => Some(arg == "value"),
                _ => None,
            }) == Some(true)
        };
        let runtime = match tag.as_str() {
            "input" => {
                // `findProp(node, 'type')`: a static `type` with a value, or a bound one.
                let ty = props.iter().find_map(|p| match p {
                    Property::Static {
                        name,
                        value: Some(v),
                    } if name == "type" => Some(Some(v.as_str())),
                    Property::Dir {
                        name: DirectiveName::Bind,
                        arg,
                        ..
                    } if arg == "type" => Some(None),
                    _ => None,
                });
                match ty {
                    Some(None) => {
                        return Err(Unsupported::at("v-model with a bound `type`", span));
                    }
                    Some(Some("radio")) => Helper::VModelRadio,
                    Some(Some("checkbox")) => Helper::VModelCheckbox,
                    Some(Some("file")) => {
                        return Err(Unsupported::at("v-model on a file input", span));
                    }
                    _ if duplicated_value() => {
                        return Err(Unsupported::at("v-model with a bound `value`", span));
                    }
                    _ => Helper::VModelText,
                }
            }
            "select" => Helper::VModelSelect,
            "textarea" if duplicated_value() => {
                return Err(Unsupported::at("v-model with a bound `value`", span));
            }
            "textarea" => Helper::VModelText,
            _ => return Err(Unsupported::at("v-model on this element", span)),
        };
        Ok(Some(runtime))
    }

    /// compiler-core `transformModel` for an element, with compiler-dom's: the update handler
    /// (cached unless it reads a `v-for` alias) and the directive's `withDirectives` entry
    /// (`buildDirectiveArgs`). The target is a ref or a member expression.
    pub(super) fn transform_model(
        &mut self,
        raw: ExpressionIdentifier,
        exp: Exp,
        identifier: PropertyIdentifier,
        runtime: Helper,
    ) -> R<(Cid, Cid)> {
        let expression = self.javascript.get_expression(raw);
        let source_location = document_span(oxc_span::GetSpan::span(expression));
        let is_ref = match expression {
            Expression::Identifier(identifier) => {
                let name = identifier.name.as_str();
                let local = self.reference(identifier.reference_id(), name, false).local;
                if local || self.binding_type(name) != Some(BindingType::SetupRef) {
                    return Err(Unsupported::at(
                        "a v-model target that is not a ref or a member expression",
                        source_location,
                    ));
                }
                true
            }
            e if e.as_member_expression().is_some_and(|m| !m.optional()) => false,
            _ => {
                return Err(Unsupported::at(
                    "a v-model target that is not a ref or a member expression",
                    source_location,
                ));
            }
        };
        let update = self.cgn(Cg::ModelUpdate {
            target: exp,
            is_ref,
        });
        let update = if self.has_scope_ref(raw) {
            update
        } else {
            self.cache(update)
        };
        self.helper(runtime);
        let PropertyKind::Directive(d) = &self.compiler_syntax_tree.props[identifier].kind else {
            unreachable!("v-model is a directive")
        };
        let modifiers: Vec<String> = d
            .modifiers
            .iter()
            .map(|m| m.text(self.source_text).to_owned())
            .collect();
        let mut arguments = vec![self.cgn(Cg::Helper(runtime)), self.cgn(Cg::Exp(exp))];
        if !modifiers.is_empty() {
            arguments.push(self.lit(Lit::Undefined, NOT_CONSTANT));
            let props = modifiers
                .into_iter()
                .map(|m| (m, self.lit(Lit::Boolean(true), NOT_CONSTANT)))
                .collect();
            arguments.push(self.cgn(Cg::Object(props)));
        }
        Ok((update, self.cgn(Cg::Array(arguments))))
    }

    /// `transformOn`, with `cacheHandlers`, and compiler-dom's augmentor for the modifiers, which
    /// runs before the handler is cached.
    pub(super) fn transform_on(
        &mut self,
        arg: &str,
        raw: ExpressionIdentifier,
        modifiers: &[&str],
    ) -> R<(String, Cid)> {
        let mut key = to_handler_key(&camelize(arg));
        let expression = self.javascript.get_expression(raw);
        // compiler-core `isMemberExpressionNode`, which counts an optional member too.
        let is_member = match rsvelte_vue_semantic::resolve::unwrap_typescript(expression) {
            Expression::Identifier(identifier) => identifier.name != "undefined",
            Expression::ChainExpression(chain) => chain.expression.is_member_expression(),
            e => e.is_member_expression(),
        };
        let is_fn = matches!(
            expression,
            Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_)
        );
        let inline = !(is_member || is_fn);
        let exp = self.process_expression(raw, inline)?;
        let runtime_constant = !exp.compound && exp.const_type > 0;
        let should_cache = !runtime_constant && !self.has_scope_ref(raw);
        let mut value = if inline || (should_cache && is_member) {
            self.cgn(Cg::Handler { exp, inline })
        } else {
            self.cgn(Cg::Exp(exp))
        };
        if !modifiers.is_empty() {
            let (keys, non_keys, options) = resolve_modifiers(&key, modifiers);
            if non_keys.contains(&"right") && key.eq_ignore_ascii_case("onclick") {
                "onContextmenu".clone_into(&mut key);
            }
            if non_keys.contains(&"middle") && key.eq_ignore_ascii_case("onclick") {
                "onMouseup".clone_into(&mut key);
            }
            let list = |t: &mut Self, mods: &[&str]| {
                let items = mods
                    .iter()
                    .map(|m| t.lit(Lit::String((*m).to_owned()), NOT_CONSTANT))
                    .collect();
                t.cgn(Cg::Array(items))
            };
            if !non_keys.is_empty() {
                self.helper(Helper::WithModifiers);
                let mods = list(self, &non_keys);
                value = self.cgn(Cg::Call {
                    callee: Helper::WithModifiers,
                    arguments: vec![value, mods],
                });
            }
            if !keys.is_empty() && is_keyboard_event(&key.to_ascii_lowercase()) {
                self.helper(Helper::WithKeys);
                let mods = list(self, &keys);
                value = self.cgn(Cg::Call {
                    callee: Helper::WithKeys,
                    arguments: vec![value, mods],
                });
            }
            for m in options {
                key.push_str(&m[..1].to_ascii_uppercase());
                key.push_str(&m[1..]);
            }
        }
        let value = if should_cache {
            self.cache(value)
        } else {
            value
        };
        Ok((key, value))
    }

    /// `hasScopeRef`: the expression reads a `v-for` alias.
    pub(super) fn has_scope_ref(&self, e: ExpressionIdentifier) -> bool {
        let mut identifiers = Vec::new();
        collect_identifiers(self.javascript.get_expression(e), &mut identifiers);
        identifiers.iter().any(|identifier| {
            identifier
                .reference
                .and_then(|r| self.res.symbol_of(r))
                .is_some_and(|s| self.res.is_alias(s))
        })
    }

    pub(super) fn cache(&mut self, value: Cid) -> Cid {
        let index = self.cached;
        self.cached += 1;
        self.cgn(Cg::Cache {
            index,
            value,
            spread: false,
        })
    }
}
