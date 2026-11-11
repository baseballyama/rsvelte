use std::borrow::Cow;

use oxc_ast::ast::{BinaryOperator, Expression};

use super::{
    Attribute, AttributeValue, CompilerNodeIdentifier, DirectiveExpression, DirectiveName, Helper,
    Item, Name, Namespace, NodeKind, Parent, Part, R, Span, Steps, Template, directive, spelled,
    unsupported, vue,
};
use crate::compilation::string_key;

/// Svelte's `LOAD_ERROR_ELEMENTS`: its server marks `onload` / `onerror` on them so that the
/// client can replay an event that fired before hydration.
const LOAD_ERROR_ELEMENTS: &[&str] = &[
    "body", "embed", "iframe", "img", "link", "object", "script", "style", "track",
];

/// A `<textarea>`'s `value` of text and expressions, which Svelte renders as its content.
pub(super) fn textarea_value<'a>(
    tag: &str,
    attributes: &'a [Attribute],
    source_text: &str,
) -> Option<&'a [Part]> {
    if tag != "textarea" {
        return None;
    }
    attributes.iter().find_map(|a| match &a.value {
        AttributeValue::Interpolated(parts) if a.name.text(source_text) == "value" => {
            Some(&**parts)
        }
        _ => None,
    })
}

impl<'t> Template<'_, '_, 't> {
    pub(super) fn element(
        &mut self,
        identifier: CompilerNodeIdentifier,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        preserve_whitespace: bool,
        lead: Vec<vue::Property>,
        extra: Option<vue::Property>,
    ) -> R<vue::CompilerNodeIdentifier> {
        let (compiler_syntax_tree, source_text) = (self.i.compiler_syntax_tree, self.i.source_text);
        let node = compiler_syntax_tree.node(identifier);
        let NodeKind::Element(el) = &node.kind else {
            unreachable!("called on an element")
        };
        if el.kind == super::ElementKind::Component
            || el.name.text(source_text) == "svelte:boundary"
        {
            return self.component(identifier, vue_parent, lead, extra);
        }
        let tag = el.name.text(source_text);
        let attributes = compiler_syntax_tree.attributes(el.attributes);
        let namespace = self
            .i
            .plan
            .namespaces
            .as_ref()
            .expect("translation uses a checked plan")
            .get(identifier);
        let scope = self.i.analysis.scoped[identifier]
            .then_some(self.stylesheet_hash)
            .flatten();
        let mut props = lead;
        if tag == "svelte:element" {
            let attribute =
                &compiler_syntax_tree.attributes[el.this.expect("a dynamic element has this")];
            let value = match &attribute.value {
                AttributeValue::Static(value) => self.b.string(value),
                AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression) => self.template_expression(*expression),
                _ => {
                    return Err(unsupported(
                        "this value of a dynamic element",
                        attribute.span,
                    ));
                }
            };
            props.push(self.bound("$$tag", el.name, value, attribute.span));
        }
        let mut steps = Steps::default();
        let select_target = self.element_attributes(
            (tag, namespace),
            el.name,
            attributes,
            scope,
            &mut props,
            &mut steps,
        )?;
        props.extend(extra);
        if self.i.server && !has_spread(attributes) && LOAD_ERROR_ELEMENTS.contains(&tag) {
            captured_events(attributes, source_text, &mut props);
        }
        if let Some(f) = self.ref_function(steps) {
            props.push(self.bound("$$ref", el.name, f, el.name));
        }
        let range = self.vb.props(props);
        let tag_type = self.vb.tag_type(tag, range, source_text);
        let kind = vue::NodeKind::Element(vue::Element {
            tag: if el.kind == super::ElementKind::Title && namespace == Namespace::Html {
                spelled("$$Title", el.name)
            } else {
                Name::Source(el.name)
            },
            tag_type,
            props: range,
            children: vue::Children::default(),
        });
        let origin = super::origin(identifier);
        let v = self.vb.node(kind, node.span, vue_parent, origin);
        if namespace != Namespace::Html {
            self.namespaces.insert(v, namespace);
        }
        let children = if let Some(target) = select_target {
            self.options(
                el.children,
                v,
                target,
                node.span,
                attributes
                    .iter()
                    .any(|attribute| attribute.name.text(source_text) == "multiple"),
            )?
        } else if let Some(parts) = textarea_value(tag, attributes, source_text) {
            self.textarea_content(parts, v, node.span)
        } else {
            let preserve = preserve_whitespace || tag == "pre" || tag == "textarea";
            self.list(
                Parent::Element(tag),
                compiler_syntax_tree.children(el.children),
                Some(v),
                preserve,
                node.span,
            )?
        };
        self.vb.set_element_children(v, children);
        Ok(v)
    }

    /// A `<textarea>`'s `value` of text and expressions as its content.
    fn textarea_content(
        &mut self,
        parts: &[Part],
        v: vue::CompilerNodeIdentifier,
        at: Span,
    ) -> vue::Children {
        let source_text = self.i.source_text;
        let items: Vec<Item<'_>> = parts
            .iter()
            .map(|part| match *part {
                Part::Text(span) => {
                    let raw = span.text(source_text);
                    Item::Text {
                        data: rsvelte_svelte_syntax::syntax_tree::decode_attribute(raw),
                        raw: Cow::Borrowed(raw),
                    }
                }
                Part::Expression { expression, .. } => Item::Expression(expression),
            })
            .collect();
        let mut out = Vec::with_capacity(items.len());
        let parent = Parent::Element("textarea");
        self.sequence(&items, parent, true, Some(v), at, &mut out);
        self.vb.children(&out)
    }

    /// The element's attributes as Vue props and steps; the target of a `<select>`'s `bind:`.
    fn element_attributes(
        &mut self,
        (tag, namespace): (&str, Namespace),
        name: Span,
        attributes: &[Attribute],
        scope: Option<&str>,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
    ) -> R<Option<rsvelte_typescript_tree::ExpressionIdentifier>> {
        let source_text = self.i.source_text;
        let mut select_target = None;
        let spread = has_spread(attributes);
        let directives = attributes
            .iter()
            .any(|a| matches!(a.value, AttributeValue::Class(_)));
        let styles = !self.i.server
            && attributes
                .iter()
                .any(|attribute| matches!(attribute.value, AttributeValue::Style { .. }));
        if styles && !spread {
            self.styles(attributes, steps)?;
        }
        if spread {
            self.spread((tag, namespace), attributes, props, steps, scope)?;
        } else {
            if directives || scope.is_some() {
                self.class_directives(name, attributes, props, steps, scope)?;
            }
            for a in attributes {
                if let AttributeValue::Bind(t) = a.value
                    && tag == "select"
                {
                    select_target = Some(t);
                }
                let class = matches!(a.value, AttributeValue::Class(_))
                    || a.name.text(source_text) == "class";
                let style = styles
                    && (matches!(a.value, AttributeValue::Style { .. })
                        || a.name.text(source_text) == "style");
                let content = textarea_value(tag, std::slice::from_ref(a), source_text).is_some();
                if !(((directives || scope.is_some()) && class) || style || content) {
                    self.attribute(tag, namespace, attributes, a, props, steps)?;
                }
            }
        }
        Ok(select_target)
    }

    /// An element with a spread attribute: all its attributes as one object, in order, which
    /// Svelte applies with `set_attributes` (client, after each patch) or prints with
    /// `attributes` (server). Vue is given none of them.
    pub(super) fn spread(
        &mut self,
        element: (&str, Namespace),
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
        scope: Option<&str>,
    ) -> R<()> {
        let (tag, namespace) = element;
        let (b, source_text) = (self.b, self.i.source_text);
        let mut fields = Vec::with_capacity(attributes.len());
        let mut classes = Vec::new();
        for a in attributes {
            let name = a.name.text(source_text);
            let value = match &a.value {
                &AttributeValue::Class(expression) => {
                    let value = self.template_expression(expression);
                    classes.push(b.property(string_key(b, name), value, false));
                    continue;
                }
                &AttributeValue::Spread(e) => {
                    let x = self.template_expression(e);
                    fields.push(b.spread_property(x));
                    continue;
                }
                AttributeValue::Style { .. } => continue,
                AttributeValue::Attach(_)
                | AttributeValue::Use { .. }
                | AttributeValue::Transition { .. }
                | AttributeValue::Animate { .. } => {
                    self.attribute(tag, namespace, attributes, a, props, steps)?;
                    continue;
                }
                &AttributeValue::Bind(t) => {
                    self.bind_this(a, t, steps)?;
                    continue;
                }
                AttributeValue::Interpolated(parts) => self.interpolated(parts),
                AttributeValue::Boolean => b.boolean(true),
                AttributeValue::Static(v) => b.string(v),
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression)) => {
                    let x = self.template_expression(expression);
                    if self.i.server && name == "class" {
                        self.helpers.insert(Helper::Clsx);
                        self.call("$$sclsx", [x])
                    } else {
                        x
                    }
                }
                _ => {
                    return Err(unsupported(
                        "this attribute beside a spread attribute",
                        a.span,
                    ));
                }
            };
            fields.push(b.property(string_key(b, name), value, false));
        }
        let mut object = b.object(fields);
        if !classes.is_empty() {
            self.helpers.insert(Helper::ClassSpread);
            object = self.call("$$class_spread", [object, b.object(classes)]);
        }
        if let Some(scope) = scope {
            self.helpers.insert(Helper::ScopedClass);
            object = self.call("$$scoped_spread", [object, b.string(scope)]);
        }
        let styles = attributes
            .iter()
            .any(|attribute| matches!(attribute.value, AttributeValue::Style { .. }))
            .then(|| self.style_declarations(attributes));
        let at = attributes
            .first()
            .map_or_else(Span::default, |attribute| attribute.span);
        self.apply_spread(element, object, styles, props, steps, at);
        Ok(())
    }

    fn apply_spread(
        &mut self,
        element: (&str, Namespace),
        mut object: Expression<'t>,
        styles: Option<Expression<'t>>,
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
        at: Span,
    ) {
        let (tag, namespace) = element;
        let b = self.b;
        if self.i.server {
            if let Some(styles) = styles {
                object = self.call("$$style_spread", [b.null(), object, styles]);
            }
            self.helpers.insert(Helper::Spread);
            let mut arguments = vec![object];
            if LOAD_ERROR_ELEMENTS.contains(&tag) {
                arguments.push(b.array(["onload", "onerror"].map(|e| b.string(e))));
            }
            if namespace != Namespace::Html || tag.contains('-') {
                if arguments.len() == 1 {
                    arguments.push(b.id("undefined"));
                }
                arguments.push(b.boolean(true));
                arguments.push(b.boolean(namespace == Namespace::Html));
            }
            let value = self.call("$$spread", arguments);
            let value = self.keep(value);
            props.push(directive(
                DirectiveName::Bind,
                None,
                DirectiveExpression::Expression(value),
                at,
            ));
        } else {
            self.helpers.insert(Helper::Attributes);
            let element = b.id("$$el");
            let call = if let Some(styles) = styles {
                self.call("$$style_spread", [element, object, styles])
            } else {
                self.call("$$attributes", [element, object])
            };
            steps.mounted.push(call);
        }
    }

    /// `class:` directives with the `class` attribute: `set_class` (client, after each patch) or
    /// `attr_class` (server), both `to_class` of the value and the directives.
    pub(super) fn class_directives(
        &mut self,
        at: Span,
        attributes: &[Attribute],
        props: &mut Vec<vue::Property>,
        steps: &mut Steps<'t>,
        scope: Option<&str>,
    ) -> R<()> {
        let (b, source_text) = (self.b, self.i.source_text);
        let mut value = None;
        let mut fields = Vec::new();
        for a in attributes {
            let name = a.name.text(source_text);
            match &a.value {
                &AttributeValue::Class(e) => {
                    let x = self.template_expression(e);
                    fields.push(b.property(string_key(b, name), x, false));
                }
                AttributeValue::Static(v) if name == "class" => {
                    value = Some(b.string(v));
                }
                &(AttributeValue::Expression { expression, .. }
                | AttributeValue::Shorthand(expression))
                    if name == "class" =>
                {
                    let x = self.template_expression(expression);
                    self.helpers.insert(Helper::Clsx);
                    value = Some(self.call("$$sclsx", [x]));
                }
                AttributeValue::Interpolated(parts) if name == "class" => {
                    value = Some(self.interpolated(parts));
                }
                _ if name == "class" => {
                    return Err(unsupported(
                        "this `class` beside a `class:` directive",
                        a.span,
                    ));
                }
                _ => {}
            }
        }
        let mut value = value.unwrap_or_else(|| b.string(""));
        if let Some(scope) = scope {
            self.helpers.insert(Helper::ScopedClass);
            value = self.call("$$scoped_class", [value, b.string(scope)]);
        }
        let object = b.object(fields);
        if self.i.server {
            self.helpers.insert(Helper::ToClass);
            let v = self.call("$$to_class", [value, object]);
            props.push(self.bound("CLASS", at, v, at));
        } else {
            self.helpers.insert(Helper::SetClass);
            let call = self.call("$$set_class", [b.id("$$el"), value, object]);
            steps.mounted.push(call);
        }
        Ok(())
    }

    /// `($$el) => { if ($$el !== null) { …mounted } …this }`: Vue calls a function ref with the
    /// element after every patch of it and with `null` on unmount, which is when Svelte's effects
    /// and `bind:this` run.
    pub(super) fn ref_function(&self, steps: Steps<'t>) -> Option<Expression<'t>> {
        let b = self.b;
        if steps.mounted.is_empty() && steps.this.is_empty() {
            return None;
        }
        let mut body = Vec::new();
        if !steps.mounted.is_empty() {
            let block = b.block(steps.mounted.into_iter().map(|s| b.statement(s)));
            let test = b.binary(b.id("$$el"), BinaryOperator::StrictInequality, b.null());
            body.push(b.if_(test, block, None));
        }
        body.extend(steps.this.into_iter().map(|s| b.statement(s)));
        Some(b.arrow_block(b.parameters(["$$el"]), body, false))
    }
}

fn has_spread(attributes: &[Attribute]) -> bool {
    attributes
        .iter()
        .any(|a| matches!(a.value, AttributeValue::Spread(_)))
}

/// `onload` / `onerror` marked on the server for the client to replay.
fn captured_events(attributes: &[Attribute], source_text: &str, props: &mut Vec<vue::Property>) {
    for a in attributes {
        let name = a.name.text(source_text);
        let event = matches!(
            a.value,
            AttributeValue::Expression { .. } | AttributeValue::Shorthand(_)
        ) && matches!(name, "onload" | "onerror");
        if event {
            props.push(captured_event(name, a.span));
        }
    }
}

/// `` ${event}="this.__e=event"``, which Svelte's server prints for a load or error event.
fn captured_event(event: &str, span: Span) -> vue::Property {
    vue::Property {
        kind: vue::PropertyKind::Attribute {
            name: spelled(event, span),
            value: Some(vue::Text {
                raw: span,
                cooked: Some("this.__e=event".into()),
            }),
        },
        span,
        origin: 0,
    }
}
