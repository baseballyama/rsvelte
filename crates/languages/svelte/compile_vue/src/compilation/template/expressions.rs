use super::{
    AttributeValue, BinaryOperator, BindingKind, Builder, Children, Helper, Item, Kind,
    LogicalOperator, NodeIdentifier, NodeKind, Parent, Part, R, ScopeIdentifier, SourceLocation,
    Span, TemplateRewrite, bound, clean_nodes, copy, known_string, sanitize_template_string,
    span_of, unsupported, vue, walk,
};

impl Builder<'_, '_> {
    /// The options of a bound `<select>`, each an `<option>` with a static `value`; on the server
    /// each is `selected` when the value is the bound one (`===`, as Svelte's renderer compares).
    pub(super) fn options(
        &mut self,
        children: Children,
        select: vue::CompilerNodeIdentifier,
        target: NodeIdentifier,
        at: Span,
    ) -> R<vue::Children> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let items = clean_nodes(
            compiler_syntax_tree,
            source_text,
            Parent::Element("select"),
            compiler_syntax_tree.children(children),
            false,
        )
        .items;
        let mut out = Vec::with_capacity(items.len());
        for item in &items {
            let Item::Node(identifier) = *item else {
                return Err(unsupported(
                    "a bound <select> with content other than options",
                    at,
                ));
            };
            let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
                return Err(unsupported("a block in a bound <select>", at));
            };
            let value = compiler_syntax_tree
                .attributes(el.attributes)
                .iter()
                .find_map(|a| {
                    (a.name.text(source_text) == "value").then_some(match &a.value {
                        AttributeValue::Static(v) => Some(v.clone()),
                        _ => None,
                    })
                });
            let (true, Some(Some(value))) = (el.name.text(source_text) == "option", value) else {
                return Err(unsupported(
                    "a bound <select> with content other than options with a static `value`",
                    el.name,
                ));
            };
            let extra = self.i.server.then(|| {
                let x = self.template_expression(target);
                let v = self.to.write_string(&value);
                let test =
                    self.to
                        .binary(BinaryOperator::StrictEq, x, v, SourceLocation::SYNTHETIC);
                bound("selected", el.name, test, el.name)
            });
            out.push(self.element(identifier, Some(select), false, Vec::new(), extra)?);
        }
        Ok(self.vb.children(&out))
    }

    /// `a="s{e}t"`: Svelte's attribute chunk, with `?? ''` (client) or `stringify` (server)
    /// around each expression it cannot prove a string.
    pub(super) fn interpolated(&mut self, parts: &[Part]) -> NodeIdentifier {
        let (javascript, source_text, resolution) =
            (self.i.javascript, self.i.source_text, self.i.resolution);
        let mut quasis = Vec::with_capacity(parts.len() + 1);
        let mut expressions = Vec::with_capacity(parts.len());
        let mut text = String::new();
        for p in parts {
            match *p {
                Part::Text(span) => {
                    text.push_str(&rsvelte_svelte::syntax::syntax_tree::decode_text(
                        span.text(source_text),
                    ));
                }
                Part::Expression { expression, .. } => {
                    let evaluated = resolution.evaluate(javascript, source_text, expression);
                    if evaluated.is_known {
                        text.push_str(&known_string(&evaluated.value));
                        continue;
                    }
                    quasis.push(
                        self.to
                            .template_element(&sanitize_template_string(&text), false),
                    );
                    text.clear();
                    let x = self.template_expression(expression);
                    let value = if self.i.server {
                        if evaluated.is_string && evaluated.is_defined {
                            x
                        } else {
                            self.helpers.insert(Helper::Stringify);
                            self.call("$$stringify", &[x])
                        }
                    } else if evaluated.is_defined {
                        x
                    } else {
                        let empty = self.to.write_string("");
                        self.to.logical(
                            LogicalOperator::Nullish,
                            x,
                            empty,
                            SourceLocation::SYNTHETIC,
                        )
                    };
                    expressions.push(value);
                }
            }
        }
        if expressions.is_empty() {
            return self.to.write_string(&text);
        }
        quasis.push(
            self.to
                .template_element(&sanitize_template_string(&text), true),
        );
        self.to
            .template(&quasis, &expressions, SourceLocation::SYNTHETIC)
    }

    pub(super) fn call(&mut self, name: &str, arguments: &[NodeIdentifier]) -> NodeIdentifier {
        let callee = self.to.identifier(name);
        self.to.call0(callee, arguments)
    }

    /// A template expression in the Vue tree.
    pub(super) fn template_expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        copy(
            self.i.javascript,
            self.to,
            &mut TemplateRewrite {
                resolution: self.i.resolution,
            },
            e,
        )
    }

    /// Refuses an expression evaluated while rendering that reads, directly or through the
    /// component's functions, a top-level binding that changes without being reactive: Svelte
    /// keeps what it rendered, a Vue re-render would show the new value.
    pub(super) fn render_read(&mut self, e: NodeIdentifier) -> R<()> {
        let javascript = self.i.javascript;
        let mut reads = Vec::new();
        walk(javascript, e, &mut |n| match javascript.kind(n) {
            Kind::Identifier(_) => {
                reads.push(n);
                Ok(())
            }
            Kind::Member {
                object,
                property,
                computed: false,
                ..
            } if self.is_impure_global(object, property) => Err(unsupported(
                "a value that changes on every read",
                span_of(javascript, n),
            )),
            _ => Ok(()),
        })?;
        for n in reads {
            self.read_binding(n)?;
        }
        Ok(())
    }

    pub(super) fn read_binding(&mut self, identifier: NodeIdentifier) -> R<()> {
        let (javascript, resolution) = (self.i.javascript, self.i.resolution);
        let Some((b, info)) = resolution.binding(identifier) else {
            return Ok(());
        };
        let binding = &resolution.sem.bindings[b];
        if binding.scope != ScopeIdentifier::ROOT || binding.node == identifier {
            return Ok(());
        }
        let changes = match info.kind {
            BindingKind::Normal => binding.writes > 0 || binding.mutations > 0,
            BindingKind::RawState => binding.mutations > 0,
            _ => false,
        };
        if changes {
            return Err(unsupported(
                format_args!(
                    "the template reads `{}`, which changes without being reactive",
                    javascript.name(identifier)
                ),
                span_of(javascript, identifier),
            ));
        }
        if info.is_function
            && self.visited.insert(b)
            && let Some(f) = self.function_of(b)
        {
            self.render_read(f)?;
        }
        Ok(())
    }

    pub(super) fn is_impure_global(
        &self,
        object: NodeIdentifier,
        property: NodeIdentifier,
    ) -> bool {
        let javascript = self.i.javascript;
        matches!(javascript.kind(object), Kind::Identifier(_))
            && self.i.resolution.binding(object).is_none()
            && matches!(
                (javascript.name(object), javascript.name(property)),
                ("Math", "random") | ("Date" | "performance", "now")
            )
    }
}
