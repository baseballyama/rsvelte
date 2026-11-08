use super::{
    AttributeKind, Children, CompilerNodeIdentifier, CompilerSyntaxTree, CompilerSyntaxTreeBuilder,
    Directive, DirectiveExpression, Element, Name, NodeKind, Property, PropertyKind,
    SingleFileComponent, TemplateNode, TemplateNodeIdentifier, Text, syntax_tree,
};

/// The Vue frontend: the template as written, to the HIR. `None` without a `<template>`.
#[must_use]
pub fn lower(c: &SingleFileComponent, source_text: &str) -> Option<CompilerSyntaxTree> {
    let t = c.template.as_ref()?;
    let mut b = SurfaceBuilder {
        c,
        source_text,
        b: CompilerSyntaxTreeBuilder::new(c.nodes.len(), c.attributes.len()),
        in_pre: 0,
    };
    let root = b.list(c.children(t.root), None, Whitespace::Condense, false);
    Some(b.b.finish(root))
}

pub(super) struct SurfaceBuilder<'a> {
    c: &'a SingleFileComponent,
    source_text: &'a str,
    b: CompilerSyntaxTreeBuilder,
    /// Open `<pre>` elements (`inPre`).
    in_pre: u32,
}

/// How `baseParse` treats the text of a child list.
#[derive(Clone, Copy, PartialEq, Eq)]
pub(super) enum Whitespace {
    /// `condenseWhitespace`.
    Condense,
    /// Inside a `<pre>`: line endings normalized, nothing removed.
    Pre,
    /// A `<textarea>` or `<title>`, whose content the tokenizer reads as RCDATA: as written.
    Rcdata,
}

impl SurfaceBuilder<'_> {
    /// A child list as `onCloseTag` leaves it: whitespace treated per `ws`, then a leading newline
    /// dropped when `ignore_newline` (`isIgnoreNewlineTag`).
    fn list(
        &mut self,
        list: &[TemplateNodeIdentifier],
        parent: Option<CompilerNodeIdentifier>,
        ws: Whitespace,
        ignore_newline: bool,
    ) -> Children {
        let (c, source_text) = (self.c, self.source_text);
        // `None` once condensing removes the text; upstream reads its neighbours in the list it
        // is filtering.
        let mut kept: Vec<Option<(TemplateNodeIdentifier, Option<Text>)>> = list
            .iter()
            .map(|&t| {
                let text = match c.node(t) {
                    TemplateNode::Text { span } => Some(Text::decoded(*span, source_text)),
                    _ => None,
                };
                Some((t, text))
            })
            .collect();
        for i in 0..kept.len() {
            let Some((_, Some(text))) = &kept[i] else {
                continue;
            };
            let content = text.text(source_text);
            let condensed = if ws == Whitespace::Rcdata {
                continue;
            } else if ws == Whitespace::Pre {
                content.replace("\r\n", "\n")
            } else if content.bytes().all(is_whitespace) {
                let neighbour = |j: Option<usize>| {
                    j.and_then(|j| kept.get(j))
                        .and_then(|k| k.as_ref())
                        .map(|&(t, _)| c.node(t))
                };
                let remove = match (neighbour(i.checked_sub(1)), neighbour(Some(i + 1))) {
                    (None, _)
                    | (_, None)
                    | (
                        Some(TemplateNode::Comment { .. }),
                        Some(TemplateNode::Comment { .. } | TemplateNode::Element { .. }),
                    )
                    | (Some(TemplateNode::Element { .. }), Some(TemplateNode::Comment { .. })) => {
                        true
                    }
                    (Some(TemplateNode::Element { .. }), Some(TemplateNode::Element { .. })) => {
                        content.contains(['\n', '\r'])
                    }
                    _ => false,
                };
                if remove {
                    kept[i] = None;
                    continue;
                }
                " ".to_owned()
            } else {
                condense(content)
            };
            let raw = text.raw;
            let cooked = (condensed != raw.text(source_text)).then(|| condensed.into_boxed_str());
            if let Some((_, slot)) = &mut kept[i] {
                *slot = Some(Text { raw, cooked });
            }
        }
        if ignore_newline && let Some(Some((_, Some(text)))) = kept.first_mut() {
            let content = text.text(source_text);
            if let Some(rest) = content
                .strip_prefix("\r\n")
                .or_else(|| content.strip_prefix('\n'))
            {
                let rest = rest.to_owned().into_boxed_str();
                text.cooked = Some(rest);
            }
        }
        let identifiers: Vec<CompilerNodeIdentifier> = kept
            .into_iter()
            .flatten()
            .map(|(t, text)| match text {
                Some(text) => self
                    .b
                    .node(NodeKind::Text(text), c.node(t).span(), parent, t),
                None => self.node(t, parent),
            })
            .collect();
        self.b.children(&identifiers)
    }

    fn node(
        &mut self,
        t: TemplateNodeIdentifier,
        parent: Option<CompilerNodeIdentifier>,
    ) -> CompilerNodeIdentifier {
        let (c, source_text) = (self.c, self.source_text);
        let surface = c.node(t);
        let kind = match *surface {
            TemplateNode::Text { .. } => unreachable!("`list` adds text"),
            TemplateNode::Comment { data, .. } => NodeKind::Comment { data },
            TemplateNode::Interpolation { expression, .. } => {
                NodeKind::Interpolation { expression }
            }
            TemplateNode::Element {
                name,
                attributes,
                children,
                ..
            } => {
                let props = self.b.props(
                    c.attributes(attributes)
                        .iter()
                        .enumerate()
                        .map(|(i, a)| prop(source_text, a, attributes.start + i as u32)),
                );
                let tag_type = self.b.tag_type(name.text(source_text), props, source_text);
                let identifier = self.b.node(
                    NodeKind::Element(Element {
                        tag: Name::Source(name),
                        tag_type,
                        props,
                        children: Children::default(),
                    }),
                    surface.span(),
                    parent,
                    t,
                );
                let tag = name.text(source_text);
                let pre = tag == "pre";
                self.in_pre += u32::from(pre);
                let ws = if self.in_pre > 0 {
                    Whitespace::Pre
                } else if matches!(tag, "textarea" | "title") {
                    Whitespace::Rcdata
                } else {
                    Whitespace::Condense
                };
                let ignore_newline = matches!(tag, "pre" | "textarea");
                let children =
                    self.list(c.children(children), Some(identifier), ws, ignore_newline);
                self.in_pre -= u32::from(pre);
                self.b.set_element_children(identifier, children);
                return identifier;
            }
        };
        self.b.node(kind, surface.span(), parent, t)
    }
}

pub(super) fn prop(source_text: &str, a: &syntax_tree::Attribute, origin: u32) -> Property {
    let kind = match &a.kind {
        AttributeKind::Static => PropertyKind::Attribute {
            name: Name::Source(a.name),
            value: a.value.map(|v| Text::decoded(v, source_text)),
        },
        AttributeKind::Directive(d) => PropertyKind::Directive(Directive {
            name: d.name,
            arg: d.arg.map(Name::Source),
            modifiers: d.modifiers.iter().copied().map(Name::Source).collect(),
            exp: match &d.exp {
                DirectiveExpression::None => DirectiveExpression::None,
                DirectiveExpression::Expression(e) => DirectiveExpression::Expression(*e),
                DirectiveExpression::For(f) => {
                    DirectiveExpression::For(syntax_tree::LoopExpression {
                        parameters: f.parameters.clone(),
                        source: f.source,
                    })
                }
            },
        }),
    };
    Property {
        kind,
        span: a.span,
        origin,
    }
}

pub(super) const fn is_whitespace(b: u8) -> bool {
    matches!(b, b' ' | b'\n' | b'\t' | b'\x0c' | b'\r')
}

/// compiler-core `condense`: each whitespace run becomes one space.
pub(super) fn condense(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut prev_ws = false;
    for c in s.chars() {
        if u8::try_from(c).is_ok_and(is_whitespace) {
            if !prev_ws {
                out.push(' ');
            }
            prev_ws = true;
        } else {
            out.push(c);
            prev_ws = false;
        }
    }
    out
}

// Pinned so a change to a node's layout is a decision.
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<super::Node>() == 64, "`Node` is 64 bytes");
#[cfg(target_pointer_width = "64")]
const _: () = assert!(size_of::<Property>() == 104, "`Property` is 104 bytes");
