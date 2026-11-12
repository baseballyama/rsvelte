use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{Expression, ObjectPropertyKind, Statement};
use oxc_span::SPAN;
use rsvelte_vue_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, Element, NodeKind, PropertyKind, TagType,
};
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Body, Emitter, method};
use crate::compilation::asynchronous::has_await;

impl<'o> Emitter<'_, 'o> {
    /// `{ renderContent }` for setup to return, and the `ssrRender` that prints it.
    pub(super) fn server_setup(
        &mut self,
        body: &mut Body<'o>,
        fields: &mut Vec<ObjectPropertyKind<'o>>,
    ) -> Expression<'o> {
        let b = self.b;
        let mut content = self.server_list(self.tree.root());
        if self.t.css_mode == super::super::template::CssMode::Injected
            && self.t.template.custom_element.is_none()
            && self.t.stylesheet.is_some()
        {
            self.helpers.insert("useSSRContext");
            let [hash, stylesheet] = self.stylesheet_values();
            let style = b.call(
                b.id("$$render_css"),
                [b.id("$$ssr_context"), hash, stylesheet],
            );
            content = self.join(vec![style, content]);
        }
        if self.helpers.contains("useSSRContext") {
            let renderer = self.call("useSSRContext", []);
            body.insert(b.const_("$$ssr_context", renderer));
        }
        let content = if self.t.destroy {
            body.insert(b.const_("$$destroy", b.array([])));
            b.call(
                b.id("$$render_destroy"),
                [self.arrow(content), b.id("$$destroy")],
            )
        } else {
            content
        };
        let render = b.arrow(b.parameters(["$$ssr_parent"]), content);
        let printed = b.call(b.member(b.id("_ctx"), "renderContent"), [b.id("_parent")]);
        let push = b.statement(b.call(b.id("_push"), [printed]));
        let ssr_render = b.function_expression(
            None,
            b.parameters(["_ctx", "_push", "_parent"]),
            [push],
            false,
        );
        fields.push(method(b, "ssrRender", ssr_render));
        b.object([b.init("renderContent", render)])
    }

    pub(super) fn server_list(&mut self, nodes: &[CompilerNodeIdentifier]) -> Expression<'o> {
        let mut output = Vec::with_capacity(nodes.len());
        let mut declarations = Vec::new();
        let mut index = 0;
        while index < nodes.len() {
            if self.tag(nodes[index]) == "$$Snippet" {
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
        let content = self.join(output);
        if declarations.is_empty() {
            return content;
        }
        declarations.push(self.b.return_(Some(content)));
        self.run(declarations, false)
    }

    fn server_if(&mut self, nodes: &[CompilerNodeIdentifier]) -> Expression<'o> {
        let b = self.b;
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
        let condition = self.source(condition);
        let asynchronous = has_await(condition);
        let condition = self.expression(condition);
        let otherwise = if nodes.len() > 1 {
            self.server_if(&nodes[1..])
        } else {
            b.string("")
        };
        let result = Expression::new_conditional_expression(SPAN, condition, content, otherwise, b);
        self.server_async(result, asynchronous)
    }

    fn server_node(&mut self, identifier: CompilerNodeIdentifier) -> Expression<'o> {
        let b = self.b;
        if self.t.template.scopes.contains(&identifier) {
            return self.scope(identifier, true);
        }
        if self.tag(identifier) == "$$Await" {
            return self.server_await(identifier);
        }
        if let Some(directive) = self.structural(identifier, DirectiveName::For) {
            let DirectiveExpression::For(each) = &directive.exp else {
                unreachable!("a loop directive")
            };
            let source = self.source(each.source);
            let asynchronous = has_await(source);
            let source = self.expression(source);
            let parameters = self.res.tree().get_parameters(each.parameters);
            let mut parameters = parameters.clone_in_with_semantic_ids(b.allocator());
            for parameter in &mut parameters.items {
                self.rewrite_parameter(parameter);
            }
            let content = self.server_element(identifier);
            let callback = b.arrow(b.alloc(parameters), content);
            let list = b.call(b.member(source, "map"), [callback]);
            let result = b.call(b.id("$$join"), [list]);
            return self.server_async(result, asynchronous);
        }
        match &self.tree.node(identifier).kind {
            NodeKind::Element(_) => self.server_element(identifier),
            NodeKind::Text(text) => b.string(&escape(text.text(self.source_text))),
            &NodeKind::Interpolation { expression } => {
                let source = self.source(expression);
                let value = self.expression(source);
                let escaped = b.call(b.id("$$escape"), [value]);
                if has_await(source) {
                    b.call(crate::script::async_arrow(b, escaped), [])
                } else {
                    escaped
                }
            }
            NodeKind::Comment { .. } => b.string(""),
        }
    }

    /// `{#await}` on the server: the promise's settled state, then its children.
    fn server_await(&mut self, identifier: CompilerNodeIdentifier) -> Expression<'o> {
        let b = self.b;
        let NodeKind::Element(element) = &self.tree.node(identifier).kind else {
            unreachable!("an element")
        };
        let DirectiveExpression::For(each) = &self
            .structural(identifier, DirectiveName::For)
            .expect("await has a scope")
            .exp
        else {
            unreachable!("await's state is a loop's")
        };
        let parameters = self.res.tree().get_parameters(each.parameters);
        let state = parameters.items[0].pattern.clone_in(b.allocator());
        let source = self.expression(self.source(each.source));
        let value = b.call(b.id("$$await_server"), [source]);
        let declaration = b.declaration(
            oxc_ast::ast::VariableDeclarationKind::Const,
            [b.declarator(state, Some(value))],
        );
        let content = self.server_list(self.tree.children(element.children));
        self.run(vec![declaration, b.return_(Some(content))], false)
    }

    fn server_element(&mut self, identifier: CompilerNodeIdentifier) -> Expression<'o> {
        let b = self.b;
        let tree = self.tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!("an element")
        };
        let tag = element.tag.text(self.source_text);
        let children = tree.children(element.children);
        if let Some(special) = self.server_special(identifier, element, tag) {
            return special;
        }
        let default_namespace = self.namespace(identifier) == super::Namespace::Html;
        let dynamic = tag == "svelte:element";
        let mut output = if dynamic {
            vec![b.string("<"), b.id("$$tag")]
        } else {
            vec![b.string(&format!("<{tag}"))]
        };
        let OpenTag {
            mut asynchronous,
            textarea,
            editable,
        } = self.server_attributes(element, tag, default_namespace, &mut output);
        output.push(b.string(">"));
        if !rsvelte_markup_syntax::is_void(tag) {
            let mut content = match textarea {
                Some(value) => b.call(b.id("$$escape"), [value]),
                None if tag == "style" => {
                    let parts = children
                        .iter()
                        .map(|&child| {
                            let NodeKind::Text(text) = &tree.node(child).kind else {
                                unreachable!("a style has text children")
                            };
                            b.string(text.text(self.source_text))
                        })
                        .collect();
                    self.join(parts)
                }
                None => self.server_list(children),
            };
            if let Some((value, raw)) = editable {
                content = b.call(
                    b.id("$$content_server"),
                    [value, self.arrow(content), b.boolean(raw)],
                );
            }
            if dynamic {
                let content =
                    self.join(vec![content, b.string("</"), b.id("$$tag"), b.string(">")]);
                let test = b.call(b.id("$$is_void"), [b.id("$$tag")]);
                output.push(Expression::new_conditional_expression(
                    SPAN,
                    test,
                    b.string(""),
                    content,
                    b,
                ));
            } else {
                output.push(content);
                output.push(b.string(&format!("</{tag}>")));
            }
        }
        let content = self.join(output);
        if !dynamic {
            return self.server_async(content, asynchronous);
        }
        let source = self.source(
            self.bound(identifier, Some("$$tag"))
                .expect("a dynamic tag"),
        );
        asynchronous |= has_await(source);
        let value = self.expression(source);
        let content =
            Expression::new_conditional_expression(SPAN, b.id("$$tag"), content, b.string(""), b);
        let content = if asynchronous {
            b.call(b.id("$$resolve_html"), [content])
        } else {
            content
        };
        let statements: Vec<Statement<'o>> =
            vec![b.const_("$$tag", value), b.return_(Some(content))];
        self.run(statements, asynchronous)
    }

    /// A tag the template translation made, or one with no markup of its own.
    fn server_special(
        &mut self,
        identifier: CompilerNodeIdentifier,
        element: &Element,
        tag: &str,
    ) -> Option<Expression<'o>> {
        let b = self.b;
        let tree = self.tree;
        let children = tree.children(element.children);
        Some(match tag {
            "slot" if self.t.template.custom_element.is_some() => self.server_list(children),
            "$$Boundary" => self.server_boundary(identifier),
            "$$Component" => self.server_component(identifier),
            "$$Title" => {
                self.helpers.insert("useSSRContext");
                let asynchronous = children.iter().any(|&child| {
                    matches!(tree.node(child).kind, NodeKind::Interpolation { expression }
                        if has_await(self.source(expression)))
                });
                let value = self.title_text(identifier, &mut Body::default());
                let result = b.call(b.id("$$render_title"), [b.id("$$ssr_context"), value]);
                self.server_async(result, asynchronous)
            }
            "$$Render" | "$$RawMarkup" => self.server_value(identifier),
            "svelte:window" | "svelte:document" | "svelte:body" => b.string(""),
            "svelte:head" => {
                self.helpers.insert("useSSRContext");
                let content = self.server_list(children);
                b.call(b.id("$$render_head"), [b.id("$$ssr_context"), content])
            }
            "template" if element.tag_type == TagType::Template => self.server_list(children),
            _ => return None,
        })
    }

    /// A render tag or raw markup: its bound value.
    fn server_value(&mut self, identifier: CompilerNodeIdentifier) -> Expression<'o> {
        let source = self.source(self.bound(identifier, None).expect("a value"));
        let value = self.expression(source);
        self.server_async(value, has_await(source))
    }

    /// The attributes of an element's opening tag, pushed to `output`.
    fn server_attributes(
        &mut self,
        element: &Element,
        tag: &str,
        default_namespace: bool,
        output: &mut Vec<Expression<'o>>,
    ) -> OpenTag<'o> {
        let b = self.b;
        let tree = self.tree;
        let mut tag_parts = OpenTag {
            asynchronous: false,
            textarea: None,
            editable: None,
        };
        let mut styles = Vec::new();
        for property in tree.props(element.props) {
            match &property.kind {
                PropertyKind::Attribute { name, value } => {
                    let name = name.text(self.source_text);
                    let value = value.as_ref().map(|value| value.text(self.source_text));
                    if name == "style" {
                        styles.push(b.string(value.unwrap_or("")));
                        continue;
                    }
                    let text = value.map_or_else(
                        || format!(" {name}"),
                        |value| format!(" {name}=\"{}\"", escape(value)),
                    );
                    output.push(b.string(&text));
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
                    let source = self.source(expression);
                    tag_parts.asynchronous |= has_await(source);
                    let value = self.expression(source);
                    match name {
                        Some(content @ ("$$html_content" | "$$text_content")) => {
                            tag_parts.editable = Some((value, content == "$$html_content"));
                        }
                        Some("value") if tag == "textarea" => tag_parts.textarea = Some(value),
                        Some("style") => styles.push(value),
                        Some(name) => {
                            let name = if name == "CLASS" { "class" } else { name };
                            let mut arguments = vec![b.string(name), value];
                            if !default_namespace {
                                arguments.push(b.boolean(false));
                            }
                            output.push(b.call(b.id("$$attribute"), arguments));
                        }
                        None => {
                            let mut arguments = vec![value];
                            if !default_namespace {
                                arguments.push(b.boolean(false));
                            }
                            output.push(b.call(b.id("$$attributes_text"), arguments));
                        }
                    }
                }
                PropertyKind::Directive(_) => {}
            }
        }
        if !styles.is_empty() {
            output.push(b.call(b.id("$$styles_text"), [b.array(styles)]));
        }
        tag_parts
    }

    pub(super) fn server_async(
        &self,
        content: Expression<'o>,
        asynchronous: bool,
    ) -> Expression<'o> {
        if !asynchronous {
            return content;
        }
        let b = self.b;
        let value = b.call(b.id("$$resolve_html"), [content]);
        b.call(crate::script::async_arrow(b, value), [])
    }

    fn join(&self, parts: Vec<Expression<'o>>) -> Expression<'o> {
        self.b.call(self.b.id("$$join"), [self.b.array(parts)])
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

/// What an element's attributes leave for its content.
struct OpenTag<'o> {
    asynchronous: bool,
    /// A textarea's bound value, its content.
    textarea: Option<Expression<'o>>,
    /// A `contenteditable` binding: the value, and whether it is HTML.
    editable: Option<(Expression<'o>, bool)>,
}
