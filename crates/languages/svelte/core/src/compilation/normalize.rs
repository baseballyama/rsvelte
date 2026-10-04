use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_hir::compiler_syntax_tree::{
    Attribute, AttributeValue, Await, Branch, Children, CompilerNodeIdentifier, CompilerSyntaxTree,
    CompilerSyntaxTreeBuilder, Each, Element, ElementKind, MetadataTag, Modifiers, Name, NodeKind,
    Part, Snippet, StyleValue, text,
};
use rsvelte_svelte_syntax::syntax_tree::{
    self, Component, TemplateNode, TemplateNodeIdentifier, decode_attribute,
};
use rsvelte_typescript::NodeIdentifier;

#[must_use]
pub fn lower(c: &Component, source_text: &str) -> CompilerSyntaxTree {
    let mut b = SurfaceBuilder {
        c,
        source_text,
        raw_text: false,
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
    b: CompilerSyntaxTreeBuilder<'a>,
}

impl SurfaceBuilder<'_> {
    fn list(
        &mut self,
        list: &[TemplateNodeIdentifier],
        parent: Option<CompilerNodeIdentifier>,
    ) -> Children {
        let identifiers: Vec<CompilerNodeIdentifier> =
            list.iter().map(|&t| self.node(t, parent)).collect();
        self.b.children(&identifiers)
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
                if component != NodeIdentifier::NONE {
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
                let attributes = self.b.attributes(
                    surface
                        .iter()
                        .enumerate()
                        .filter(|(_, a)| !is_this(a))
                        .map(|(i, a)| lower(i, a)),
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
                let previous_raw_text = self.raw_text;
                self.raw_text = matches!(name.text(source_text), "style" | "script");
                let children = self.list(c.children(children), Some(identifier));
                self.raw_text = previous_raw_text;
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
            } => {
                let parameters = self.b.javascript_list(c.javascript_list(parameters));
                NodeKind::Snippet(Snippet {
                    name,
                    parameters,
                    body: self.list(c.children(body), Some(identifier)),
                })
            }
            TemplateNode::Render { expression, .. } => NodeKind::Render { expression },
            TemplateNode::Html { expression, .. } => NodeKind::Html { expression },
            TemplateNode::Const { declaration, .. } => NodeKind::Const { declaration },
            TemplateNode::Debug { identifiers, .. } => NodeKind::Debug {
                identifiers: self.b.javascript_list(c.javascript_list(identifiers)),
            },
            TemplateNode::Declaration { declaration, .. } => NodeKind::Declaration { declaration },
        };
        self.b.set_kind(identifier, kind);
        identifier
    }
}

fn modifiers(c: &Component, source_text: &str, a: &syntax_tree::Attribute) -> Modifiers {
    c.modifiers(a.modifiers)
        .iter()
        .filter_map(|m| Modifiers::parse(m.text(source_text)))
        .fold(Modifiers::default(), Modifiers::with)
}

/// The one expression of a directive's value, if it has one.
fn directive_expression(c: &Component, a: &syntax_tree::Attribute) -> Option<NodeIdentifier> {
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
                action: a.target,
                argument: directive_expression(c, a),
            };
        }
        syntax_tree::AttributeKind::Transition { intro, outro } => {
            return AttributeValue::Transition {
                function: a.target,
                argument: directive_expression(c, a),
                intro,
                outro,
                modifiers: modifiers(c, source_text, a),
            };
        }
        syntax_tree::AttributeKind::Animate => {
            return AttributeValue::Animate {
                function: a.target,
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
mod tests {
    use rsvelte_svelte_hir::compiler_syntax_tree::{
        ElementKind, MetadataTag, Modifiers, StyleValue, is_component_name,
    };

    use super::*;

    fn compiler_syntax_tree(source_text: &str) -> (Component, CompilerSyntaxTree) {
        let c = crate::syntax::parse::parse(source_text).expect("parses");
        let h = lower(&c, source_text);
        (c, h)
    }

    #[test]
    fn an_else_if_chain_is_one_node_with_its_branches() {
        let source_text = "{#if a}A{:else if b}B{:else if c}C{:else}D{/if}";
        let (_, h) = compiler_syntax_tree(source_text);
        let [top] = h.children(h.root) else {
            panic!("one top-level node")
        };
        let NodeKind::If {
            branches,
            otherwise,
        } = h.node(*top).kind
        else {
            panic!("an if")
        };
        let bodies: Vec<&str> = h
            .branches(branches)
            .iter()
            .map(|b| {
                let [t] = h.children(b.body) else { panic!() };
                h.node(*t).kind.text(source_text).unwrap()
            })
            .collect();
        assert_eq!(bodies, ["A", "B", "C"]);
        let [d] = h.children(otherwise.expect("an else")) else {
            panic!()
        };
        assert_eq!(h.node(*d).kind.text(source_text), Some("D"));
        assert_eq!(h.node(*d).parent, Some(*top));
    }

    #[test]
    fn attribute_values_are_classified() {
        let source_text = "<p a b=\"x&amp;y\" c={e} d=\"{e}\" {e} f=\"x{e}\" g=\"\"></p>";
        let (_, h) = compiler_syntax_tree(source_text);
        let (_, el) = h.elements().next().expect("an element");
        let got: Vec<String> = h
            .attributes(el.attributes)
            .iter()
            .map(|a| match &a.value {
                AttributeValue::Boolean => "boolean".into(),
                AttributeValue::Static(v) => format!("static {v:?}"),
                AttributeValue::Expression { quoted, .. } => format!("expression quoted={quoted}"),
                AttributeValue::Shorthand(_) => "shorthand".into(),
                AttributeValue::Interpolated(p) => format!("interpolated {}", p.len()),
                AttributeValue::Bind(_) => "bind".into(),
                AttributeValue::Attach(_) => "attach".into(),
                AttributeValue::Class(_) => "class".into(),
                AttributeValue::Spread(_) => "spread".into(),
                _ => "directive".into(),
            })
            .collect();
        assert_eq!(
            got,
            [
                "boolean",
                "static \"x&y\"",
                "expression quoted=false",
                "expression quoted=true",
                "shorthand",
                "interpolated 2",
                "static \"\"",
            ]
        );
    }

    #[test]
    #[expect(
        clippy::literal_string_with_formatting_args,
        reason = "Svelte expression braces"
    )]
    fn directives_keep_their_parts() {
        let source_text = "<p on:click|once|capture={h} use:a.b={x} in:fade out:fly|global={y} \
                           style:color style:width=\"{w}px\" style:--x|important=\"1\"></p>";
        let (c, h) = compiler_syntax_tree(source_text);
        let (_, el) = h.elements().next().expect("an element");
        let got: Vec<String> = h
            .attributes(el.attributes)
            .iter()
            .map(|a| {
                let name = a.name.text(source_text);
                match &a.value {
                    AttributeValue::On { handler, modifiers } => format!(
                        "on {name} {} once={} capture={}",
                        handler.is_some(),
                        modifiers.contains(Modifiers::ONCE),
                        modifiers.contains(Modifiers::CAPTURE)
                    ),
                    AttributeValue::Use { action, argument } => {
                        let member = matches!(
                            c.javascript.kind(*action),
                            rsvelte_typescript::Kind::Member { .. }
                        );
                        format!("use member={member} {}", argument.is_some())
                    }
                    AttributeValue::Transition {
                        intro,
                        outro,
                        modifiers,
                        argument,
                        ..
                    } => format!(
                        "transition {name} {intro} {outro} {} global={}",
                        argument.is_some(),
                        modifiers.contains(Modifiers::GLOBAL)
                    ),
                    AttributeValue::Style { value, modifiers } => format!(
                        "style {name} {} important={}",
                        match **value {
                            StyleValue::Shorthand(_) => "shorthand",
                            StyleValue::Interpolated(_) => "interpolated",
                            StyleValue::Static(_) => "static",
                            StyleValue::Empty => "empty",
                            StyleValue::Expression { .. } => "expression",
                        },
                        modifiers.contains(Modifiers::IMPORTANT)
                    ),
                    other => format!("{other:?}"),
                }
            })
            .collect();
        assert_eq!(
            got,
            [
                "on click true once=true capture=true",
                "use member=true true",
                "transition fade true false false global=false",
                "transition fly false true true global=true",
                "style color shorthand important=false",
                "style width interpolated important=false",
                "style --x static important=true",
            ]
        );
    }

    #[test]
    fn element_kinds_follow_the_svelte_parser() {
        use ElementKind::*;
        let source_text = "<svelte:head><title>t</title></svelte:head><div><title>u</title></div>\
                   <Foo/><a.b/><slot/>\
                   <template shadowrootmode=\"open\"><slot/></template>";
        let (_, h) = compiler_syntax_tree(source_text);
        let got: Vec<(String, ElementKind)> = h
            .elements()
            .map(|(_, el)| (el.name.text(source_text).to_owned(), el.kind))
            .collect();
        let want = [
            ("svelte:head", Metadata(Some(MetadataTag::Head))),
            ("title", Title),
            ("div", Regular),
            ("title", Regular),
            ("Foo", Component),
            ("a.b", Component),
            ("slot", Slot),
            ("template", Regular),
            ("slot", Regular),
        ];
        let want: Vec<(String, ElementKind)> =
            want.iter().map(|(n, k)| (n.to_string(), *k)).collect();
        assert_eq!(got, want);
    }

    #[test]
    fn component_names_match_the_upstream_pattern() {
        for (name, want) in [
            ("Foo", true),
            ("Foo.bar", true),
            ("foo.bar", true),
            ("Ärger", true),
            ("foo", false),
            ("foo.", false),
            ("_x.y", false),
            ("x-y", false),
            ("\u{2160}", false),
        ] {
            assert_eq!(is_component_name(name), want, "{name}");
        }
    }

    #[test]
    fn every_node_points_back_to_its_surface_node() {
        let source_text = "<p>a</p>{#if x}<b/>{/if}";
        let (c, h) = compiler_syntax_tree(source_text);
        for (identifier, n) in h.nodes.iter_enumerated() {
            assert_eq!(
                c.node(h.origin[identifier]).span(),
                n.span,
                "{identifier:?}"
            );
        }
    }
}
