use oxc_ast::ast::{Argument, Expression, LogicalOperator};
use rsvelte_typescript_tree::{DeclarationIdentifier, ExpressionIdentifier};

use super::{
    CompilerNodeIdentifier, DirectiveExpression, DirectiveName, Helper, Item, NodeKind, Parent, R,
    Span, Template, clean_nodes, directive, known_string, sanitize_template_string, unsupported,
    vue,
};

impl<'t> Template<'_, '_, 't> {
    pub(super) fn list(
        &mut self,
        parent: Parent<'_>,
        ids: &[CompilerNodeIdentifier],
        mut vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        at: Span,
    ) -> R<vue::Children> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let namespaces = self
            .i
            .plan
            .namespaces
            .as_ref()
            .expect("translation uses a checked plan");
        let (_, drops_whitespace) = namespaces.fragment(compiler_syntax_tree, source_text, ids);
        let cleaned = clean_nodes(
            compiler_syntax_tree,
            source_text,
            parent,
            ids,
            preserve_whitespace,
            drops_whitespace,
        );
        if let Some(&tag) = cleaned.hoisted.iter().find(|&&h| {
            !matches!(
                compiler_syntax_tree.node(h).kind,
                NodeKind::Element(_)
                    | NodeKind::Const { .. }
                    | NodeKind::Declaration { .. }
                    | NodeKind::Debug { .. }
                    | NodeKind::Snippet(_)
            )
        }) {
            return Err(unsupported(
                "this block or tag",
                compiler_syntax_tree.node(tag).span,
            ));
        }
        let items = cleaned.items;
        let mut scopes = Vec::new();
        if let Some(scope) = self.declarations(&cleaned.hoisted, vue_parent, at) {
            scopes.push(scope);
            vue_parent = Some(scope);
        }
        for &identifier in &cleaned.hoisted {
            if let NodeKind::Const { declaration } = compiler_syntax_tree.node(identifier).kind {
                for scope in self.const_scopes(declaration, vue_parent, at) {
                    scopes.push(scope);
                    vue_parent = Some(scope);
                }
            }
        }
        let mut out = Vec::with_capacity(items.len());
        for identifier in cleaned.hoisted {
            let node = compiler_syntax_tree.node(identifier);
            match &node.kind {
                NodeKind::Element(element)
                    if element.name.text(source_text) == "svelte:options" => {}
                NodeKind::Element(_) => out.push(self.element(
                    identifier,
                    vue_parent,
                    preserve_whitespace,
                    Vec::new(),
                    None,
                )?),
                NodeKind::Snippet(_) => {
                    out.push(self.snippet(
                        identifier,
                        vue_parent,
                        preserve_whitespace,
                        node.span,
                    )?);
                }
                _ => {}
            }
        }
        let mut i = 0;
        while i < items.len() {
            if let Item::Node(identifier) = items[i] {
                self.block(identifier, vue_parent, preserve_whitespace, at, &mut out)?;
                i += 1;
                continue;
            }
            let start = i;
            while i < items.len() && !matches!(items[i], Item::Node(_)) {
                i += 1;
            }
            self.sequence(&items[start..i], parent, vue_parent, at, &mut out);
        }
        let mut children = self.vb.children(&out);
        for scope in scopes.into_iter().rev() {
            self.vb.set_element_children(scope, children);
            children = self.vb.children(&[scope]);
        }
        Ok(children)
    }

    /// `<template v-for="pattern in [value]">` for each declarator of a `{@const}`.
    fn const_scopes(
        &mut self,
        declaration: DeclarationIdentifier,
        mut vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
    ) -> Vec<vue::CompilerNodeIdentifier> {
        let declaration = self.i.component.javascript.get_declaration(declaration);
        let mut scopes = Vec::with_capacity(declaration.declarations.len());
        for declarator in &declaration.declarations {
            let init = declarator
                .init
                .as_ref()
                .expect("a const tag has an initializer");
            if !self.i.server && crate::compilation::asynchronous::has_await(init) {
                self.helpers.insert(Helper::Async);
            }
            let value = self.rewrite(init);
            let pattern = self.pattern(&declarator.id);
            let source = self.b.array([value]);
            let property = self.loop_directive([self.b.parameter(pattern)], source, at);
            let scope = self.template_node("template", at, vec![property], vue_parent);
            scopes.push(scope);
            vue_parent = Some(scope);
        }
        scopes
    }

    /// An element or a block among a fragment's items.
    fn block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        at: Span,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let node = compiler_syntax_tree.node(identifier);
        match &node.kind {
            NodeKind::Element(element) if element.name.text(source_text) == "svelte:options" => {}
            NodeKind::Element(_) => {
                out.push(self.element(
                    identifier,
                    vue_parent,
                    preserve_whitespace,
                    Vec::new(),
                    None,
                )?);
            }
            NodeKind::If { .. } => {
                self.if_chain(identifier, vue_parent, preserve_whitespace, out)?;
            }
            NodeKind::Each(_) => {
                self.each(identifier, vue_parent, preserve_whitespace, out)?;
            }
            &NodeKind::Key { expression, body } => {
                let b = self.b;
                let value = self.template_expression(expression);
                let lead = vec![
                    self.loop_directive(
                        [b.parameter(b.binding("$$key"))],
                        b.array([value]),
                        node.span,
                    ),
                    self.bound("$$key", at, b.id("$$key"), at),
                ];
                out.push(self.block_element(
                    Parent::Block,
                    compiler_syntax_tree.children(body),
                    vue_parent,
                    lead,
                    preserve_whitespace,
                    at,
                )?);
            }
            &NodeKind::Html { expression } => {
                out.push(self.raw_markup(identifier, expression, vue_parent, at));
            }
            NodeKind::Await(await_) => {
                out.push(self.await_block(await_, vue_parent, preserve_whitespace, node.span)?);
            }
            &NodeKind::Render { expression } => {
                out.push(self.render(expression, vue_parent, at)?);
            }
            NodeKind::Text { .. }
            | NodeKind::Comment { .. }
            | NodeKind::Expression { .. }
            | NodeKind::Snippet(_)
            | NodeKind::Const { .. }
            | NodeKind::Debug { .. }
            | NodeKind::Declaration { .. } => {
                unreachable!("clean_nodes keeps only elements and blocks as nodes")
            }
        }
        Ok(())
    }

    /// `{@render f(…)}`: a `$$Render` with the call as its value.
    fn render(
        &mut self,
        expression: ExpressionIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        if let Expression::CallExpression(call) = self.source(expression).get_inner_expression()
            && call
                .arguments
                .iter()
                .any(|argument| matches!(argument, Argument::SpreadElement(_)))
        {
            return Err(unsupported("a render call with spread arguments", at));
        }
        let value = self.template_expression(expression);
        let value = self.bound("value", at, value, at);
        Ok(self.template_node("$$Render", at, vec![value], vue_parent))
    }

    /// A run of text and `{expression}` tags: one text node in both runtimes.
    fn sequence(
        &mut self,
        items: &[Item<'_>],
        parent: Parent<'_>,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) {
        let lone = items.len() == 1;
        let mut text = String::new();
        let mut quasis = Vec::new();
        let mut expressions = Vec::new();
        for (index, item) in items.iter().enumerate() {
            match item {
                Item::Text { raw, .. } if matches!(parent, Parent::Element("textarea")) => {
                    let raw =
                        super::static_text::textarea_text(raw, index == 0, self.i.server, items);
                    text.push_str(&rsvelte_svelte_syntax::syntax_tree::decode_attribute(raw));
                }
                Item::Text { data, .. } => text.push_str(data),
                &Item::Expression(expression) => {
                    let value = self.text_value(expression, lone);
                    quasis.push(sanitize_template_string(&text).into_owned());
                    text.clear();
                    expressions.push(value);
                }
                // The runtime anchor after a lone `<script>`, which vapor output never had.
                Item::Comment => {}
                Item::Node(_) => unreachable!("a sequence holds text and expressions"),
            }
        }
        if expressions.is_empty() {
            if !text.is_empty() {
                out.push(self.static_text(text, items, parent, vue_parent, at));
            }
            return;
        }
        if !self.i.server && matches!(parent, Parent::Element("textarea")) {
            self.helpers.insert(Helper::Value);
        }
        let expression = if lone {
            expressions.pop().expect("one expression")
        } else {
            quasis.push(sanitize_template_string(&text).into_owned());
            self.b
                .template(quasis.iter().map(String::as_str), expressions)
        };
        let expression = self.keep(expression);
        out.push(self.vb.node(
            vue::NodeKind::Interpolation { expression },
            at,
            vue_parent,
            0,
        ));
    }

    /// The string an `{expression}` contributes: Svelte's `build_template_chunk` with `set_text`
    /// or a one-time `nodeValue` (client), or its server `escape`.
    fn text_value(&mut self, e: ExpressionIdentifier, lone: bool) -> Expression<'t> {
        let b = self.b;
        let evaluated = self.evaluate(e);
        if evaluated.is_known {
            return b.string(&known_string(&evaluated.value));
        }
        let x = self.template_expression(e);
        if self.i.server {
            let value = b.logical(x, LogicalOperator::Coalesce, b.string(""));
            return self.call("String", [value]);
        }
        if !lone {
            return if evaluated.is_defined {
                x
            } else {
                b.logical(x, LogicalOperator::Coalesce, b.string(""))
            };
        }
        if !self.i.analysis.meta(e).has_state {
            self.helpers.insert(Helper::NodeValue);
            return self.call("$$node", [x]);
        }
        let value = b.logical(x, LogicalOperator::Coalesce, b.string(""));
        b.template(["", ""], [value])
    }

    /// The one element a block's fragment must be.
    fn only_element(
        &self,
        parent: Parent<'_>,
        ids: &[CompilerNodeIdentifier],
    ) -> Option<CompilerNodeIdentifier> {
        let compiler_syntax_tree = self.i.compiler_syntax_tree;
        let cleaned = clean_nodes(
            compiler_syntax_tree,
            self.i.source_text,
            parent,
            ids,
            false,
            false,
        );
        if !cleaned.hoisted.is_empty() {
            return None;
        }
        match cleaned.items.as_slice() {
            &[Item::Node(identifier)]
                if matches!(
                    compiler_syntax_tree.node(identifier).kind,
                    NodeKind::Element(_)
                ) =>
            {
                Some(identifier)
            }
            _ => None,
        }
    }

    pub(super) fn block_element(
        &mut self,
        parent: Parent<'_>,
        children: &[CompilerNodeIdentifier],
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        lead: Vec<vue::Property>,
        preserve: bool,
        at: Span,
    ) -> R<vue::CompilerNodeIdentifier> {
        if let Some(element) = self.only_element(parent, children) {
            return self.element(element, vue_parent, preserve, lead, None);
        }
        let node = self.template_node("template", at, lead, vue_parent);
        let children = self.list(parent, children, Some(node), preserve, at)?;
        self.vb.set_element_children(node, children);
        Ok(node)
    }

    fn if_chain(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        out: &mut Vec<vue::CompilerNodeIdentifier>,
    ) -> R<()> {
        let compiler_syntax_tree = self.i.compiler_syntax_tree;
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::If {
            branches,
            otherwise,
        } = &node.kind
        else {
            unreachable!("called on an if")
        };
        for (i, branch) in compiler_syntax_tree.branches(*branches).iter().enumerate() {
            let test = self.template_expression(branch.test);
            let name = if i == 0 {
                DirectiveName::If
            } else {
                DirectiveName::ElseIf
            };
            let lead = vec![self.directive_with(name, Some(test), node.span)];
            out.push(self.block_element(
                Parent::Block,
                compiler_syntax_tree.children(branch.body),
                vue_parent,
                lead,
                preserve_whitespace,
                node.span,
            )?);
        }
        if let Some(o) = otherwise {
            let lead = vec![directive(
                DirectiveName::Else,
                None,
                DirectiveExpression::None,
                node.span,
            )];
            out.push(self.block_element(
                Parent::Block,
                compiler_syntax_tree.children(*o),
                vue_parent,
                lead,
                preserve_whitespace,
                node.span,
            )?);
        }
        Ok(())
    }
}
