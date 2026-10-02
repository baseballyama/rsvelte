use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_hir::compiler_syntax_tree::{
    Attribute, AttributeValue, Branch, Children, CompilerNodeIdentifier, CompilerSyntaxTree,
    CompilerSyntaxTreeBuilder, Each, Element, Name, NodeKind, Part, text,
};
use rsvelte_svelte_syntax::syntax_tree::{
    self, Component, TemplateNode, TemplateNodeIdentifier, decode_text,
};

#[must_use]
pub fn lower(c: &Component, source_text: &str) -> CompilerSyntaxTree {
    let mut b = SurfaceBuilder {
        c,
        source_text,
        b: CompilerSyntaxTreeBuilder::new(source_text, c.nodes.len(), c.attributes.len()),
    };
    let root = b.list(c.children(c.root), None);
    b.b.finish(root)
}

/// The Svelte frontend: the surface tree as written, to the HIR.
struct SurfaceBuilder<'a> {
    c: &'a Component,
    source_text: &'a str,
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
            TemplateNode::Text { span } => text(span, source_text),
            TemplateNode::Comment { data, .. } => NodeKind::Comment { data },
            TemplateNode::Expression { expression, .. } => NodeKind::Expression { expression },
            TemplateNode::Element {
                name,
                attributes,
                children,
                start_tag,
                ..
            } => {
                let kind = self.b.element_kind(name.text(source_text), parent);
                let attributes =
                    self.b
                        .attributes(c.attributes(attributes).iter().enumerate().map(|(i, a)| {
                            Attribute {
                                name: Name::Source(a.directive_name().unwrap_or(a.name)),
                                value: attribute_value(c, source_text, a),
                                span: a.span,
                                owner: identifier,
                                origin: attributes.start + i as u32,
                            }
                        }));
                // `element_kind` of a descendant reads this node's kind and attributes.
                self.b.set_kind(
                    identifier,
                    NodeKind::Element(Element {
                        name,
                        kind,
                        attributes,
                        children: Children::default(),
                        start_tag,
                    }),
                );
                let children = self.list(c.children(children), Some(identifier));
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
        };
        self.b.set_kind(identifier, kind);
        identifier
    }
}

fn attribute_value(c: &Component, source_text: &str, a: &syntax_tree::Attribute) -> AttributeValue {
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
                    Part::Text(s) => decode_text(s.text(source_text)),
                    Part::Expression { .. } => unreachable!("all text"),
                })
                .collect::<String>()
                .into_boxed_str(),
        ),
        _ => AttributeValue::Interpolated(parts.into()),
    }
}

#[cfg(test)]
mod tests {
    use rsvelte_svelte_hir::compiler_syntax_tree::{ElementKind, MetadataTag, is_component_name};

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
        let source_text = "<p a b=\"x&amp;y\" c={e} d=\"{e}\" {e} f=\"x{e}\" g=\"\" h=></p>";
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
                "interpolated 0"
            ]
        );
    }

    #[test]
    fn element_kinds_follow_the_svelte_parser() {
        use ElementKind::*;
        let source_text = "<svelte:head><title>t</title></svelte:head><div><title>u</title></div>\
                   <Foo/><a.b/><slot/>\
                   <template shadowrootmode=\"open\"><slot/></template><svelte:nope/>";
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
            ("svelte:nope", Metadata(None)),
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
