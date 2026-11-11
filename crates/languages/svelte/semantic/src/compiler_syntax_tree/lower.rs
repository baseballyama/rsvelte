use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    self, Component, TemplateNode, TemplateNodeIdentifier, decode_attribute,
};
use rsvelte_typescript_tree::ExpressionIdentifier;

use super::{
    Attribute, AttributeValue, Await, Branch, Children, CompilerNodeIdentifier, CompilerSyntaxTree,
    CompilerSyntaxTreeBuilder, Each, Element, ElementKind, MetadataTag, Modifiers, Name, NodeKind,
    Part, Snippet, StyleValue, text,
};

#[must_use]
pub fn lower(c: &Component, source_text: &str) -> CompilerSyntaxTree {
    let mut b = SurfaceBuilder {
        c,
        source_text,
        raw_text: false,
        attribute_text: false,
        b: CompilerSyntaxTreeBuilder::new(source_text, c.nodes.len(), c.attributes.len()),
    };
    let root = b.list(c.children(c.root), None);
    b.b.finish(root)
}

/// The Svelte frontend: the surface tree as written, to the HIR.
struct SurfaceBuilder<'a> {
    c: &'a Component,
    source_text: &'a str,
    raw_text: bool,
    /// Inside a `<textarea>`, whose text upstream decodes as an attribute's.
    attribute_text: bool,
    b: CompilerSyntaxTreeBuilder<'a>,
}

impl SurfaceBuilder<'_> {
    fn list(
        &mut self,
        list: &[TemplateNodeIdentifier],
        parent: Option<CompilerNodeIdentifier>,
    ) -> Children {
        // Fragments nest through here, so the stack grows as deep as the markup does.
        rsvelte_kernel::performance::stack::grow(|| {
            let identifiers: Vec<CompilerNodeIdentifier> =
                list.iter().map(|&t| self.node(t, parent)).collect();
            self.b.children(&identifiers)
        })
    }

    #[expect(clippy::too_many_lines, reason = "one arm per template node kind")]
    fn node(
        &mut self,
        t: TemplateNodeIdentifier,
        parent: Option<CompilerNodeIdentifier>,
    ) -> CompilerNodeIdentifier {
        let (c, source_text) = (self.c, self.source_text);
        let surface = c.node(t);
        let placeholder = NodeKind::Comment {
            data: Span::default(),
        };
        let identifier = self.b.node(placeholder, surface.span(), parent, t);
        let kind = match *surface {
            TemplateNode::Text { span } if self.raw_text => NodeKind::Text {
                raw: span,
                decoded: None,
                spelled: false,
            },
            TemplateNode::Text { span } if self.attribute_text => NodeKind::Text {
                raw: span,
                decoded: match decode_attribute(span.text(source_text)) {
                    std::borrow::Cow::Borrowed(_) => None,
                    std::borrow::Cow::Owned(s) => Some(s.into_boxed_str()),
                },
                spelled: false,
            },
            TemplateNode::Text { span } => text(span, source_text),
            TemplateNode::Comment { data, .. } => NodeKind::Comment { data },
            TemplateNode::Expression { expression, .. } => NodeKind::Expression { expression },
            TemplateNode::Element {
                name,
                component,
                attributes,
                children,
                start_tag,
                ..
            } => {
                let kind = self.b.element_kind(name.text(source_text), parent);
                if let Some(component) = component {
                    self.b.component_reference(identifier, component);
                }
                let has_this = matches!(
                    kind,
                    ElementKind::Metadata(Some(MetadataTag::Element | MetadataTag::Component))
                );
                let surface = c.attributes(attributes);
                let lower = |i: usize, a: &syntax_tree::Attribute| Attribute {
                    name: Name::Source(a.directive_name(&c.modifiers).unwrap_or(a.name)),
                    value: attribute_value(c, source_text, a),
                    span: a.span,
                    owner: identifier,
                    origin: attributes.start + i as u32,
                };
                let is_this = |a: &syntax_tree::Attribute| {
                    has_this
                        && a.kind == syntax_tree::AttributeKind::Attribute
                        && a.name.text(source_text) == "this"
                };
                // `this` goes just before the element's range, so the range holds the others.
                let this = surface
                    .iter()
                    .position(is_this)
                    .map(|i| self.b.attributes([lower(i, &surface[i])]).start);
                let textarea = kind == ElementKind::Regular && name.text(source_text) == "textarea";
                let content = c.children(children);
                // Upstream's analysis moves a `<textarea>`'s content but one text into `value`.
                let value = (textarea
                    && (content.len() > 1
                        || content
                            .first()
                            .is_some_and(|&t| !matches!(c.node(t), TemplateNode::Text { .. }))))
                .then(|| {
                    textarea_value(
                        c,
                        source_text,
                        content,
                        identifier,
                        attributes.start + attributes.len,
                    )
                });
                let moved = value.is_some();
                let attributes = self.b.attributes(
                    surface
                        .iter()
                        .enumerate()
                        .filter(|(_, a)| !is_this(a))
                        .map(|(i, a)| lower(i, a))
                        .chain(value),
                );
                // `element_kind` of a descendant reads this node's kind and attributes.
                self.b.set_kind(
                    identifier,
                    NodeKind::Element(Element {
                        name,
                        kind,
                        attributes,
                        children: Children::default(),
                        start_tag,
                        this,
                    }),
                );
                let previous = (self.raw_text, self.attribute_text);
                self.raw_text = matches!(name.text(source_text), "style" | "script");
                self.attribute_text = textarea;
                let children = if moved {
                    Children::default()
                } else {
                    self.list(content, Some(identifier))
                };
                (self.raw_text, self.attribute_text) = previous;
                self.b.set_element_children(identifier, children);
                return identifier;
            }
            TemplateNode::Each {
                expression,
                context,
                index,
                key,
                body,
                fallback,
                has_fallback,
                ..
            } => {
                let body = self.list(c.children(body), Some(identifier));
                let fallback =
                    has_fallback.then(|| self.list(c.children(fallback), Some(identifier)));
                NodeKind::Each(Each {
                    collection: expression,
                    context,
                    index,
                    key,
                    body,
                    fallback,
                })
            }
            TemplateNode::If { .. } => {
                let chain = c.if_branches(t);
                let mut branches = Vec::with_capacity(chain.len());
                for &b in &chain {
                    let TemplateNode::If {
                        test, consequent, ..
                    } = *c.node(b)
                    else {
                        unreachable!("if_branches returns If nodes")
                    };
                    branches.push(Branch {
                        test,
                        body: self.list(c.children(consequent), Some(identifier)),
                        origin: b,
                    });
                }
                let last = *chain.last().expect("a chain has its own node");
                let TemplateNode::If { alternate, .. } = *c.node(last) else {
                    unreachable!("if_branches returns If nodes")
                };
                let otherwise = alternate.map(|a| self.list(c.children(a), Some(identifier)));
                NodeKind::If {
                    branches: self.b.branches(branches),
                    otherwise,
                }
            }
            TemplateNode::Key {
                expression, body, ..
            } => NodeKind::Key {
                expression,
                body: self.list(c.children(body), Some(identifier)),
            },
            TemplateNode::Await {
                expression,
                value,
                error,
                pending,
                then,
                catch,
                ..
            } => {
                let pending = pending
                    .present()
                    .map(|r| self.list(c.children(r), Some(identifier)));
                let then = then
                    .present()
                    .map(|r| self.list(c.children(r), Some(identifier)));
                let catch = catch
                    .present()
                    .map(|r| self.list(c.children(r), Some(identifier)));
                NodeKind::Await(Box::new(Await::new(
                    expression, value, error, pending, then, catch,
                )))
            }
            TemplateNode::Snippet {
                name,
                parameters,
                body,
                ..
            } => NodeKind::Snippet(Snippet {
                name,
                parameters,
                body: self.list(c.children(body), Some(identifier)),
            }),
            TemplateNode::Render { expression, .. } => NodeKind::Render { expression },
            TemplateNode::Html { expression, .. } => NodeKind::Html { expression },
            TemplateNode::Const { declaration, .. } => NodeKind::Const { declaration },
            TemplateNode::Debug { identifiers, .. } => NodeKind::Debug {
                identifiers: self.b.debug_identifiers(c.debug_identifiers(identifiers)),
            },
            TemplateNode::Declaration { declaration, .. } => NodeKind::Declaration { declaration },
        };
        self.b.set_kind(identifier, kind);
        identifier
    }
}

/// Upstream's `value` of a `<textarea>` whose content is more than one text: the content as an
/// attribute's parts, without the newline that starts it, which the browser drops from the content
/// but not from a value. One expression is the quoted `value="{e}"`, as the attribute parser reads
/// it. `origin` is past the element's own attributes.
fn textarea_value(
    c: &Component,
    source_text: &str,
    content: &[TemplateNodeIdentifier],
    owner: CompilerNodeIdentifier,
    origin: u32,
) -> Attribute {
    let parts: Box<[Part]> = content
        .iter()
        .enumerate()
        .filter_map(|(i, &t)| match *c.node(t) {
            TemplateNode::Text { span } if i == 0 => {
                let text = span.text(source_text);
                let newline = ["\r\n", "\n"]
                    .into_iter()
                    .find(|n| text.starts_with(n))
                    .map_or(0, str::len);
                Some(Part::Text(Span::new(
                    span.start_offset + newline as u32,
                    span.end_offset,
                )))
            }
            TemplateNode::Text { span } => Some(Part::Text(span)),
            TemplateNode::Expression { expression, span } => {
                Some(Part::Expression { expression, span })
            }
            _ => None,
        })
        .collect();
    let first = content.first().map(|&t| c.node(t).span());
    let last = content.last().map(|&t| c.node(t).span());
    let span = match (first, last) {
        (Some(first), Some(last)) => Span::new(first.start_offset, last.end_offset),
        _ => Span::default(),
    };
    Attribute {
        name: Name::Spelled {
            text: "value".into(),
            span,
        },
        value: match *parts {
            [Part::Expression { expression, .. }] => AttributeValue::Expression {
                expression,
                quoted: true,
            },
            _ => AttributeValue::Interpolated(parts),
        },
        span,
        owner,
        origin,
    }
}

fn modifiers(c: &Component, source_text: &str, a: &syntax_tree::Attribute) -> Modifiers {
    c.modifiers(a.modifiers)
        .iter()
        .filter_map(|m| Modifiers::parse(m.text(source_text)))
        .fold(Modifiers::default(), Modifiers::with)
}

/// The one expression of a directive's value, if it has one.
fn directive_expression(c: &Component, a: &syntax_tree::Attribute) -> Option<ExpressionIdentifier> {
    match a.value {
        syntax_tree::AttributeValue::True => None,
        syntax_tree::AttributeValue::Parts(r) => match c.parts(r) {
            [Part::Expression { expression, .. }] => Some(*expression),
            _ => None,
        },
    }
}

fn attribute_value(c: &Component, source_text: &str, a: &syntax_tree::Attribute) -> AttributeValue {
    match a.kind {
        syntax_tree::AttributeKind::On => {
            return AttributeValue::On {
                handler: directive_expression(c, a),
                modifiers: modifiers(c, source_text, a),
            };
        }
        syntax_tree::AttributeKind::Use => {
            return AttributeValue::Use {
                action: target(a),
                argument: directive_expression(c, a),
            };
        }
        syntax_tree::AttributeKind::Transition { intro, outro } => {
            return AttributeValue::Transition {
                function: target(a),
                argument: directive_expression(c, a),
                intro,
                outro,
                modifiers: modifiers(c, source_text, a),
            };
        }
        syntax_tree::AttributeKind::Animate => {
            return AttributeValue::Animate {
                function: target(a),
                argument: directive_expression(c, a),
            };
        }
        syntax_tree::AttributeKind::Let => return AttributeValue::Let(directive_expression(c, a)),
        syntax_tree::AttributeKind::Style => {
            return AttributeValue::Style {
                value: Box::new(style_value(c, source_text, a)),
                modifiers: modifiers(c, source_text, a),
            };
        }
        _ => {}
    }
    let parts = match a.value {
        syntax_tree::AttributeValue::True => return AttributeValue::Boolean,
        syntax_tree::AttributeValue::Parts(r) => c.parts(r),
    };
    match parts {
        [Part::Expression { expression, .. }] if a.kind == syntax_tree::AttributeKind::Bind => {
            AttributeValue::Bind(*expression)
        }
        [Part::Expression { expression, .. }] if a.kind == syntax_tree::AttributeKind::Attach => {
            AttributeValue::Attach(*expression)
        }
        [Part::Expression { expression, .. }] if a.kind == syntax_tree::AttributeKind::Class => {
            AttributeValue::Class(*expression)
        }
        [Part::Expression { expression, .. }] if a.kind == syntax_tree::AttributeKind::Spread => {
            AttributeValue::Spread(*expression)
        }
        [Part::Expression { expression, .. }] if a.shorthand => {
            AttributeValue::Shorthand(*expression)
        }
        [Part::Expression { expression, .. }] => AttributeValue::Expression {
            expression: *expression,
            quoted: a.quoted,
        },
        [_, ..] if parts.iter().all(|p| matches!(p, Part::Text(_))) => AttributeValue::Static(
            parts
                .iter()
                .map(|p| match p {
                    Part::Text(s) => decode_attribute(s.text(source_text)),
                    Part::Expression { .. } => unreachable!("all text"),
                })
                .collect::<String>()
                .into_boxed_str(),
        ),
        _ => AttributeValue::Interpolated(parts.into()),
    }
}

/// What a `use:`, `transition:` or `animate:` directive names, which the parser always reads.
const fn target(a: &syntax_tree::Attribute) -> ExpressionIdentifier {
    a.target.expect("the parser reads a directive's target")
}

fn style_value(c: &Component, source_text: &str, a: &syntax_tree::Attribute) -> StyleValue {
    let parts = match a.value {
        syntax_tree::AttributeValue::True => return StyleValue::Empty,
        syntax_tree::AttributeValue::Parts(r) => c.parts(r),
    };
    match parts {
        [Part::Expression { expression, .. }] if a.shorthand => StyleValue::Shorthand(*expression),
        [Part::Expression { expression, .. }] => StyleValue::Expression {
            expression: *expression,
            quoted: a.quoted,
        },
        [_, ..] if parts.iter().all(|p| matches!(p, Part::Text(_))) => StyleValue::Static(
            parts
                .iter()
                .map(|p| match p {
                    Part::Text(s) => decode_attribute(s.text(source_text)),
                    Part::Expression { .. } => unreachable!("all text"),
                })
                .collect::<String>()
                .into_boxed_str(),
        ),
        _ => StyleValue::Interpolated(parts.into()),
    }
}

#[cfg(test)]
mod tests;
