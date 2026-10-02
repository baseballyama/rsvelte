use super::{
    AssignmentOperator, Attribute, AttributeValue, BinaryOperator, ClientCompilationContext,
    CompilerNodeIdentifier, Element, ElementKind, Frag, Item, Kind, Lists, LogicalOperator,
    NodeIdentifier, NodeKind, Prev, R, SourceLocation, check_foreign_element, event_attribute,
    flag, is_customizable_select, is_directive, is_load_error_element, normalize_attribute,
    synthetic_value, unsupported,
};

impl ClientCompilationContext<'_> {
    pub(super) fn is_static_element(&self, identifier: CompilerNodeIdentifier) -> bool {
        let NodeKind::Element(el) = &self.compiler_syntax_tree.node(identifier).kind else {
            return false;
        };
        if self.an.dynamic[identifier] {
            return false;
        }
        let tag = el.name.text(self.source_text);
        if tag.contains('-') {
            return false;
        }
        for a in self.compiler_syntax_tree.attributes(el.attributes) {
            let n = a.name.text(self.source_text);
            if event_attribute(self.source_text, a).is_some()
                || crate::lower::cannot_be_set_statically(n)
                || n == "dir"
            {
                return false;
            }
            if matches!(tag, "input" | "textarea" | "select") && matches!(n, "value" | "checked") {
                return false;
            }
            if tag == "option" && n == "value" {
                return false;
            }
            if !matches!(a.value, AttributeValue::Boolean | AttributeValue::Static(_)) {
                return false;
            }
        }
        true
    }

    /// Upstream `RegularElement`.
    pub(super) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return unsupported("components, `<slot>` and `svelte:` elements", el.name);
        }
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return unsupported(&format!("`<{tag}>`"), el.name);
        }
        if is_customizable_select(compiler_syntax_tree, self.source_text, &tag, el) {
            return unsupported(&format!("rich content in `<{tag}>`"), el.name);
        }
        check_foreign_element(self.source_text, el.name)?;
        frag.tpl.push_element(&tag);
        if tag == "noscript" {
            frag.tpl.pop_element();
            return Ok(());
        }
        frag.tpl.needs_import_node |= tag == "video";

        let attribute_list = compiler_syntax_tree.attributes(el.attributes);
        // Upstream visits directives into their own lists, which follow the children's.
        let mut directives = self.element_directives(attribute_list, &tag, node)?;
        let has_spread = attribute_list
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        // Upstream compares the name as written.
        let remove_defaults = el.name.text(self.source_text) == "input"
            && self.remove_input_defaults(attribute_list, has_spread, node, l);
        if has_spread {
            self.attribute_effect(identifier, &tag, attribute_list, node, remove_defaults, l);
        } else {
            self.element_attributes(identifier, &tag, attribute_list, node, frag, l)?;
        }
        let load_error_events = attribute_list.iter().any(|a| {
            !is_directive(&a.value) && matches!(a.name.text(self.source_text), "onload" | "onerror")
        });
        if is_load_error_element(&tag) && (has_spread || load_error_events) {
            let x = self.out.identifier(node);
            let call = self.call("replay_events", vec![Some(x)]);
            l.after.push(self.statement(call));
        }

        let mut child = self.element_children(identifier, node, frag)?;
        if self.an.dynamic[identifier] {
            l.initializer.append(&mut child.initializer);
            l.update.append(&mut child.update);
            l.after.append(&mut child.after);
        }
        l.initializer.append(&mut directives.initializer);
        l.after.append(&mut directives.after);
        if !has_spread {
            self.select_value(el, &tag, attribute_list, node, frag, l);
        }
        frag.tpl.pop_element();
        Ok(())
    }

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
    pub(super) fn special_value(
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

    /// The directives of upstream `RegularElement`'s `other_directives`, in attribute order.
    pub(super) fn element_directives(
        &mut self,
        attributes: &[Attribute],
        tag: &str,
        node: &str,
    ) -> R<Lists> {
        let mut directives = Lists::default();
        for a in attributes {
            match a.value {
                AttributeValue::Bind(_) => {
                    let call = self.binding(a, tag, attributes, node)?;
                    directives.after.push(self.statement(call));
                }
                AttributeValue::Attach(e) => {
                    let call = self.attach(e, node);
                    directives.initializer.push(self.statement(call));
                }
                _ => {}
            }
        }
        Ok(directives)
    }

    /// Upstream's `$.remove_input_defaults` condition for an `<input>`; a binding is named by its
    /// property, so `bind:value` counts as a dynamic `value`. With a spread the runtime's
    /// `attribute_effect` removes them: returns whether it must.
    pub(super) fn remove_input_defaults(
        &mut self,
        attributes: &[Attribute],
        has_spread: bool,
        node: &str,
        l: &mut Lists,
    ) -> bool {
        let source_text = self.source_text;
        let has_value = attributes.iter().any(|a| {
            matches!(a.name.text(source_text), "value" | "checked")
                && !matches!(
                    a.value,
                    AttributeValue::Static(_) | AttributeValue::Class(_)
                )
        });
        let has_default_value = attributes.iter().any(|a| {
            !is_directive(&a.value)
                && matches!(a.name.text(source_text), "defaultValue" | "defaultChecked")
        });
        if has_default_value || !(has_spread || has_value) {
            return false;
        }
        if has_spread {
            return true;
        }
        let x = self.out.identifier(node);
        let call = self.call("remove_input_defaults", vec![Some(x)]);
        l.initializer.push(self.statement(call));
        false
    }

    /// The children half of upstream `RegularElement`, under the element's whitespace rule.
    pub(super) fn element_children(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        frag: &mut Frag,
    ) -> R<Lists> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        let cleaned = self.plan.fragment(el.children);
        let items = &cleaned.items;
        let mut child = Lists::default();
        let use_text_content = items.iter().all(|i| match i {
            Item::Text { .. } => true,
            Item::Expression(e) => !self.an.meta(*e).has_state,
            Item::Node(_) => false,
        }) && items.iter().any(|i| matches!(i, Item::Expression(_)));
        if use_text_content {
            let (value, _) = self.template_chunk(items, frag);
            let empty = matches!(self.out.kind(value), Kind::String)
                && self.out.str_value(value, self.source_text).is_empty();
            if !empty {
                let x = self.out.identifier(node);
                let target = self.out.dot(x, "textContent");
                let assign = self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                );
                child.initializer.push(self.statement(assign));
            }
        } else {
            let needs_reset = items.iter().any(|i| match i {
                Item::Text { .. } => false,
                Item::Expression(_) => true,
                Item::Node(n) => !self.is_static_element(*n),
            });
            self.process_children(
                items,
                Prev::Call {
                    method: "child",
                    of: node.to_owned(),
                },
                true,
                frag,
                &mut child,
            )?;
            if needs_reset && !self.fold_reset_into_child(&mut child.initializer, node) {
                let x = self.out.identifier(node);
                let call = self.call("reset", vec![Some(x)]);
                child.initializer.push(self.statement(call));
            }
        }
        Ok(child)
    }

    /// Upstream `fold_reset_into_child`: `var x = $.child(el)` + `$.reset(el)` →
    /// `$.only_child(el)`.
    pub(super) fn fold_reset_into_child(
        &mut self,
        initializer: &mut [NodeIdentifier],
        node: &str,
    ) -> bool {
        let Some(&last) = initializer.last() else {
            return false;
        };
        let Kind::VariableDeclaration {
            declarations: [d],
            kind,
        } = self.out.kind(last)
        else {
            return false;
        };
        let d = *d;
        let Kind::Declarator {
            identifier,
            initializer: Some(call),
        } = self.out.kind(d)
        else {
            return false;
        };
        let Kind::Call {
            callee, arguments, ..
        } = self.out.kind(call)
        else {
            return false;
        };
        let is_child = matches!(
            self.out.kind(callee),
            Kind::Member { object, property, computed: false, .. }
                if self.out.name(object) == "$" && self.out.name(property) == "child"
        );
        let first_is_node = arguments.first().is_some_and(|&a| {
            matches!(self.out.kind(a), Kind::Identifier(_)) && self.out.name(a) == node
        });
        if !is_child || !first_is_node {
            return false;
        }
        let arguments = arguments.to_vec();
        let new_call = self.out.runtime("$", "only_child", &arguments);
        let declaration =
            self.out
                .declarator(identifier, Some(new_call), SourceLocation::SYNTHETIC);
        let var = self
            .out
            .var_declaration(kind, &[declaration], SourceLocation::SYNTHETIC);
        *initializer.last_mut().expect("checked above") = var;
        true
    }
}
