use oxc_ast::ast::{BinaryOperator, Expression, VariableDeclarationKind};
use oxc_span::SPAN;
use rsvelte_svelte_compile::render_plan::Namespace;
use rsvelte_vue_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, Element, NodeKind, PropertyKind, TagType,
};
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName};

use super::{Body, Emitter, effects};

const SVG: &str = "http://www.w3.org/2000/svg";
const MATHML: &str = "http://www.w3.org/1998/Math/MathML";

impl<'o> Emitter<'_, 'o> {
    pub(super) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let NodeKind::Element(element) = &self.tree.node(identifier).kind else {
            unreachable!("called on an element")
        };
        let tag = element.tag.text(self.source_text);
        match tag {
            "slot" if self.t.template.custom_element.is_some() => return self.slot(element, body),
            "$$Text" | "$$TextareaText" | "$$PreText" => return self.static_text(element, body),
            "$$Boundary" => {
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
                return self.component(identifier, body);
            }
            "$$Component" => return self.component(identifier, body),
            "svelte:element" => return self.dynamic_element(identifier, body),
            _ => {}
        }
        self.element_body(identifier, body, None)
    }

    /// `<svelte:element this={tag}>`: a fragment keyed by the tag, the element made for it.
    fn dynamic_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let source = self.source(
            self.bound(identifier, Some("$$tag"))
                .expect("a dynamic tag"),
        );
        let value = self.render_expression(source, body);
        let tag = self.name();
        body.push(b.declaration(
            VariableDeclarationKind::Let,
            [b.declarator(b.binding(&tag), None)],
        ));
        let getter = self.arrow(b.assign_name(&tag, value));
        let document = || b.id("document");
        let node = match self.namespace(identifier) {
            Namespace::Html => {
                let markup = b.call(b.member(document(), "createElement"), [b.id(&tag)]);
                let svg = b.call(
                    b.member(document(), "createElementNS"),
                    [b.string(SVG), b.id(&tag)],
                );
                let test = b.binary(b.id(&tag), BinaryOperator::StrictEquality, b.string("svg"));
                Expression::new_conditional_expression(SPAN, test, svg, markup, b)
            }
            namespace => {
                let uri = if namespace == Namespace::Svg {
                    SVG
                } else {
                    MATHML
                };
                b.call(
                    b.member(document(), "createElementNS"),
                    [b.string(uri), b.id(&tag)],
                )
            }
        };
        let mut content = Body::default();
        let node = self.declare(node, &mut content);
        let node = self.element_body(identifier, &mut content, Some(node));
        let mut statements = content.finish(b);
        statements.push(b.return_(Some(node)));
        let present = self.run(statements, false);
        let render =
            Expression::new_conditional_expression(SPAN, b.id(&tag), present, b.array([]), b);
        let render = self.arrow(render);
        let fragment = self.keyed_fragment(getter, render);
        b.id(&self.declare(fragment, body))
    }

    fn element_body(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
        dynamic: Option<String>,
    ) -> Expression<'o> {
        let b = self.b;
        let tree = self.tree;
        let NodeKind::Element(el) = &tree.node(identifier).kind else {
            unreachable!("an element")
        };
        let tag = el.tag.text(self.source_text);
        let namespace = self.namespace(identifier);
        if let Some(special) = self.special_element(identifier, el, tag, body) {
            return special;
        }
        let global = matches!(tag, "svelte:window" | "svelte:document" | "svelte:body");
        let dynamic = if dynamic.is_none() && namespace == Namespace::Html && tag.contains('-') {
            let element = b.call(b.member(b.id("document"), "createElement"), [b.string(tag)]);
            Some(self.declare(element, body))
        } else {
            dynamic
        };
        let node: Expression<'o> = if let Some(node) = &dynamic {
            for property in tree.props(el.props) {
                if let PropertyKind::Attribute { name, value } = &property.kind {
                    let value = value
                        .as_ref()
                        .map_or("", |value| value.text(self.source_text));
                    let set = self.call(
                        "setAttr",
                        [
                            b.id(node),
                            b.string(name.text(self.source_text)),
                            b.string(value),
                        ],
                    );
                    body.push(b.statement(set));
                }
            }
            b.id(node)
        } else if global {
            match tag {
                "svelte:window" => b.id("window"),
                "svelte:document" => b.id("document"),
                _ => b.member(b.id("document"), "body"),
            }
        } else {
            let markup = self.markup(el, tag);
            b.id(&self.template(&markup, namespace, body))
        };
        let attribute_order = self.reserve_effect_order();
        let child_ids = tree.children(el.children);
        let children = if tag == "textarea"
            && let [child] = child_ids
            && let NodeKind::Interpolation { expression } = tree.node(*child).kind
        {
            let value = self.render_expression(self.source(expression), body);
            let call = b.call(b.id("$$value"), [self.copy_output(&node), value]);
            self.effect(call, true, body);
            Vec::new()
        } else {
            self.list(child_ids, body)
        };
        if !children.is_empty() {
            let parent = if tag == "template" && namespace == Namespace::Html {
                b.member(self.copy_output(&node), "content")
            } else {
                self.copy_output(&node)
            };
            let insert = self.call("insert", [b.array(children), parent]);
            body.push(b.statement(insert));
        }
        let previous_order = self.attribute_effect_order.replace(attribute_order);
        self.element_directives(el, &node, namespace, body);
        self.attribute_effect_order = previous_order;
        if global { b.array([]) } else { node }
    }

    /// A tag the template translation made, or one Vue does not render as an element.
    fn special_element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        el: &Element,
        tag: &str,
        body: &mut Body<'o>,
    ) -> Option<Expression<'o>> {
        let b = self.b;
        let tree = self.tree;
        Some(match tag {
            "$$Title" => {
                let value = self.title_text(identifier, body);
                let assignment = b.assign_member(b.member(b.id("document"), "title"), value);
                let callback = self.tracked_callback(self.arrow(assignment));
                let effect = self.call("watchPostEffect", [callback]);
                body.push(b.statement(effect));
                b.array([])
            }
            "$$Scope" => self.scope(identifier, false),
            "$$Snippet" => {
                let declaration = self.snippet_declaration(identifier, false);
                body.push(declaration);
                b.array([])
            }
            "$$Render" => self.render_snippet(identifier, body),
            "$$Await" => self.await_block(identifier, body),
            "$$RawMarkup" => self.raw_markup(identifier, body),
            "template" if el.tag_type == TagType::Template => {
                let children = self.list(tree.children(el.children), body);
                b.array(children)
            }
            "svelte:head" => {
                let nodes = self.list(tree.children(el.children), body);
                let nodes = b.array(nodes);
                let head = || b.member(b.id("document"), "head");
                let insert = self.call("insert", [self.copy_output(&nodes), head()]);
                body.push(b.statement(insert));
                let cleanup = self.call("remove", [nodes, head()]);
                let dispose = self.call("onScopeDispose", [self.arrow(cleanup)]);
                body.push(b.statement(dispose));
                b.array([])
            }
            _ => return None,
        })
    }

    /// An element's `bind:` and `on` directives.
    fn element_directives(
        &mut self,
        el: &Element,
        node: &Expression<'o>,
        namespace: Namespace,
        body: &mut Body<'o>,
    ) {
        let b = self.b;
        let tree = self.tree;
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
                    let value = self.callback_expression(self.source(expression), body);
                    let dom = effects::dom_callback(&value);
                    let reads =
                        dom.then(|| effects::reads(&value, &self.memoized, &self.dom_callbacks));
                    let callback = self.declare(value, body);
                    if let Some(reads) = reads {
                        self.dom_callbacks.insert(callback.clone(), reads);
                    }
                    let call = b.call(b.id(&callback), [self.copy_output(node)]);
                    self.effect(call, dom, body);
                    let cleanup = self.arrow(b.call(b.id(&callback), [b.null()]));
                    let dispose = self.call("onScopeDispose", [cleanup]);
                    body.push(b.statement(dispose));
                }
                (DirectiveName::Bind, Some(arg)) => {
                    let value = self.render_expression(self.source(expression), body);
                    self.bind_attribute(node, namespace, arg, value, body);
                }
                (DirectiveName::On, Some(event)) => {
                    let handler = self.expression(self.source(expression));
                    let call = self.call("on", [self.copy_output(node), b.string(event), handler]);
                    body.push(b.statement(call));
                }
                _ => {}
            }
        }
    }

    /// `:arg="value"` on an element: its DOM update.
    fn bind_attribute(
        &mut self,
        node: &Expression<'o>,
        namespace: Namespace,
        arg: &str,
        value: Expression<'o>,
        body: &mut Body<'o>,
    ) {
        let b = self.b;
        if arg == "style" {
            let call = self.call("setStyle", [self.copy_output(node), value]);
            self.effect(call, true, body);
            return;
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
            let set = b.assign_member(b.member(self.copy_output(node), property), value);
            self.effect(set, true, body);
            return;
        }
        let helper = if boolean { "setDOMProp" } else { "setAttr" };
        let mut arguments = vec![self.copy_output(node), b.string(property), value];
        if namespace == Namespace::Svg && !boolean {
            arguments.push(b.boolean(true));
        }
        let call = self.call(helper, arguments);
        self.effect(call, true, body);
    }

    /// `<tag a="v">`: the element's static markup.
    fn markup(&self, el: &Element, tag: &str) -> String {
        let mut markup = format!("<{tag}");
        for p in self.tree.props(el.props) {
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
        markup
    }

    /// `{#await}`: the promise's state as a cell, then the branch its status picks.
    fn await_block(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let NodeKind::Element(el) = &self.tree.node(identifier).kind else {
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
        let state = &parameters.items[0];
        let oxc_ast::ast::BindingPattern::BindingIdentifier(state) = &state.pattern else {
            unreachable!("await's state is a name")
        };
        let source = self.expression(self.source(each.source));
        let has_catch = self.expression(self.source(self.bound(identifier, None).expect("catch")));
        let value = b.call(b.id("$$await_block"), [self.arrow(source), has_catch]);
        body.push(b.const_(&state.name, value));
        let symbol = state.symbol_id.get().expect("await's state has a symbol");
        self.cells.insert(symbol);
        let children = self.list(self.tree.children(el.children), body);
        self.cells.remove(&symbol);
        b.array(children)
    }

    /// `{@html}`: a fragment keyed by the markup, its nodes parsed from it.
    fn raw_markup(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let source = self.source(
            self.bound(identifier, None)
                .expect("raw markup has a value"),
        );
        let value = self.render_expression(source, body);
        let key = self.arrow(self.copy_output(&value));
        let mut arguments = vec![value];
        match self.namespace(identifier) {
            Namespace::Html => {}
            Namespace::Svg => arguments.push(b.string(SVG)),
            Namespace::Mathml => arguments.push(b.string(MATHML)),
        }
        let render = self.arrow(b.call(b.id("$$raw_markup"), arguments));
        let fragment = self.keyed_fragment(key, render);
        b.id(&self.declare(fragment, body))
    }

    fn static_text(&mut self, element: &Element, body: &mut Body<'o>) -> Expression<'o> {
        let b = self.b;
        let property = &self.tree.props(element.props)[0];
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
        b.id(&self.declare(b.member(b.id(&wrapper), "firstChild"), body))
    }

    /// A `<title>`'s text: its parts joined.
    pub(super) fn title_text(
        &mut self,
        identifier: CompilerNodeIdentifier,
        body: &mut Body<'o>,
    ) -> Expression<'o> {
        let b = self.b;
        let NodeKind::Element(element) = &self.tree.node(identifier).kind else {
            unreachable!("a title is an element")
        };
        let values: Vec<_> = self
            .tree
            .children(element.children)
            .iter()
            .map(|&child| match &self.tree.node(child).kind {
                NodeKind::Text(text) => b.string(text.text(self.source_text)),
                &NodeKind::Interpolation { expression } => {
                    let source = self.source(expression);
                    if self.t.server {
                        self.expression(source)
                    } else {
                        self.render_expression(source, body)
                    }
                }
                NodeKind::Comment { .. } => b.string(""),
                NodeKind::Element(_) => unreachable!("titles contain text and expressions"),
            })
            .collect();
        b.call(b.member(b.array(values), "join"), [b.string("")])
    }
}

fn boolean_property(attribute: &str) -> &str {
    rsvelte_markup_syntax::property_name(attribute).unwrap_or(attribute)
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
