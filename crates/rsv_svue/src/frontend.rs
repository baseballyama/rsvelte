//! The Vue parser's tree, read as a Svelte component: the Svelte HIR and the template expressions
//! Svelte's name resolution takes as roots.

use rsv_js::NodeId;
use rsv_kernel::diag::Diagnostic;
use rsv_kernel::source::Span;
use rsv_svelte::hir::{
    self, AttrValue, Attribute, Branch, Children, Element, Hir, HirBuilder, HirId, Name, NodeKind,
};
use rsv_vue::ast::{AttrKind, DirExp, DirName, Sfc, TId, TNode};

#[derive(Debug)]
pub struct SvelteView {
    pub hir: Hir,
    /// Every template expression, in document order.
    pub template_exprs: Vec<NodeId>,
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
pub fn build(sfc: &Sfc, src: &str) -> R<SvelteView> {
    if let Some(extra) = sfc.styles.get(1) {
        return Err(unsupported("a second <style>", extra.span));
    }
    let mut f = Frontend {
        sfc,
        src,
        b: HirBuilder::new(src, sfc.nodes.len(), sfc.attrs.len()),
        template_exprs: Vec::new(),
    };
    let root = f.list(sfc.root(), None)?;
    Ok(SvelteView {
        hir: f.b.finish(root),
        template_exprs: f.template_exprs,
    })
}

struct Frontend<'a> {
    sfc: &'a Sfc,
    src: &'a str,
    b: HirBuilder<'a>,
    template_exprs: Vec<NodeId>,
}

/// The branches of a `v-if` chain collected so far.
struct Chain {
    node: HirId,
    branches: Vec<Branch>,
    span: Span,
}

impl Frontend<'_> {
    /// A child list, with each `v-if` chain folded into one `if` node.
    fn list(&mut self, ids: &[TId], parent: Option<HirId>) -> R<Children> {
        let mut out = Vec::with_capacity(ids.len());
        let mut chain: Option<Chain> = None;
        // Whitespace and comments after a branch: dropped if the chain goes on, as Vue drops
        // them, kept if it ends.
        let mut pending: Vec<TId> = Vec::new();
        for &t in ids {
            let n = self.sfc.node(t);
            let dir = rsv_vue::resolve::if_directive(self.sfc, t);
            let continues = matches!(dir, Some(DirName::ElseIf | DirName::Else));
            if chain.is_some() && !continues {
                let blank = match n {
                    TNode::Comment { .. } => true,
                    TNode::Text { span } => is_blank(span.text(self.src)),
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
                Some(DirName::If) => {
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
                Some(DirName::ElseIf) => {
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

    fn branch(&mut self, c: &mut Chain, t: TId) -> R<()> {
        let TNode::Element { attrs, .. } = *self.sfc.node(t) else {
            unreachable!("a v-if sits on an element")
        };
        let test = self
            .sfc
            .attrs(attrs)
            .iter()
            .find_map(|a| match &a.kind {
                AttrKind::Directive(d) if matches!(d.name, DirName::If | DirName::ElseIf) => {
                    match d.exp {
                        DirExp::Expr(e) => Some(e),
                        _ => None,
                    }
                }
                _ => None,
            })
            .ok_or_else(|| unsupported("a v-if without an expression", self.sfc.node(t).span()))?;
        self.template_exprs.push(test);
        let el = self.element(t, Some(c.node))?;
        let body = self.b.children(&[el]);
        c.branches.push(Branch {
            test,
            body,
            origin: t,
        });
        c.span.hi = self.sfc.node(t).span().hi;
        Ok(())
    }

    fn close(&mut self, chain: Option<Chain>, otherwise: Option<(Children, Span)>) {
        let Some(mut c) = chain else {
            return;
        };
        if let Some((_, span)) = otherwise {
            c.span.hi = span.hi;
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

    fn node(&mut self, t: TId, parent: Option<HirId>) -> R<HirId> {
        let n = self.sfc.node(t);
        let kind = match *n {
            TNode::Text { span } => hir::text(span, self.src),
            TNode::Comment { data, .. } => NodeKind::Comment { data },
            TNode::Interpolation { expr, .. } => {
                self.template_exprs.push(expr);
                NodeKind::Expr { expr }
            }
            TNode::Element { .. } => return self.element(t, parent),
        };
        Ok(self.b.node(kind, n.span(), parent, t))
    }

    fn element(&mut self, t: TId, parent: Option<HirId>) -> R<HirId> {
        let TNode::Element {
            name,
            attrs,
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
        let id = self.b.node(placeholder, span, parent, t);
        let mut attributes = Vec::with_capacity(attrs.len as usize);
        for (i, a) in self.sfc.attrs(attrs).iter().enumerate() {
            let (name, value) = match &a.kind {
                AttrKind::Static => (
                    Name::Source(a.name),
                    a.value.map_or(AttrValue::Boolean, |v| {
                        AttrValue::Static(decoded(v.text(self.src)))
                    }),
                ),
                AttrKind::Directive(d) => match (d.name, d.arg, &d.exp) {
                    (DirName::If | DirName::ElseIf | DirName::Else, ..) => continue,
                    (DirName::Bind, Some(arg), DirExp::Expr(e)) => {
                        self.template_exprs.push(*e);
                        (Name::Source(arg), expression(*e))
                    }
                    (DirName::On, Some(arg), DirExp::Expr(e)) => {
                        self.template_exprs.push(*e);
                        let text = format!("on{}", arg.text(self.src)).into_boxed_str();
                        (Name::Spelled { text, span: a.name }, expression(*e))
                    }
                    _ => return Err(unsupported("this directive", a.span)),
                },
            };
            attributes.push(Attribute {
                name,
                value,
                span: a.span,
                owner: id,
                origin: attrs.start + i as u32,
            });
        }
        let kind = self.b.element_kind(name.text(self.src), parent);
        let attrs = self.b.attributes(attributes);
        // `element_kind` of a descendant reads this node's kind and attributes.
        self.b.set_kind(
            id,
            NodeKind::Element(Element {
                name,
                kind,
                attrs,
                children: Children::default(),
                start_tag,
            }),
        );
        let children = self.list(self.sfc.children(children), Some(id))?;
        self.b.set_element_children(id, children);
        Ok(id)
    }
}

/// A `:x` or `@x` value reads as Svelte's `x={e}`.
const fn expression(expr: NodeId) -> AttrValue {
    AttrValue::Expression {
        expr,
        quoted: false,
    }
}

fn decoded(raw: &str) -> Box<str> {
    rsv_svelte::ast::decode_text(raw)
        .into_owned()
        .into_boxed_str()
}

fn is_blank(s: &str) -> bool {
    s.bytes().all(|b| b.is_ascii_whitespace())
}
