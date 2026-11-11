use super::{Item, Parent, Span, Template, Text, spelled, vue};

/// A `<textarea>`'s text: the parser drops one leading newline (client), and Svelte's server
/// drops a lone one beside an expression.
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

impl Template<'_, '_, '_> {
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
        if self.i.server || title || matches!(parent, Parent::Element("style" | "script")) {
            return self.text(text, vue_parent, at);
        }
        let raw = items
            .iter()
            .map(|item| match item {
                Item::Text { raw, .. } => raw.as_ref(),
                _ => unreachable!("static text has no expression"),
            })
            .collect::<String>();
        let property = vue::Property {
            kind: vue::PropertyKind::Attribute {
                name: spelled("$$raw", at),
                value: Some(Text {
                    raw: at,
                    cooked: Some(raw.into_boxed_str()),
                }),
            },
            span: at,
            origin: 0,
        };
        let tag = match parent {
            Parent::Element("textarea") => "$$TextareaText",
            Parent::Element("pre") => "$$PreText",
            _ => "$$Text",
        };
        self.template_node(tag, at, vec![property], vue_parent)
    }

    pub(super) fn text(
        &mut self,
        data: String,
        vue_parent: Option<vue::CompilerNodeIdentifier>,
        at: Span,
    ) -> vue::CompilerNodeIdentifier {
        let text = Text {
            raw: at,
            cooked: Some(data.into_boxed_str()),
        };
        self.vb.node(vue::NodeKind::Text(text), at, vue_parent, 0)
    }
}
