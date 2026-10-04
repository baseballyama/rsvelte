use rsvelte_vue::compiler_syntax_tree::{CompilerNodeIdentifier, NodeKind, PropertyKind};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Builder, Namespace, NodeIdentifier, SYNTHETIC};

impl Builder<'_> {
    pub(super) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let NodeKind::Element(element) = &self.input.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        if element.tag.text(self.source_text) == "slot" && self.input.custom_element.is_some() {
            return self.slot(element, body);
        }
        if matches!(
            element.tag.text(self.source_text),
            "$$Text" | "$$TextareaText" | "$$PreText"
        ) {
            return self.static_text(element, body);
        }
        if matches!(
            element.tag.text(self.source_text),
            "$$Component" | "$$Boundary"
        ) {
            if element.tag.text(self.source_text) == "$$Boundary" {
                self.helpers.extend([
                    "defineVaporComponent",
                    "shallowRef",
                    "onScopeDispose",
                    "onErrorCaptured",
                    "handleError",
                    "currentInstance",
                    "createIf",
                    "createComponent",
                    "provide",
                ]);
            }
            return self.component(identifier, body);
        }
        if element.tag.text(self.source_text) == "svelte:element" {
            let value = self.reactive_expression(self.dynamic_tag(identifier), body);
            let tag = self.name();
            body.push(
                self.to
                    .let_(rsvelte_typescript::syntax_tree::flag::LET, tag, None),
            );
            let assign = self.to.assign(
                rsvelte_typescript::operators::AssignmentOperator::Assign,
                tag,
                value,
                SYNTHETIC,
            );
            let getter = self.to.arrow(&[], assign, true, false, SYNTHETIC);
            let mut content = Vec::new();
            let document = self.to.identifier("document");
            let namespace = self
                .input
                .namespaces
                .get(&identifier)
                .copied()
                .unwrap_or(Namespace::Html);
            let node = if namespace == Namespace::Html {
                let create = self.to.dot(document, "createElement");
                let markup_element = self.to.call0(create, &[tag]);
                let create = self.to.dot(document, "createElementNS");
                let uri = self.to.write_string("http://www.w3.org/2000/svg");
                let svg = self.to.call0(create, &[uri, tag]);
                let name = self.to.write_string("svg");
                let test = self.to.binary(
                    rsvelte_typescript::operators::BinaryOperator::StrictEq,
                    tag,
                    name,
                    SYNTHETIC,
                );
                self.to.cond(test, svg, markup_element, SYNTHETIC)
            } else {
                let uri = self.to.write_string(if namespace == Namespace::Svg {
                    "http://www.w3.org/2000/svg"
                } else {
                    "http://www.w3.org/1998/Math/MathML"
                });
                let create = self.to.dot(document, "createElementNS");
                self.to.call0(create, &[uri, tag])
            };
            let node = self.declare(node, &mut content);
            let node = self.element_body(identifier, &mut content, Some(node));
            content.push(self.to.return_(Some(node), SYNTHETIC));
            let block = self.to.block(&content, SYNTHETIC);
            let present = self.to.arrow(&[], block, false, false, SYNTHETIC);
            let present = self.to.call0(present, &[]);
            let empty = self.to.array(&[], SYNTHETIC);
            let render = self.to.cond(tag, present, empty, SYNTHETIC);
            let render = self.to.arrow(&[], render, true, false, SYNTHETIC);
            let fragment = self.keyed_fragment(getter, render);
            return self.declare(fragment, body);
        }
        self.element_body(identifier, body, None)
    }

    #[expect(
        clippy::too_many_lines,
        reason = "element construction and its directives share the same DOM node"
    )]
    fn element_body(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
        dynamic: Option<NodeIdentifier>,
    ) -> NodeIdentifier {
        let tree = &self.input.compiler_syntax_tree;
        let NodeKind::Element(el) = &tree.node(identifier).kind else {
            unreachable!("an element")
        };
        let tag = el.tag.text(self.source_text);
        let namespace = self
            .input
            .namespaces
            .get(&identifier)
            .copied()
            .unwrap_or(Namespace::Html);
        if tag == "$$Title" {
            let value = self.title_text(identifier, body);
            let document = self.to.identifier("document");
            let title = self.to.dot(document, "title");
            let assignment = self.to.assign(
                rsvelte_typescript::operators::AssignmentOperator::Assign,
                title,
                value,
                SYNTHETIC,
            );
            let callback = self.to.arrow(&[], assignment, true, false, SYNTHETIC);
            let callback = self.tracked_callback(callback);
            let effect = self.call("watchPostEffect", &[callback]);
            body.push(self.to.expression_statement(effect));
            return self.to.array(&[], SYNTHETIC);
        }
        if tag == "$$Scope" {
            return self.scope(identifier, false);
        }
        if tag == "$$Snippet" {
            body.push(self.snippet_declaration(identifier, false));
            return self.to.array(&[], SYNTHETIC);
        }
        if tag == "$$Render" {
            return self.render_snippet(identifier, body);
        }
        if tag == "$$Await" {
            let DirectiveExpression::For(each) = &self
                .structural(identifier, DirectiveName::For)
                .expect("await has a scope")
                .exp
            else {
                unreachable!()
            };
            let parameter = each.parameters[0];
            let source = self.expression(each.source);
            let getter = self.to.arrow(&[], source, true, false, SYNTHETIC);
            let callee = self.to.identifier("$$await_block");
            let has_catch = self.expression(self.raw_markup_value(identifier));
            let value = self.to.call0(callee, &[getter, has_catch]);
            let parameter_node = rsvelte_typescript::copy::copy(
                &self.input.javascript,
                &mut self.to,
                &mut rsvelte_typescript::copy::Verbatim,
                parameter,
            );
            body.push(self.to.let_(
                rsvelte_typescript::syntax_tree::flag::CONST,
                parameter_node,
                Some(value),
            ));
            let binding = self
                .resolution
                .sem
                .binding_of(parameter)
                .expect("await state has a binding");
            self.loop_bindings.insert(binding);
            let children = self.list(tree.children(el.children), body);
            self.loop_bindings.remove(&binding);
            return self.to.array(&children, SYNTHETIC);
        }
        if tag == "$$RawMarkup" {
            let value = self.reactive_expression(self.raw_markup_value(identifier), body);
            let key = self.to.arrow(&[], value, true, false, SYNTHETIC);
            let callee = self.to.identifier("$$raw_markup");
            let mut arguments = vec![value];
            if namespace != Namespace::Html {
                arguments.push(self.to.write_string(if namespace == Namespace::Svg {
                    "http://www.w3.org/2000/svg"
                } else {
                    "http://www.w3.org/1998/Math/MathML"
                }));
            }
            let content = self.to.call0(callee, &arguments);
            let render = self.to.arrow(&[], content, true, false, SYNTHETIC);
            let fragment = self.keyed_fragment(key, render);
            return self.declare(fragment, body);
        }
        if tag == "template" && el.tag_type == rsvelte_vue::compiler_syntax_tree::TagType::Template
        {
            let children = self.list(tree.children(el.children), body);
            return self.to.array(&children, SYNTHETIC);
        }
        let global = matches!(tag, "svelte:window" | "svelte:document" | "svelte:body");
        if tag == "svelte:head" {
            let nodes = self.list(tree.children(el.children), body);
            let nodes = self.to.array(&nodes, SYNTHETIC);
            let head = self.to.identifier("document");
            let head = self.to.dot(head, "head");
            let insert = self.call("insert", &[nodes, head]);
            body.push(self.to.expression_statement(insert));
            let cleanup = self.call("remove", &[nodes, head]);
            let cleanup = self.to.arrow(&[], cleanup, true, false, SYNTHETIC);
            let dispose = self.call("onScopeDispose", &[cleanup]);
            body.push(self.to.expression_statement(dispose));
            return self.to.array(&[], SYNTHETIC);
        }
        let mut markup = format!("<{tag}");
        for p in tree.props(el.props) {
            if let PropertyKind::Attribute { name, value } = &p.kind {
                markup.push(' ');
                markup.push_str(name.text(self.source_text));
                if let Some(value) = value {
                    markup.push_str("=\"");
                    escape_attribute(value.text(self.source_text), &mut markup);
                    markup.push('"');
                }
            }
        }
        markup.push('>');
        let dynamic = if dynamic.is_none() && namespace == Namespace::Html && tag.contains('-') {
            let document = self.to.identifier("document");
            let create = self.to.dot(document, "createElement");
            let name = self.to.write_string(tag);
            let element = self.to.call0(create, &[name]);
            Some(self.declare(element, body))
        } else {
            dynamic
        };
        let node = if let Some(node) = dynamic {
            for property in tree.props(el.props) {
                if let PropertyKind::Attribute { name, value } = &property.kind {
                    let name = self.to.write_string(name.text(self.source_text));
                    let value = self.to.write_string(
                        value
                            .as_ref()
                            .map_or("", |value| value.text(self.source_text)),
                    );
                    let set = self.call("setAttr", &[node, name, value]);
                    body.push(self.to.expression_statement(set));
                }
            }
            node
        } else if global {
            match tag {
                "svelte:window" => self.to.identifier("window"),
                "svelte:document" => self.to.identifier("document"),
                "svelte:body" => {
                    let document = self.to.identifier("document");
                    self.to.dot(document, "body")
                }
                _ => unreachable!(),
            }
        } else {
            self.template(&markup, namespace, body)
        };
        let attribute_order = self.reserve_effect_order();
        let child_ids = tree.children(el.children);
        let children = if tag == "textarea"
            && let [child] = child_ids
            && let NodeKind::Interpolation { expression } = tree.node(*child).kind
        {
            let value = self.reactive_expression(expression, body);
            let setter = self.to.identifier("$$value");
            let call = self.to.call0(setter, &[node, value]);
            self.effect(call, body);
            Vec::new()
        } else {
            self.list(child_ids, body)
        };
        if !children.is_empty() {
            let children = self.to.array(&children, SYNTHETIC);
            let parent = if tag == "template" && namespace == Namespace::Html {
                self.to.dot(node, "content")
            } else {
                node
            };
            let insert = self.call("insert", &[children, parent]);
            body.push(self.to.expression_statement(insert));
        }
        let previous_order = self.attribute_effect_order.replace(attribute_order);
        for p in tree.props(el.props) {
            let PropertyKind::Directive(d) = &p.kind else {
                continue;
            };
            let DirectiveExpression::Expression(expression) = d.exp else {
                continue;
            };
            let arg = d.arg.as_ref().map(|a| a.text(self.source_text));
            match (d.name, arg) {
                (DirectiveName::Bind, Some("$$key" | "$$tag")) => {}
                (DirectiveName::Bind, Some("$$ref")) => {
                    let value = self.callback_expression(expression, body);
                    let dom = super::effects::dom_callback(&self.to, value);
                    let callback = self.declare(value, body);
                    if dom {
                        self.dom_callbacks.insert(callback, value);
                    }
                    let call = self.to.call0(callback, &[node]);
                    self.effect(call, body);
                    let null = self.to.null(SYNTHETIC);
                    let cleanup = self.to.call0(callback, &[null]);
                    let cleanup = self.to.arrow(&[], cleanup, true, false, SYNTHETIC);
                    let dispose = self.call("onScopeDispose", &[cleanup]);
                    body.push(self.to.expression_statement(dispose));
                }
                (DirectiveName::Bind, Some(arg)) => {
                    let value = self.reactive_expression(expression, body);
                    if arg == "style" {
                        let call = self.call("setStyle", &[node, value]);
                        self.effect(call, body);
                        continue;
                    }
                    let boolean = rsvelte_svelte_compile::lower::is_boolean_attribute(arg);
                    let property = if boolean {
                        boolean_property(arg)
                    } else if arg == "CLASS" {
                        "class"
                    } else {
                        arg
                    };
                    if matches!(arg, "checked" | "selected") {
                        let target = self.to.dot(node, property);
                        let set = self.to.assign(
                            rsvelte_typescript::operators::AssignmentOperator::Assign,
                            target,
                            value,
                            SYNTHETIC,
                        );
                        self.effect(set, body);
                        continue;
                    }
                    let name = self.to.write_string(property);
                    let helper = if boolean { "setDOMProp" } else { "setAttr" };
                    let call = if namespace == Namespace::Svg && !boolean {
                        let svg = self.to.write_boolean(true, SYNTHETIC);
                        self.call(helper, &[node, name, value, svg])
                    } else {
                        self.call(helper, &[node, name, value])
                    };
                    self.effect(call, body);
                }
                (DirectiveName::On, Some(event)) => {
                    let handler = self.expression(expression);
                    let name = self.to.write_string(event);
                    let call = self.call("on", &[node, name, handler]);
                    body.push(self.to.expression_statement(call));
                }
                _ => {}
            }
        }
        self.attribute_effect_order = previous_order;
        if global {
            self.to.array(&[], SYNTHETIC)
        } else {
            node
        }
    }
}

impl Builder<'_> {
    pub(super) fn dynamic_tag(&self, identifier: CompilerNodeIdentifier) -> NodeIdentifier {
        let NodeKind::Element(element) = &self.input.compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        self.input
            .compiler_syntax_tree
            .props(element.props)
            .iter()
            .find_map(|property| match &property.kind {
                PropertyKind::Directive(directive)
                    if directive
                        .arg
                        .as_ref()
                        .is_some_and(|name| name.text(self.source_text) == "$$tag") =>
                {
                    match directive.exp {
                        DirectiveExpression::Expression(expression) => Some(expression),
                        _ => None,
                    }
                }
                PropertyKind::Attribute { .. } | PropertyKind::Directive(_) => None,
            })
            .expect("a dynamic element has a tag")
    }

    fn static_text(
        &mut self,
        element: &rsvelte_vue::compiler_syntax_tree::Element,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let property = &self.input.compiler_syntax_tree.props(element.props)[0];
        let PropertyKind::Attribute {
            value: Some(value), ..
        } = &property.kind
        else {
            unreachable!("static text has its raw HTML")
        };
        let tag = match element.tag.text(self.source_text) {
            "$$TextareaText" => "textarea",
            "$$PreText" => "pre",
            _ => "span",
        };
        // Vapor treats a text-only template as a literal string.
        let markup = format!("<{tag}>{}</{tag}>", value.text(self.source_text));
        let wrapper = self.template(&markup, Namespace::Html, body);
        let text = self.to.dot(wrapper, "firstChild");
        self.declare(text, body)
    }

    pub(super) fn raw_markup_value(&self, identifier: CompilerNodeIdentifier) -> NodeIdentifier {
        let tree = &self.input.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!()
        };
        tree.props(element.props)
            .iter()
            .find_map(|property| match &property.kind {
                PropertyKind::Directive(directive) => match directive.exp {
                    DirectiveExpression::Expression(expression) => Some(expression),
                    _ => None,
                },
                PropertyKind::Attribute { .. } => None,
            })
            .expect("raw markup has a value")
    }

    pub(super) fn title_text(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Vec<NodeIdentifier>,
    ) -> NodeIdentifier {
        let tree = &self.input.compiler_syntax_tree;
        let NodeKind::Element(element) = &tree.node(identifier).kind else {
            unreachable!()
        };
        let values: Vec<_> = tree
            .children(element.children)
            .iter()
            .map(|&child| match &tree.node(child).kind {
                NodeKind::Text(text) => self.to.write_string(text.text(self.source_text)),
                NodeKind::Interpolation { expression } => {
                    if self.input.server {
                        self.expression(*expression)
                    } else {
                        self.reactive_expression(*expression, body)
                    }
                }
                NodeKind::Comment { .. } => self.to.write_string(""),
                NodeKind::Element(_) => unreachable!("titles contain text and expressions"),
            })
            .collect();
        let values = self.to.array(&values, SYNTHETIC);
        let join = self.to.dot(values, "join");
        let separator = self.to.write_string("");
        self.to.call0(join, &[separator])
    }
}

fn boolean_property(attribute: &str) -> &str {
    match attribute {
        "readonly" => "readOnly",
        "formnovalidate" => "formNoValidate",
        "novalidate" => "noValidate",
        "ismap" => "isMap",
        "allowfullscreen" => "allowFullscreen",
        "nomodule" => "noModule",
        "playsinline" => "playsInline",
        "disablepictureinpicture" => "disablePictureInPicture",
        "disableremoteplayback" => "disableRemotePlayback",
        name => name,
    }
}

fn escape_attribute(value: &str, out: &mut String) {
    for c in value.chars() {
        match c {
            '&' => out.push_str("&amp;"),
            '"' => out.push_str("&quot;"),
            '<' => out.push_str("&lt;"),
            c => out.push(c),
        }
    }
}
