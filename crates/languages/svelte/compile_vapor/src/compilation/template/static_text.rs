use super::{Builder, Item, Parent, Span, Text, vue};

pub(super) fn textarea_text<'a>(
    raw: &'a str,
    first: bool,
    server: bool,
    items: &[Item<'_>],
) -> &'a str {
    if !first {
        raw
    } else if !server {
        raw.strip_prefix("\r\n")
            .or_else(|| raw.strip_prefix('\n'))
            .unwrap_or(raw)
    } else if matches!(raw, "\n" | "\r\n")
        && items.iter().any(|item| matches!(item, Item::Expression(_)))
    {
        ""
    } else {
        raw
    }
}

impl Builder<'_, '_> {
    pub(super) fn static_text(
        &mut self,
        text: String,
        items: &[Item<'_>],
        parent: Parent<'_>,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
    ) -> vue::CompilerNodeIdentifier {
        let title = matches!(parent, Parent::Element("title"))
            && vue_parent.is_some_and(|parent| !self.namespaces.contains_key(&parent));
        if !self.i.server && !title && !matches!(parent, Parent::Element("style" | "script")) {
            let raw = items
                .iter()
                .map(|item| match item {
                    Item::Text { raw, .. } => raw.as_ref(),
                    _ => unreachable!("static text has no expression"),
                })
                .collect::<String>();
            let properties = self.vb.props([vue::Property {
                kind: vue::PropertyKind::Attribute {
                    name: super::spelled("$$raw", at),
                    value: Some(Text {
                        raw: at,
                        cooked: Some(raw.into_boxed_str()),
                    }),
                },
                span: at,
                origin: 0,
            }]);
            let element = vue::Element {
                tag: super::spelled(
                    if matches!(parent, Parent::Element("textarea")) {
                        "$$TextareaText"
                    } else if matches!(parent, Parent::Element("pre")) {
                        "$$PreText"
                    } else {
                        "$$Text"
                    },
                    at,
                ),
                tag_type: vue::TagType::Template,
                props: properties,
                children: vue::Children::default(),
            };
            self.vb
                .node(vue::NodeKind::Element(element), at, vue_parent, 0)
        } else {
            self.text(text, vue_parent, at)
        }
    }

    pub(super) fn text(
        &mut self,
        data: String,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
    ) -> vue::CompilerNodeIdentifier {
        let t = Text {
            raw: at,
            cooked: Some(data.into_boxed_str()),
        };
        self.vb.node(vue::NodeKind::Text(t), at, vue_parent, 0)
    }
}
