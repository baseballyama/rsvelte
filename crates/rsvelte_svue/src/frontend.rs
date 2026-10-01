//! The Vue parser's tree, read as a Svelte component: the Svelte HIR and the template expressions
//! Svelte's name resolution takes as roots.

use rsvelte_javascript::NodeIdentifier;
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    self, Attribute, AttributeValue, Branch, Children, CompilerNodeIdentifier, CompilerSyntaxTree,
    CompilerSyntaxTreeBuilder, Element, Name, NodeKind,
};
use rsvelte_vue::syntax_tree::{
    AttributeKind, DirectiveExpression, DirectiveName, SingleFileComponent, TemplateNode,
    TemplateNodeIdentifier,
};

#[derive(Debug)]
pub struct SvelteView {
    pub compiler_syntax_tree: CompilerSyntaxTree,
    /// Every template expression, in document order.
    pub template_expressions: Vec<NodeIdentifier>,
}

type R<T> = Result<T, Diagnostic>;

fn unsupported(what: &str, span: Span) -> Diagnostic {
    Diagnostic::error(
        "compile_unsupported",
        format!("not supported in .svue: {what}"),
        span,
    )
}

/// # Errors
///
/// A `compile_unsupported` [`Diagnostic`] for a construct with no Svelte meaning here: a `v-for`,
/// a directive other than `:x` / `@x` with an argument and a value, a `v-else` that follows no
/// `v-if`, a second `<style>`.
pub fn build(sfc: &SingleFileComponent, source_text: &str) -> R<SvelteView> {
    if let Some(extra) = sfc.styles.get(1) {
        return Err(unsupported("a second <style>", extra.span));
    }
    let mut f = Frontend {
        sfc,
        source_text,
        b: CompilerSyntaxTreeBuilder::new(source_text, sfc.nodes.len(), sfc.attributes.len()),
        template_expressions: Vec::new(),
    };
    let root = f.list(sfc.root(), None)?;
    Ok(SvelteView {
        compiler_syntax_tree: f.b.finish(root),
        template_expressions: f.template_expressions,
    })
}

struct Frontend<'a> {
    sfc: &'a SingleFileComponent,
    source_text: &'a str,
    b: CompilerSyntaxTreeBuilder<'a>,
    template_expressions: Vec<NodeIdentifier>,
}

/// The branches of a `v-if` chain collected so far.
struct Chain {
    node: CompilerNodeIdentifier,
    branches: Vec<Branch>,
    span: Span,
}

impl Frontend<'_> {
    /// A child list, with each `v-if` chain folded into one `if` node.
    fn list(
        &mut self,
        identifiers: &[TemplateNodeIdentifier],
        parent: Option<CompilerNodeIdentifier>,
    ) -> R<Children> {
        let mut out = Vec::with_capacity(identifiers.len());
        let mut chain: Option<Chain> = None;
        // Whitespace and comments after a branch: dropped if the chain goes on, as Vue drops
        // them, kept if it ends.
        let mut pending: Vec<TemplateNodeIdentifier> = Vec::new();
        for &t in identifiers {
            let n = self.sfc.node(t);
            let dir = rsvelte_vue::resolve::if_directive(self.sfc, t);
            let continues = matches!(dir, Some(DirectiveName::ElseIf | DirectiveName::Else));
            if chain.is_some() && !continues {
                let blank = match n {
                    TemplateNode::Comment { .. } => true,
                    TemplateNode::Text { span } => is_blank(span.text(self.source_text)),
                    _ => false,
                };
                if blank {
                    pending.push(t);
                    continue;
                }
                self.close(chain.take(), None);
                for p in std::mem::take(&mut pending) {
                    out.push(self.node(p, parent)?);
                }
            }
            pending.clear();
            match dir {
                Some(DirectiveName::If) => {
                    let span = n.span();
                    let placeholder = NodeKind::Comment {
                        data: Span::default(),
                    };
                    let node = self.b.node(placeholder, span, parent, t);
                    out.push(node);
                    let mut c = Chain {
                        node,
                        branches: Vec::new(),
                        span,
                    };
                    self.branch(&mut c, t)?;
                    chain = Some(c);
                }
                Some(DirectiveName::ElseIf) => {
                    let Some(c) = chain.as_mut() else {
                        return Err(unsupported("a v-else-if without its v-if", n.span()));
                    };
                    self.branch(c, t)?;
                }
                Some(_) => {
                    let Some(c) = chain.take() else {
                        return Err(unsupported("a v-else without its v-if", n.span()));
                    };
                    let el = self.element(t, Some(c.node))?;
                    let otherwise = self.b.children(&[el]);
                    self.close(Some(c), Some((otherwise, n.span())));
                }
                None => out.push(self.node(t, parent)?),
            }
        }
        self.close(chain, None);
        for p in pending {
            out.push(self.node(p, parent)?);
        }
        Ok(self.b.children(&out))
    }

    fn branch(&mut self, c: &mut Chain, t: TemplateNodeIdentifier) -> R<()> {
        let TemplateNode::Element { attributes, .. } = *self.sfc.node(t) else {
            unreachable!("a v-if sits on an element")
        };
        let test = self
            .sfc
            .attributes(attributes)
            .iter()
            .find_map(|a| match &a.kind {
                AttributeKind::Directive(d)
                    if matches!(d.name, DirectiveName::If | DirectiveName::ElseIf) =>
                {
                    match d.exp {
                        DirectiveExpression::Expression(e) => Some(e),
                        _ => None,
                    }
                }
                _ => None,
            })
            .ok_or_else(|| unsupported("a v-if without an expression", self.sfc.node(t).span()))?;
        self.template_expressions.push(test);
        let el = self.element(t, Some(c.node))?;
        let body = self.b.children(&[el]);
        c.branches.push(Branch {
            test,
            body,
            origin: t,
        });
        c.span.end_offset = self.sfc.node(t).span().end_offset;
        Ok(())
    }

    fn close(&mut self, chain: Option<Chain>, otherwise: Option<(Children, Span)>) {
        let Some(mut c) = chain else {
            return;
        };
        if let Some((_, span)) = otherwise {
            c.span.end_offset = span.end_offset;
        }
        let branches = self.b.branches(c.branches);
        self.b.set_kind(
            c.node,
            NodeKind::If {
                branches,
                otherwise: otherwise.map(|(children, _)| children),
            },
        );
        self.b.set_span(c.node, c.span);
    }

    fn node(
        &mut self,
        t: TemplateNodeIdentifier,
        parent: Option<CompilerNodeIdentifier>,
    ) -> R<CompilerNodeIdentifier> {
        let n = self.sfc.node(t);
        let kind = match *n {
            TemplateNode::Text { span } => compiler_syntax_tree::text(span, self.source_text),
            TemplateNode::Comment { data, .. } => NodeKind::Comment { data },
            TemplateNode::Interpolation { expression, .. } => {
                self.template_expressions.push(expression);
                NodeKind::Expression { expression }
            }
            TemplateNode::Element { .. } => return self.element(t, parent),
        };
        Ok(self.b.node(kind, n.span(), parent, t))
    }

    fn element(
        &mut self,
        t: TemplateNodeIdentifier,
        parent: Option<CompilerNodeIdentifier>,
    ) -> R<CompilerNodeIdentifier> {
        let TemplateNode::Element {
            name,
            attributes: attribute_range,
            children,
            start_tag,
            span,
            ..
        } = *self.sfc.node(t)
        else {
            unreachable!("called on elements")
        };
        let placeholder = NodeKind::Comment {
            data: Span::default(),
        };
        let identifier = self.b.node(placeholder, span, parent, t);
        let mut attributes = Vec::with_capacity(attribute_range.len as usize);
        for (i, a) in self.sfc.attributes(attribute_range).iter().enumerate() {
            let (name, value) = match &a.kind {
                AttributeKind::Static => (
                    Name::Source(a.name),
                    a.value.map_or(AttributeValue::Boolean, |v| {
                        AttributeValue::Static(decoded(v.text(self.source_text)))
                    }),
                ),
                AttributeKind::Directive(d) => match (d.name, d.arg, &d.exp) {
                    (DirectiveName::If | DirectiveName::ElseIf | DirectiveName::Else, ..) => {
                        continue;
                    }
                    (DirectiveName::Bind, Some(arg), DirectiveExpression::Expression(e)) => {
                        self.template_expressions.push(*e);
                        (Name::Source(arg), expression(*e))
                    }
                    (DirectiveName::On, Some(arg), DirectiveExpression::Expression(e)) => {
                        self.template_expressions.push(*e);
                        let text = format!("on{}", arg.text(self.source_text)).into_boxed_str();
                        (Name::Spelled { text, span: a.name }, expression(*e))
                    }
                    _ => return Err(unsupported("this directive", a.span)),
                },
            };
            attributes.push(Attribute {
                name,
                value,
                span: a.span,
                owner: identifier,
                origin: attribute_range.start + i as u32,
            });
        }
        let kind = self.b.element_kind(name.text(self.source_text), parent);
        let attributes = self.b.attributes(attributes);
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
        let children = self.list(self.sfc.children(children), Some(identifier))?;
        self.b.set_element_children(identifier, children);
        Ok(identifier)
    }
}

/// A `:x` or `@x` value reads as Svelte's `x={e}`.
const fn expression(expression: NodeIdentifier) -> AttributeValue {
    AttributeValue::Expression {
        expression,
        quoted: false,
    }
}

fn decoded(raw: &str) -> Box<str> {
    rsvelte_svelte::syntax::syntax_tree::decode_text(raw)
        .into_owned()
        .into_boxed_str()
}

fn is_blank(s: &str) -> bool {
    s.bytes().all(|b| b.is_ascii_whitespace())
}
