use super::{
    AttributeValue, BinaryOperator, Builder, Children, Helper, Item, Kind, LogicalOperator,
    NodeIdentifier, NodeKind, Parent, Part, R, ScopeIdentifier, SourceLocation, Span,
    TemplateRewrite, bound, clean_nodes, copy, known_string, sanitize_template_string, unsupported,
    vue, walk,
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
        multiple: bool,
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
                let x = self.binding_read(target);
                let v = self.to.write_string(&value);
                let test = if multiple {
                    self.helpers.insert(Helper::Select);
                    self.call("$$selected", &[x, v])
                } else {
                    self.to
                        .binary(BinaryOperator::StrictEq, x, v, SourceLocation::SYNTHETIC)
                };
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
                    text.push_str(&rsvelte_svelte::syntax::syntax_tree::decode_attribute(
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
        if !self.i.server && super::super::asynchronous::has_await(self.i.javascript, e) {
            self.helpers.insert(Helper::Async);
        }
        let value = copy(
            self.i.javascript,
            self.to,
            &mut TemplateRewrite {
                resolution: self.i.resolution,
                snippet_names: &self.snippet_names,
                server: self.i.server,
            },
            e,
        );
        if !self.i.server
            && self
                .i
                .analysis
                .expressions
                .get(&e)
                .is_some_and(|meta| meta.has_call)
            && !matches!(
                self.i.javascript.kind(e),
                Kind::Arrow { .. } | Kind::Function { .. }
            )
        {
            self.memoized.insert(value);
        }
        value
    }

    pub(super) fn render_read(&mut self, e: NodeIdentifier) -> R<()> {
        let javascript = self.i.javascript;
        let mut reads = Vec::new();
        walk(javascript, e, &mut |n| match javascript.kind(n) {
            Kind::Identifier(_) => {
                reads.push(n);
                Ok(())
            }
            _ => Ok(()),
        })?;
        for n in reads {
            self.read_binding(n)?;
        }
        Ok(())
    }

    pub(super) fn read_binding(&mut self, identifier: NodeIdentifier) -> R<()> {
        let resolution = self.i.resolution;
        let Some((b, info)) = resolution.binding(identifier) else {
            return Ok(());
        };
        let binding = &resolution.sem.bindings[b];
        if binding.scope != ScopeIdentifier::ROOT || binding.node == identifier {
            return Ok(());
        }
        if info.is_function
            && self.visited.insert(b)
            && let Some(f) = self.function_of(b)
        {
            self.render_read(f)?;
        }
        Ok(())
    }
}
