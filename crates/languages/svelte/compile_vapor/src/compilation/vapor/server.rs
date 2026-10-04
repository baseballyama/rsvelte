use rsvelte_typescript::syntax_tree::flag;
use rsvelte_vue::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind, PropertyKind};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Builder, NodeIdentifier, SYNTHETIC, Verbatim, copy};

impl Builder<'_> {
    pub(super) fn server_setup(
        &mut self,
        body: &mut Vec<NodeIdentifier>,
        fields: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let mut content = self.server_list(self.input.compiler_syntax_tree.root());
        if self.input.css_mode == super::super::template::CssMode::Injected
            && self.input.custom_element.is_none()
            && self.input.stylesheet.is_some()
        {
            self.helpers.insert("useSSRContext");
            let destination = self.to.identifier("$$ssr_context");
            let (hash, css) = self.stylesheet_values();
            let callee = self.to.identifier("$$render_css");
            let style = self.to.call0(callee, &[destination, hash, css]);
            content = self.join(&[style, content]);
        }
        if self.helpers.contains("useSSRContext") {
            let renderer = self.call("useSSRContext", &[]);
            let name = self.to.identifier("$$ssr_context");
            body.insert(0, self.to.let_(flag::CONST, name, Some(renderer)));
        }
        let parent = self.to.identifier("$$ssr_parent");
        let content = if self.input.destroy {
            let callbacks = self.to.array(&[], SYNTHETIC);
            let name = self.to.identifier("$$destroy");
            body.insert(0, self.to.let_(flag::CONST, name, Some(callbacks)));
            let callback = self.to.identifier("$$render_destroy");
            let renderer = self.to.arrow(&[], content, true, false, SYNTHETIC);
            self.to.call0(callback, &[renderer, name])
        } else {
            content
        };
        let render = self.to.arrow(&[parent], content, true, false, SYNTHETIC);
        let key = self.to.identifier("renderContent");
        let field = self.to.property(key, render, 0, SYNTHETIC);
        let renderer = self.to.identifier("_ctx");
        let push = self.to.identifier("_push");
        let render = self.to.dot(renderer, "renderContent");
        let parent = self.to.identifier("_parent");
        let value = self.to.call0(render, &[parent]);
        let call = self.to.call0(push, &[value]);
        let statement = self.to.expression_statement(call);
        let block = self.to.block(&[statement], SYNTHETIC);
        let method = self.to.function(
            false,
            None,
            &[renderer, push, parent],
            block,
            false,
            SYNTHETIC,
        );
        let key = self.to.identifier("ssrRender");
        fields.push(self.to.property(key, method, flag::METHOD, SYNTHETIC));
        self.to.object(&[field], SYNTHETIC)
    }

    pub(super) fn server_list(&mut self, nodes: &[CompilerNodeIdentifier]) -> NodeIdentifier {
        let mut output = Vec::with_capacity(nodes.len());
        let mut declarations = Vec::new();
        let mut index = 0;
        while index < nodes.len() {
            if matches!(&self.input.compiler_syntax_tree.node(nodes[index]).kind,
                NodeKind::Element(element) if element.tag.text(self.source_text) == "$$Snippet")
            {
                declarations.push(self.snippet_declaration(nodes[index], true));
                index += 1;
                continue;
            }
            if self.structural(nodes[index], DirectiveName::If).is_some() {
                let start = index;
                index += 1;
                while index < nodes.len()
                    && (self
                        .structural(nodes[index], DirectiveName::ElseIf)
                        .is_some()
                        || self.structural(nodes[index], DirectiveName::Else).is_some())
                {
                    index += 1;
                }
                output.push(self.server_if(&nodes[start..index]));
            } else {
                output.push(self.server_node(nodes[index]));
                index += 1;
            }
        }
        let content = self.join(&output);
        if declarations.is_empty() {
            return content;
        }
        declarations.push(self.to.return_(Some(content), SYNTHETIC));
        let block = self.to.block(&declarations, SYNTHETIC);
        let function = self.to.arrow(&[], block, false, false, SYNTHETIC);
        self.to.call0(function, &[])
    }

    fn server_if(&mut self, nodes: &[CompilerNodeIdentifier]) -> NodeIdentifier {
        let first = nodes[0];
        let condition = [DirectiveName::If, DirectiveName::ElseIf]
            .into_iter()
            .find_map(|name| self.structural(first, name))
            .and_then(|directive| match directive.exp {
                DirectiveExpression::Expression(expression) => Some(expression),
                _ => None,
            });
        let content = self.server_node(first);
        let Some(condition) = condition else {
            return content;
        };
        let asynchronous = super::super::asynchronous::has_await(&self.input.javascript, condition);
        let condition = self.expression(condition);
        let otherwise = if nodes.len() > 1 {
            self.server_if(&nodes[1..])
        } else {
            self.to.write_string("")
        };
        let result = self.to.cond(condition, content, otherwise, SYNTHETIC);
        self.server_async(result, asynchronous)
    }

    fn server_node(&mut self, identifier: CompilerNodeIdentifier) -> NodeIdentifier {
        if self.input.scopes.contains_key(&identifier) {
            return self.scope(identifier, true);
        }
        if let NodeKind::Element(element) = &self.input.compiler_syntax_tree.node(identifier).kind
            && element.tag.text(self.source_text) == "$$Await"
        {
            let DirectiveExpression::For(each) = &self
                .structural(identifier, DirectiveName::For)
                .expect("await has a scope")
                .exp
            else {
                unreachable!()
            };
            let parameter = copy(
                &self.input.javascript,
                &mut self.to,
                &mut Verbatim,
                each.parameters[0],
            );
            let source = self.expression(each.source);
            let value = self.server_call("$$await_server", &[source]);
            let declaration = self.to.let_(flag::CONST, parameter, Some(value));
            let content =
                self.server_list(self.input.compiler_syntax_tree.children(element.children));
            let return_ = self.to.return_(Some(content), SYNTHETIC);
            let block = self.to.block(&[declaration, return_], SYNTHETIC);
            let callback = self.to.arrow(&[], block, false, false, SYNTHETIC);
            return self.to.call0(callback, &[]);
        }
        if let Some(directive) = self.structural(identifier, DirectiveName::For) {
            let DirectiveExpression::For(each) = &directive.exp else {
                unreachable!()
            };
            let asynchronous =
                super::super::asynchronous::has_await(&self.input.javascript, each.source);
            let source = self.expression(each.source);
            let parameters: Vec<_> = each
                .parameters
                .iter()
                .map(|&parameter| self.copy_expression(parameter))
                .collect();
            let content = self.server_element(identifier);
            let callback = self.to.arrow(&parameters, content, true, false, SYNTHETIC);
            let map = self.to.dot(source, "map");
            let list = self.to.call0(map, &[callback]);
            let result = self.server_call("$$join", &[list]);
            return self.server_async(result, asynchronous);
        }
        match &self.input.compiler_syntax_tree.node(identifier).kind {
            NodeKind::Element(_) => self.server_element(identifier),
            NodeKind::Text(text) => self.to.write_string(&escape(text.text(self.source_text))),
            NodeKind::Interpolation { expression } => {
                let value = self.expression(*expression);
                let escaped = self.server_call("$$escape", &[value]);
                if super::super::asynchronous::has_await(&self.input.javascript, *expression) {
                    let getter = self.to.arrow(&[], escaped, true, true, SYNTHETIC);
                    self.to.call0(getter, &[])
                } else {
                    escaped
                }
            }
            NodeKind::Comment { .. } => self.to.write_string(""),
        }
    }

    #[expect(clippy::too_many_lines, reason = "one arm per server attribute shape")]
    fn server_element(&mut self, identifier: CompilerNodeIdentifier) -> NodeIdentifier {
        let tree = &self.input.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!()
        };
        let tag = element.tag.text(self.source_text);
        let html = self
            .input
            .namespaces
            .get(&identifier)
            .is_none_or(|namespace| *namespace == super::Namespace::Html);
        if tag == "slot" && self.input.custom_element.is_some() {
            return self.server_list(tree.children(element.children));
        }
        if tag == "$$Boundary" {
            return self.server_boundary(identifier);
        }
        if tag == "$$Component" {
            return self.server_component(identifier);
        }
        if tag == "$$Title" {
            self.helpers.insert("useSSRContext");
            let renderer = self.to.identifier("$$ssr_context");
            let asynchronous = tree.children(element.children).iter().any(|&child| {
                matches!(tree.node(child).kind, NodeKind::Interpolation { expression }
                    if super::super::asynchronous::has_await(&self.input.javascript, expression))
            });
            let value = self.title_text(identifier, &mut Vec::new());
            let result = self.server_call("$$render_title", &[renderer, value]);
            return self.server_async(result, asynchronous);
        }
        if tag == "$$Render" {
            let source = self.raw_markup_value(identifier);
            let asynchronous =
                super::super::asynchronous::has_await(&self.input.javascript, source);
            let value = self.expression(source);
            return self.server_async(value, asynchronous);
        }
        if matches!(tag, "svelte:window" | "svelte:document" | "svelte:body") {
            return self.to.write_string("");
        }
        if tag == "svelte:head" {
            self.helpers.insert("useSSRContext");
            let renderer = self.to.identifier("$$ssr_context");
            let content = self.server_list(tree.children(element.children));
            return self.server_call("$$render_head", &[renderer, content]);
        }
        if tag == "$$RawMarkup" {
            let source = self.raw_markup_value(identifier);
            let asynchronous =
                super::super::asynchronous::has_await(&self.input.javascript, source);
            let value = self.expression(source);
            return self.server_async(value, asynchronous);
        }
        if tag == "template"
            && element.tag_type == rsvelte_vue::compiler_syntax_tree::TagType::Template
        {
            return self.server_list(tree.children(element.children));
        }
        let dynamic = (tag == "svelte:element").then(|| self.to.identifier("$$tag"));
        let mut output = if let Some(tag) = dynamic {
            vec![self.to.write_string("<"), tag]
        } else {
            vec![self.to.write_string(&format!("<{tag}"))]
        };
        let mut asynchronous = false;
        let mut textarea = None;
        let mut editable = None;
        let mut styles = Vec::new();
        for property in tree.props(element.props) {
            match &property.kind {
                PropertyKind::Attribute { name, value } => {
                    let name = name.text(self.source_text);
                    if name == "style" {
                        styles.push(
                            self.to.write_string(
                                value
                                    .as_ref()
                                    .map_or("", |value| value.text(self.source_text)),
                            ),
                        );
                        continue;
                    }
                    let value = value.as_ref().map_or_else(
                        || format!(" {name}"),
                        |value| format!(" {name}=\"{}\"", escape(value.text(self.source_text))),
                    );
                    output.push(self.to.write_string(&value));
                }
                PropertyKind::Directive(directive) if directive.name == DirectiveName::Bind => {
                    let DirectiveExpression::Expression(expression) = directive.exp else {
                        continue;
                    };
                    let name = directive
                        .arg
                        .as_ref()
                        .map(|name| name.text(self.source_text));
                    if matches!(name, Some("$$key" | "$$ref" | "$$tag")) {
                        continue;
                    }
                    asynchronous |=
                        super::super::asynchronous::has_await(&self.input.javascript, expression);
                    let value = self.expression(expression);
                    if matches!(name, Some("$$html_content" | "$$text_content")) {
                        editable = Some((value, name == Some("$$html_content")));
                        continue;
                    }
                    if tag == "textarea" && name == Some("value") {
                        textarea = Some(value);
                        continue;
                    }
                    if name == Some("style") {
                        styles.push(value);
                        continue;
                    }
                    if let Some(name) = name {
                        let name = if name == "CLASS" { "class" } else { name };
                        let name = self.to.write_string(name);
                        let mut arguments = vec![name, value];
                        if !html {
                            arguments.push(self.to.write_boolean(false, SYNTHETIC));
                        }
                        output.push(self.server_call("$$attribute", &arguments));
                    } else {
                        let mut arguments = vec![value];
                        if !html {
                            arguments.push(self.to.write_boolean(false, SYNTHETIC));
                        }
                        output.push(self.server_call("$$attributes_text", &arguments));
                    }
                }
                PropertyKind::Directive(_) => {}
            }
        }
        if !styles.is_empty() {
            let styles = self.to.array(&styles, SYNTHETIC);
            output.push(self.server_call("$$styles_text", &[styles]));
        }
        output.push(self.to.write_string(">"));
        if !matches!(
            tag,
            "area"
                | "base"
                | "br"
                | "col"
                | "embed"
                | "hr"
                | "img"
                | "input"
                | "link"
                | "meta"
                | "param"
                | "source"
                | "track"
                | "wbr"
        ) {
            let mut children = match textarea {
                Some(value) => self.server_call("$$escape", &[value]),
                None if tag == "style" => {
                    let parts: Vec<_> = tree
                        .children(element.children)
                        .iter()
                        .map(|&child| {
                            let NodeKind::Text(text) = &tree.node(child).kind else {
                                unreachable!("a style has text children")
                            };
                            self.to.write_string(text.text(self.source_text))
                        })
                        .collect();
                    self.join(&parts)
                }
                None => self.server_list(tree.children(element.children)),
            };
            if let Some((value, raw)) = editable {
                let fallback = self.to.arrow(&[], children, true, false, SYNTHETIC);
                let raw = self.to.write_boolean(raw, SYNTHETIC);
                children = self.server_call("$$content_server", &[value, fallback, raw]);
            }
            if let Some(tag) = dynamic {
                let close = self.to.write_string("</");
                let end = self.to.write_string(">");
                let content = self.join(&[children, close, tag, end]);
                let test = self.server_call("$$is_void", &[tag]);
                let empty = self.to.write_string("");
                output.push(self.to.cond(test, empty, content, SYNTHETIC));
            } else {
                output.push(children);
                output.push(self.to.write_string(&format!("</{tag}>")));
            }
        }
        let content = self.join(&output);
        if let Some(tag) = dynamic {
            let source = self.dynamic_tag(identifier);
            asynchronous |= super::super::asynchronous::has_await(&self.input.javascript, source);
            let value = self.expression(source);
            let declaration = self.to.let_(flag::CONST, tag, Some(value));
            let empty = self.to.write_string("");
            let content = self.to.cond(tag, content, empty, SYNTHETIC);
            let content = if asynchronous {
                self.server_call("$$resolve_html", &[content])
            } else {
                content
            };
            let return_ = self.to.return_(Some(content), SYNTHETIC);
            let block = self.to.block(&[declaration, return_], SYNTHETIC);
            let function = self.to.arrow(&[], block, false, asynchronous, SYNTHETIC);
            return self.to.call0(function, &[]);
        }
        self.server_async(content, asynchronous)
    }

    pub(super) fn server_async(
        &mut self,
        content: NodeIdentifier,
        asynchronous: bool,
    ) -> NodeIdentifier {
        if !asynchronous {
            return content;
        }
        let value = self.server_call("$$resolve_html", &[content]);
        let getter = self.to.arrow(&[], value, true, true, SYNTHETIC);
        self.to.call0(getter, &[])
    }

    fn join(&mut self, parts: &[NodeIdentifier]) -> NodeIdentifier {
        let array = self.to.array(parts, SYNTHETIC);
        self.server_call("$$join", &[array])
    }

    fn server_call(&mut self, name: &str, arguments: &[NodeIdentifier]) -> NodeIdentifier {
        let callee = self.to.identifier(name);
        self.to.call0(callee, arguments)
    }
}

fn escape(text: &str) -> String {
    let mut output = String::with_capacity(text.len());
    for character in text.chars() {
        match character {
            '&' => output.push_str("&amp;"),
            '<' => output.push_str("&lt;"),
            '"' => output.push_str("&quot;"),
            character => output.push(character),
        }
    }
    output
}
