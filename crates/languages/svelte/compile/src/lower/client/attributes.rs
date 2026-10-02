use super::{
    AssignmentOperator, Attribute, AttributeValue, ClientCompilationContext,
    CompilerNodeIdentifier, Frag, Item, Kind, Lists, NodeIdentifier, Part, R, SourceLocation,
    decode_text, escape_markup, event_attribute, flag, init_property, needs_clsx,
    normalize_attribute, unsupported,
};

impl<'a> ClientCompilationContext<'a> {
    /// Upstream `build_attribute_effect`: every attribute and spread, in order, as one object the
    /// runtime diffs, with its own memoized values.
    pub(super) fn attribute_effect(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        remove_defaults: bool,
        l: &mut Lists,
    ) {
        let mut memo = Frag::default();
        let mut values = Vec::with_capacity(attributes.len());
        let mut class_directives = Vec::new();
        for a in attributes {
            match a.value {
                AttributeValue::Bind(_) | AttributeValue::Attach(_) => continue,
                AttributeValue::Class(_) => {
                    class_directives.push(a);
                    continue;
                }
                AttributeValue::Spread(e) => {
                    let meta = self.an.meta(e);
                    let built = self.expression(e);
                    let v = self.memoize(&mut memo, built, meta);
                    values.push(self.out.spread(v, SourceLocation::SYNTHETIC));
                    continue;
                }
                _ => {}
            }
            let (value, _) = self.attribute_value(a, &mut memo);
            let raw_name = a.name.text(self.source_text);
            if event_attribute(self.source_text, a).is_some()
                && matches!(
                    self.out.kind(value),
                    Kind::Arrow { .. } | Kind::Function { .. }
                )
            {
                // A stable handler, so the runtime does not remove and re-add it on every update.
                let handler = self.names.generate("event_handler");
                l.initializer.push(self.var(&handler, value));
                let x = self.out.identifier(&handler);
                values.push(init_property(&mut self.out, raw_name, x));
            } else {
                let name = if tag == "select" && normalize_attribute(raw_name) == "defaultValue" {
                    "defaultValue"
                } else {
                    raw_name
                };
                values.push(init_property(&mut self.out, name, value));
            }
        }
        if !class_directives.is_empty() {
            let props: Vec<NodeIdentifier> = class_directives
                .iter()
                .map(|d| {
                    let AttributeValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let meta = self.an.meta(e);
                    let built = self.expression(e);
                    let v = self.memoize(&mut memo, built, meta);
                    init_property(&mut self.out, d.name.text(self.source_text), v)
                })
                .collect();
            let object = self.out.object(&props, SourceLocation::SYNTHETIC);
            let ns = self.out.identifier("$");
            let key = self.out.dot(ns, "CLASS");
            values.push(
                self.out
                    .property(key, object, flag::COMPUTED, SourceLocation::SYNTHETIC),
            );
        }
        let identifiers: Vec<NodeIdentifier> = (0..memo.memo.len())
            .map(|i| self.out.identifier(&format!("${i}")))
            .collect();
        let object = self.out.object(&values, SourceLocation::SYNTHETIC);
        let arrow = self
            .out
            .arrow(&identifiers, object, true, false, SourceLocation::SYNTHETIC);
        let sync = (!memo.memo.is_empty()).then(|| {
            let thunks: Vec<NodeIdentifier> = std::mem::take(&mut memo.memo)
                .into_iter()
                .map(|m| {
                    self.out
                        .arrow(&[], m, true, false, SourceLocation::SYNTHETIC)
                })
                .collect();
            self.out.array(&thunks, SourceLocation::SYNTHETIC)
        });
        let hash = if self.an.scoped[identifier] {
            self.identity.stylesheet_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| self.out.write_string(&h));
        let remove = remove_defaults.then(|| self.tru());
        let x = self.out.identifier(node);
        let call = self.call(
            "attribute_effect",
            vec![Some(x), Some(arrow), sync, None, None, hash, remove],
        );
        l.initializer.push(self.statement(call));
    }

    /// The attribute loop of upstream `RegularElement` (no spread).
    pub(super) fn element_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        attributes: &[Attribute],
        node: &str,
        frag: &mut Frag,
        l: &mut Lists,
    ) -> R<()> {
        let class_directives: Vec<&Attribute> = attributes
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Class(_)))
            .collect();
        for a in attributes {
            if let AttributeValue::Bind(_) | AttributeValue::Attach(_) | AttributeValue::Class(_) =
                a.value
            {
                continue;
            }
            let raw_name = a.name.text(self.source_text);
            if let Some(handler) = event_attribute(self.source_text, a) {
                self.event(raw_name, handler, node, l);
                continue;
            }
            let attribute_name = normalize_attribute(raw_name);
            // `select_value` sets these once the options exist.
            if (matches!(tag, "option" | "select") && raw_name == "value")
                || (tag == "select" && attribute_name == "defaultValue")
            {
                continue;
            }
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(v.to_string())),
                _ => None,
            };
            if !crate::lower::cannot_be_set_statically(raw_name)
                && (attribute_name != "class" || class_directives.is_empty())
                && let Some(value) = literal
            {
                self.static_attribute(frag, identifier, raw_name, &attribute_name, value);
            } else if attribute_name == "class" {
                self.set_class(identifier, node, Some(a), &class_directives, frag, l);
            } else if attribute_name == "autofocus" || attribute_name == "style" {
                return unsupported(&format!("a dynamic `{attribute_name}` attribute"), a.span);
            } else {
                let (value, has_state) = self.attribute_value(a, frag);
                let update = self.attribute_update(node, &attribute_name, value);
                let s = self.statement(update);
                if has_state {
                    l.update.push(s);
                } else {
                    l.initializer.push(s);
                }
            }
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = attributes.iter().any(|a| {
            !matches!(a.value, AttributeValue::Class(_))
                && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            self.set_class(identifier, node, None, &class_directives, frag, l);
        } else if !has_class && self.an.scoped[identifier] {
            self.static_attribute(frag, identifier, "class", "class", Some(String::new()));
        }
        Ok(())
    }

    /// A `class` value written as one expression, through `$.clsx` when upstream's `needs_clsx`.
    pub(super) fn class_expression(
        &mut self,
        expression: NodeIdentifier,
        unquoted: bool,
        frag: &mut Frag,
    ) -> (NodeIdentifier, bool) {
        let meta = self.an.meta(expression);
        let mut built = self.expression(expression);
        if unquoted && needs_clsx(self.javascript, expression) {
            built = self.call("clsx", vec![Some(built)]);
        }
        (self.memoize(frag, built, meta), meta.has_state)
    }

    /// Upstream `build_set_class`; `attribute` is `None` for the empty `class` upstream's analysis
    /// adds.
    pub(super) fn set_class(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        attribute: Option<&Attribute>,
        directives: &[&Attribute],
        frag: &mut Frag,
        l: &mut Lists,
    ) {
        let (mut value, mut has_state) = match attribute.map(|a| &a.value) {
            None => (self.out.write_string(""), false),
            Some(&AttributeValue::Expression { expression, quoted }) => {
                self.class_expression(expression, !quoted, frag)
            }
            Some(&AttributeValue::Shorthand(expression)) => {
                self.class_expression(expression, true, frag)
            }
            Some(_) => self.attribute_value(attribute.expect("matched above"), frag),
        };
        let mut prev = None;
        let mut next = None;
        let mut previous_id = None;
        if !directives.is_empty() {
            let mut props = Vec::with_capacity(directives.len());
            for d in directives {
                let AttributeValue::Class(e) = d.value else {
                    unreachable!("class directives")
                };
                let meta = self.an.meta(e);
                let built = self.expression(e);
                let v = self.memoize(frag, built, meta);
                has_state |= meta.has_state;
                props.push(init_property(
                    &mut self.out,
                    d.name.text(self.source_text),
                    v,
                ));
            }
            next = Some(self.out.object(&props, SourceLocation::SYNTHETIC));
            if has_state {
                let name = self.names.generate("classes");
                let x = self.out.identifier(&name);
                l.initializer.push(self.out.let_(flag::LET, x, None));
                prev = Some(self.out.identifier(&name));
                previous_id = Some(name);
            } else {
                prev = Some(self.out.object(&[], SourceLocation::SYNTHETIC));
            }
        }
        let mut stylesheet_hash = None;
        if self.an.scoped[identifier]
            && let Some(hash) = self.identity.stylesheet_hash.clone()
        {
            let literal = match self.out.kind(value) {
                Kind::String => Some(self.out.str_value(value, self.source_text).to_owned()),
                Kind::Null => Some(String::new()),
                _ => None,
            };
            match literal {
                Some(v) if v.is_empty() => value = self.out.write_string(&hash),
                Some(v) => {
                    value = self
                        .out
                        .write_string(&format!("{} {hash}", escape_markup(&v, true)));
                }
                None => stylesheet_hash = Some(self.out.write_string(&hash)),
            }
        }
        if stylesheet_hash.is_none() && next.is_some() {
            stylesheet_hash = Some(self.out.null(SourceLocation::SYNTHETIC));
        }
        let x = self.out.identifier(node);
        let is_markup = self.write_number(1);
        let mut set_class = self.call(
            "set_class",
            vec![
                Some(x),
                Some(is_markup),
                Some(value),
                stylesheet_hash,
                prev,
                next,
            ],
        );
        if let Some(name) = previous_id {
            let target = self.out.identifier(&name);
            set_class = self.out.assign(
                AssignmentOperator::Assign,
                target,
                set_class,
                SourceLocation::SYNTHETIC,
            );
        }
        let s = self.statement(set_class);
        if has_state {
            l.update.push(s);
        } else {
            l.initializer.push(s);
        }
    }

    pub(super) fn static_attribute(
        &self,
        frag: &mut Frag,
        identifier: CompilerNodeIdentifier,
        raw_name: &str,
        attribute_name: &str,
        value: Option<String>,
    ) {
        let mut value = value;
        if attribute_name == "class"
            && self.an.scoped[identifier]
            && let Some(hash) = &self.identity.stylesheet_hash
        {
            value = Some(match value.as_deref() {
                None | Some("") => hash.clone(),
                Some(v) => format!("{v} {hash}"),
            });
        }
        if attribute_name != "class"
            || value.as_deref().is_some_and(|v| !v.is_empty())
            || value.is_none()
        {
            frag.tpl.set_prop(raw_name, Some(value.unwrap_or_default()));
        }
    }

    /// Upstream `build_attribute_value` (client).
    pub(super) fn attribute_value(
        &mut self,
        a: &Attribute,
        frag: &mut Frag,
    ) -> (NodeIdentifier, bool) {
        match &a.value {
            AttributeValue::Boolean => (self.tru(), false),
            AttributeValue::Static(v) => (self.out.write_string(v), false),
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => {
                let meta = self.an.meta(expression);
                let built = self.expression(expression);
                (self.memoize(frag, built, meta), meta.has_state)
            }
            AttributeValue::Interpolated(parts) => {
                let items = self.chunk_items(parts);
                self.template_chunk(&items, frag)
            }
            AttributeValue::Bind(_)
            | AttributeValue::Attach(_)
            | AttributeValue::Class(_)
            | AttributeValue::Spread(_) => {
                unreachable!("directives are lowered by `element`")
            }
        }
    }

    pub(super) fn chunk_items(&self, parts: &[Part]) -> Vec<Item<'a>> {
        parts
            .iter()
            .map(|p| match p {
                Part::Text(s) => {
                    let raw = s.text(self.source_text);
                    Item::Text {
                        data: decode_text(raw),
                        raw: raw.into(),
                    }
                }
                Part::Expression { expression, .. } => Item::Expression(*expression),
            })
            .collect()
    }

    /// Upstream `build_element_attribute_update`.
    pub(super) fn attribute_update(
        &mut self,
        node: &str,
        name: &str,
        value: NodeIdentifier,
    ) -> NodeIdentifier {
        let x = self.out.identifier(node);
        match name {
            "muted" => {
                let target = self.out.dot(x, "muted");
                self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                )
            }
            "value" => self.call("set_value", vec![Some(x), Some(value)]),
            "checked" => self.call("set_checked", vec![Some(x), Some(value)]),
            "selected" => self.call("set_selected", vec![Some(x), Some(value)]),
            _ if crate::lower::is_dom_property(name) => {
                let target = self.out.dot(x, name);
                self.out.assign(
                    AssignmentOperator::Assign,
                    target,
                    value,
                    SourceLocation::SYNTHETIC,
                )
            }
            _ => {
                let method = if name.starts_with("xlink") {
                    "set_xlink_attribute"
                } else {
                    "set_attribute"
                };
                let n = self.out.write_string(name);
                self.call(method, vec![Some(x), Some(n), Some(value)])
            }
        }
    }
}
