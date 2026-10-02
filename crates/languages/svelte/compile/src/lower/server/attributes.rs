use super::{
    Attribute, AttributeValue, CompilerNodeIdentifier, Diagnostic, ELEMENT_IS_INPUT, Kind,
    NodeIdentifier, Part, Piece, R, ServerCompilationContext, SourceLocation, check_binding,
    decode_text, escape_markup, event_attribute, init_property, is_boolean_attribute, is_directive,
    is_load_error_element, needs_clsx, runtime_call, sanitize_template_string,
};

impl<'a> ServerCompilationContext<'a> {
    /// Upstream `build_element_attributes` (no spread).
    #[expect(
        clippy::too_many_lines,
        reason = "ports upstream's `build_element_attributes` in one piece"
    )]
    pub(super) fn element_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'a [Attribute],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let source_text = self.source_text;
        // A `defaultValue` on an `<input>` deopts to the spread path, which orders it at runtime.
        let has_spread = list.iter().any(|a| {
            matches!(a.value, AttributeValue::Spread(_))
                || (tag == "input"
                    && !is_directive(&a.value)
                    && matches!(a.name.text(source_text), "defaultValue" | "defaultChecked"))
        });
        if has_spread {
            return self.spread_attributes(identifier, tag, list, template);
        }
        let hash = if self.an.scoped[identifier] {
            self.identity.stylesheet_hash.clone()
        } else {
            None
        };
        let mut events = Vec::new();
        let class_directives: Vec<&Attribute> = list
            .iter()
            .filter(|a| matches!(a.value, AttributeValue::Class(_)))
            .collect();
        for a in list {
            let raw_name = a.name.text(self.source_text);
            match a.value {
                AttributeValue::Bind(_) => {
                    let e =
                        check_binding(self.javascript, self.res, self.source_text, tag, list, a)?;
                    let name = raw_name.to_ascii_lowercase();
                    let value = self.expression(e);
                    let n = self.out.write_string(&name);
                    let mut arguments = vec![n, value];
                    if is_boolean_attribute(&name) {
                        arguments.push(self.out.write_boolean(true, SourceLocation::SYNTHETIC));
                    }
                    template.push(Piece::Expression(self.out.runtime("$", "attr", &arguments)));
                    continue;
                }
                AttributeValue::Attach(_) | AttributeValue::Class(_) => continue,
                AttributeValue::Spread(_) => unreachable!("spreads take the spread path"),
                _ if event_attribute(self.source_text, a).is_some() => {
                    capture_event(&mut events, tag, raw_name);
                    continue;
                }
                _ if matches!(raw_name, "defaultValue" | "defaultChecked") => continue,
                _ => {}
            }
            let name = raw_name.to_ascii_lowercase();
            let trim = matches!(name.as_str(), "class" | "style");
            let can_use_literal = name != "class" || class_directives.is_empty();
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(
                    escape_markup(&attribute_text(v, trim), true).into_owned(),
                )),
                _ => None,
            };
            if can_use_literal && let Some(v) = literal {
                Self::literal_attribute(template, &name, v, hash.as_deref());
                continue;
            }
            if name == "style" {
                return Err(Diagnostic::error(
                    "unsupported",
                    "a dynamic `style` attribute is not supported yet",
                    a.span,
                ));
            }
            let value = self.attribute_value(a, trim, raw_name == "class");
            if can_use_literal && matches!(self.out.kind(value), Kind::String) {
                let mut v = self.out.str_value(value, self.source_text).to_owned();
                if name == "class"
                    && let Some(h) = &hash
                {
                    format!("{v} {h}").trim().clone_into(&mut v);
                }
                let v = escape_markup(&v, true);
                template.push(Piece::Text(format!(" {name}=\"{v}\"")));
            } else if name == "class" {
                let call = self.attribute_class(&class_directives, value, hash.as_deref());
                template.push(Piece::Expression(call));
            } else {
                let n = self.out.write_string(&name);
                let mut arguments = vec![n, value];
                if is_boolean_attribute(&name) {
                    arguments.push(self.out.write_boolean(true, SourceLocation::SYNTHETIC));
                }
                template.push(Piece::Expression(self.out.runtime("$", "attr", &arguments)));
            }
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = list.iter().any(|a| {
            !matches!(a.value, AttributeValue::Class(_))
                && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        if !has_class && !class_directives.is_empty() {
            let value = self.out.write_string("");
            let call = self.attribute_class(&class_directives, value, hash.as_deref());
            template.push(Piece::Expression(call));
        } else if !has_class && self.an.scoped[identifier] {
            Self::literal_attribute(template, "class", Some(String::new()), hash.as_deref());
        }
        push_captured_events(template, &events);
        Ok(())
    }

    /// Upstream `build_element_attributes`' spread path: `build_element_spread_attributes` and
    /// `prepare_element_spread`.
    pub(super) fn spread_attributes(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'a [Attribute],
        template: &mut Vec<Piece>,
    ) -> R<()> {
        let (arguments, events) = self.spread_args(identifier, tag, list, false)?;
        let call = runtime_call(&mut self.out, "attributes", arguments);
        template.push(Piece::Expression(call));
        push_captured_events(template, &events);
        Ok(())
    }

    /// Upstream `prepare_element_spread`'s arguments. `all` is `prepare_element_spread_object`,
    /// which keeps every attribute; otherwise the spread path of `build_element_attributes`
    /// filters events (returned for capture) and the values the runtime sets elsewhere.
    pub(super) fn spread_args(
        &mut self,
        identifier: CompilerNodeIdentifier,
        tag: &str,
        list: &'a [Attribute],
        all: bool,
    ) -> R<(Vec<Option<NodeIdentifier>>, Vec<&'a str>)> {
        let mut events = Vec::new();
        let mut props = Vec::with_capacity(list.len());
        let mut class_directives = Vec::new();
        for a in list {
            let raw_name = a.name.text(self.source_text);
            match a.value {
                AttributeValue::Bind(_) => {
                    let e =
                        check_binding(self.javascript, self.res, self.source_text, tag, list, a)?;
                    let value = self.expression(e);
                    let name = raw_name.to_ascii_lowercase();
                    props.push(init_property(&mut self.out, &name, value));
                    continue;
                }
                AttributeValue::Attach(_) => continue,
                AttributeValue::Class(e) => {
                    class_directives.push((raw_name, e));
                    continue;
                }
                AttributeValue::Spread(e) => {
                    let v = self.expression(e);
                    props.push(self.out.spread(v, SourceLocation::SYNTHETIC));
                    if is_load_error_element(tag) {
                        capture_event(&mut events, tag, "onload");
                        capture_event(&mut events, tag, "onerror");
                    }
                    continue;
                }
                _ if all => {}
                _ if raw_name == "value" && tag == "select" => continue,
                _ if event_attribute(self.source_text, a).is_some() => {
                    capture_event(&mut events, tag, raw_name);
                    continue;
                }
                _ if tag != "input" && matches!(raw_name, "defaultValue" | "defaultChecked") => {
                    continue;
                }
                _ => {}
            }
            let mut name = raw_name.to_ascii_lowercase();
            if tag == "select" && name == "defaultvalue" {
                "defaultValue".clone_into(&mut name);
            }
            let trim = matches!(name.as_str(), "class" | "style");
            let value = self.attribute_value(a, trim, raw_name == "class");
            props.push(init_property(&mut self.out, &name, value));
        }
        // Upstream's analysis appends `class=""` to such an element.
        let has_class = list.iter().any(|a| {
            !is_directive(&a.value) && a.name.text(self.source_text).eq_ignore_ascii_case("class")
        });
        let has_spread = list
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Spread(_)));
        if !has_spread && !has_class && (self.an.scoped[identifier] || !class_directives.is_empty())
        {
            let empty = self.out.write_string("");
            props.push(init_property(&mut self.out, "class", empty));
        }
        let object = self.out.object(&props, SourceLocation::SYNTHETIC);
        let classes = (!class_directives.is_empty()).then(|| {
            let props: Vec<NodeIdentifier> = class_directives
                .iter()
                .map(|&(name, e)| {
                    let v = self.expression(e);
                    init_property(&mut self.out, name, v)
                })
                .collect();
            self.out.object(&props, SourceLocation::SYNTHETIC)
        });
        let hash = if self.an.scoped[identifier] {
            self.identity.stylesheet_hash.clone()
        } else {
            None
        };
        let hash = hash.map(|h| self.out.write_string(&h));
        let flags = (tag == "input").then(|| {
            self.out
                .write_number(f64::from(ELEMENT_IS_INPUT), SourceLocation::SYNTHETIC)
        });
        Ok((vec![Some(object), hash, classes, None, flags], events))
    }

    /// Upstream `build_attr_class`.
    pub(super) fn attribute_class(
        &mut self,
        directives: &[&Attribute],
        value: NodeIdentifier,
        hash: Option<&str>,
    ) -> NodeIdentifier {
        let directives = (!directives.is_empty()).then(|| {
            let props: Vec<NodeIdentifier> = directives
                .iter()
                .map(|d| {
                    let AttributeValue::Class(e) = d.value else {
                        unreachable!("class directives")
                    };
                    let key = self.out.write_string(d.name.text(self.source_text));
                    let v = self.expression(e);
                    self.out.property(key, v, 0, SourceLocation::SYNTHETIC)
                })
                .collect();
            self.out.object(&props, SourceLocation::SYNTHETIC)
        });
        let mut value = value;
        let mut stylesheet_hash = None;
        if let Some(h) = hash {
            if matches!(self.out.kind(value), Kind::String) {
                let v = self.out.str_value(value, self.source_text);
                value = self.out.write_string(format!("{v} {h}").trim());
            } else {
                stylesheet_hash = Some(self.out.write_string(h));
            }
        }
        runtime_call(
            &mut self.out,
            "attr_class",
            vec![Some(value), stylesheet_hash, directives],
        )
    }

    pub(super) fn literal_attribute(
        template: &mut Vec<Piece>,
        name: &str,
        value: Option<String>,
        hash: Option<&str>,
    ) {
        let mut value = value;
        if name == "class"
            && let Some(h) = hash
        {
            let base = value
                .as_deref()
                .map_or_else(|| "true".to_owned(), str::to_owned);
            value = Some(format!("{base} {h}").trim().to_owned());
        }
        if name != "class" || value.as_deref() != Some("") {
            template.push(Piece::Text(format!(
                " {name}=\"{}\"",
                value.unwrap_or_default()
            )));
        }
    }

    /// Upstream `build_attribute_value` (server); a `class`
    /// written as one unquoted expression goes through `$.clsx` when upstream's `needs_clsx`.
    pub(super) fn attribute_value(
        &mut self,
        a: &Attribute,
        trim: bool,
        class: bool,
    ) -> NodeIdentifier {
        let parts = match &a.value {
            &AttributeValue::Expression { expression, quoted } => {
                let v = self.expression(expression);
                return if class && !quoted && needs_clsx(self.javascript, expression) {
                    self.out.runtime("$", "clsx", &[v])
                } else {
                    v
                };
            }
            &AttributeValue::Shorthand(expression) => {
                let v = self.expression(expression);
                return if class && needs_clsx(self.javascript, expression) {
                    self.out.runtime("$", "clsx", &[v])
                } else {
                    v
                };
            }
            AttributeValue::Interpolated(parts) => parts,
            AttributeValue::Boolean => {
                return self.out.write_boolean(true, SourceLocation::SYNTHETIC);
            }
            AttributeValue::Static(v) => {
                return self
                    .out
                    .write_string(&escape_markup(&attribute_text(v, trim), true));
            }
            AttributeValue::Bind(_)
            | AttributeValue::Attach(_)
            | AttributeValue::Class(_)
            | AttributeValue::Spread(_) => {
                unreachable!("directives are handled by the caller")
            }
        };
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for p in parts {
            match p {
                Part::Text(s) => {
                    let data = decode_text(s.text(self.source_text));
                    let data = if trim {
                        collapse_ws(&data)
                    } else {
                        data.into_owned()
                    };
                    quasis.last_mut().expect("never empty").push_str(&data);
                }
                Part::Expression { expression, .. } => {
                    let evaluated =
                        self.res
                            .evaluate(self.javascript, self.source_text, *expression);
                    if evaluated.is_known {
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&known_string(&evaluated.value));
                    } else {
                        let v = self.expression(*expression);
                        let v = if evaluated.is_string && evaluated.is_defined {
                            v
                        } else {
                            self.out.runtime("$", "stringify", &[v])
                        };
                        expressions.push(v);
                        quasis.push(String::new());
                    }
                }
            }
        }
        if expressions.is_empty() {
            return self.out.write_string(&quasis[0]);
        }
        let n = quasis.len();
        let elements: Vec<NodeIdentifier> = quasis
            .iter()
            .enumerate()
            .map(|(i, q)| {
                self.out
                    .template_element(&sanitize_template_string(q), i + 1 == n)
            })
            .collect();
        self.out
            .template(&elements, &expressions, SourceLocation::SYNTHETIC)
    }
}

pub(super) fn capture_event<'a>(events: &mut Vec<&'a str>, tag: &str, name: &'a str) {
    if matches!(name, "onload" | "onerror") && is_load_error_element(tag) && !events.contains(&name)
    {
        events.push(name);
    }
}

pub(super) fn push_captured_events(template: &mut Vec<Piece>, events: &[&str]) {
    for e in events {
        template.push(Piece::Text(format!(" {e}=\"this.__e=event\"")));
    }
}

/// `String(value ?? '')` for a known value.
pub(super) fn known_string(v: &rsvelte_svelte::semantic::evaluate::Value) -> String {
    match v {
        rsvelte_svelte::semantic::evaluate::Value::Null
        | rsvelte_svelte::semantic::evaluate::Value::Undefined => String::new(),
        v => v.to_javascript_string(),
    }
}

pub(super) fn attribute_text(data: &str, trim: bool) -> String {
    if trim {
        collapse_ws(data).trim().to_owned()
    } else {
        data.to_owned()
    }
}

/// `regex_whitespaces_strict` → `' '`.
fn collapse_ws(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_ws = false;
    for ch in s.chars() {
        if matches!(ch, ' ' | '\t' | '\n' | '\r' | '\u{c}') {
            if !in_ws {
                out.push(' ');
            }
            in_ws = true;
        } else {
            out.push(ch);
            in_ws = false;
        }
    }
    out
}
