//! Prints one component's layers as JSON: the surface template, the HIR with each node's surface
//! origin, the bindings of name resolution and the template's references to them. The site's layer
//! figure is generated from this, so it shows what the pipeline built rather than a drawing of it.
//! Text nodes that are only whitespace are left out of both trees.
//!
//! `cargo run -p rsv_svelte --example layers -- <file.svelte>`

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "an example that prints its output"
)]

use std::process::ExitCode;

use rsv_kernel::idx::Idx;
use rsv_kernel::json::JsonWriter;
use rsv_kernel::source::Span;
use rsv_svelte::ast::{Component, TId, TNode};
use rsv_svelte::hir::{AttrValue, Children, ElementKind, Hir, NodeKind};
use rsv_svelte::{hir, parse, resolve};

#[expect(
    clippy::too_many_lines,
    reason = "prints each layer in turn; splitting it only adds plumbing"
)]
fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    let [path] = args.as_slice() else {
        eprintln!("usage: layers <file.svelte>");
        return ExitCode::FAILURE;
    };
    let src = match std::fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("{path}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let c = match parse::parse(&src) {
        Ok(c) => c,
        Err(d) => {
            eprintln!("{path}: {}", d.message);
            return ExitCode::FAILURE;
        }
    };
    let h = hir::lower(&c, &src);
    let res = resolve::resolve(&c.js, c.program, &h);

    let mut w = JsonWriter::new(true);
    w.begin_object().key("src").str(&src);
    w.key("ast").begin_array();
    surface(&mut w, &c, &src, c.children(c.root), 0);
    w.end_array();
    w.key("hir").begin_array();
    lowered(&mut w, &c, &h, &src, h.root, 0);
    w.end_array();

    w.key("bindings").begin_array();
    for (id, b) in res.sem.bindings.iter_enumerated() {
        let info = &res.bindings[id];
        let span = c.js.loc(b.node).span().expect("declared in source");
        w.begin_object()
            .key("id")
            .num(id.index())
            .key("name")
            .str(c.js.atoms.get(b.name))
            .key("decl")
            .str(&format!("{:?}", b.kind))
            .key("rune")
            .str(&format!("{:?}", info.kind))
            .key("reads")
            .num(b.reads)
            .key("writes")
            .num(b.writes);
        span_key(&mut w, "span", span);
        w.end_object();
    }
    w.end_array();

    let script = c.instance.as_ref().map(|s| s.span);
    w.key("refs").begin_array();
    for r in &res.sem.references {
        let span = c.js.loc(r.node).span().expect("parsed from source");
        if script.is_some_and(|s| s.lo <= span.lo && span.hi <= s.hi) {
            continue;
        }
        w.begin_object();
        span_key(&mut w, "span", span);
        w.key("binding");
        match r.binding {
            Some(b) => w.num(b.index()),
            None => w.null(),
        };
        w.end_object();
    }
    w.end_array();

    let parents = c.js.parents();
    let early = rsv_svelte::lint::AstCx {
        c: &c,
        src: &src,
        js: rsv_js::lint::JsFacts {
            ast: &c.js,
            sem: &res.sem,
            parents: &parents,
        },
    };
    let late = rsv_svelte::lint::HirCx {
        hir: &h,
        res: &res,
        src: &src,
    };
    w.key("lint").begin_array();
    for d in rsv_svelte::lint::lint(&early, &late) {
        let layer = if d.code == "svelte/button-has-type" {
            "late"
        } else {
            "early"
        };
        w.begin_object()
            .key("rule")
            .str(&d.code)
            .key("layer")
            .str(layer)
            .key("message")
            .str(&d.message);
        span_key(&mut w, "span", d.span);
        w.end_object();
    }
    w.end_array();
    w.end_object();
    print!("{}", w.finish());
    ExitCode::SUCCESS
}

fn span_key(w: &mut JsonWriter, key: &str, s: Span) {
    w.key(key).begin_array().num(s.lo).num(s.hi).end_array();
}

fn blank(src: &str, s: Span) -> bool {
    s.text(src).trim().is_empty()
}

fn row(w: &mut JsonWriter, depth: u32, label: &str, span: Span) {
    w.begin_object()
        .key("depth")
        .num(depth)
        .key("label")
        .str(label);
    span_key(w, "span", span);
}

fn surface(w: &mut JsonWriter, c: &Component, src: &str, list: &[TId], depth: u32) {
    for &t in list {
        let n = c.node(t);
        match *n {
            TNode::Text { span } if blank(src, span) => continue,
            TNode::Text { span } => {
                row(w, depth, &format!("Text {:?}", span.text(src).trim()), span);
            }
            TNode::Comment { span, .. } => row(w, depth, "Comment", span),
            TNode::Expr { span, .. } => row(w, depth, &format!("Expr {}", span.text(src)), span),
            TNode::Element { name, span, .. } => {
                row(w, depth, &format!("Element <{}>", name.text(src)), span);
            }
            TNode::If { elseif, span, .. } => {
                row(w, depth, if elseif { "If (elseif)" } else { "If" }, span);
            }
            TNode::Each { span, .. } => row(w, depth, "Each", span),
        }
        w.key("id").num(t);
        w.end_object();
        match *n {
            TNode::Element { children, .. } => surface(w, c, src, c.children(children), depth + 1),
            TNode::If { cons, alt, .. } => {
                surface(w, c, src, c.children(cons), depth + 1);
                if let Some(a) = alt {
                    row(w, depth + 1, "alt", n.span());
                    w.key("id").null().end_object();
                    surface(w, c, src, c.children(a), depth + 2);
                }
            }
            TNode::Each {
                body,
                fallback,
                has_fallback,
                ..
            } => {
                surface(w, c, src, c.children(body), depth + 1);
                if has_fallback {
                    row(w, depth + 1, "else", n.span());
                    w.key("id").null().end_object();
                    surface(w, c, src, c.children(fallback), depth + 2);
                }
            }
            _ => {}
        }
    }
}

fn lowered(w: &mut JsonWriter, c: &Component, h: &Hir, src: &str, list: Children, depth: u32) {
    for &id in h.children(list) {
        let node = h.node(id);
        let label = match &node.kind {
            NodeKind::Text { raw, .. } if blank(src, *raw) => continue,
            NodeKind::Text { .. } => {
                format!(
                    "Text {:?}",
                    node.kind.text(src).expect("a text node").trim()
                )
            }
            NodeKind::Comment { .. } => "Comment".to_owned(),
            NodeKind::Expr { .. } => format!("Expr {}", node.span.text(src)),
            NodeKind::Element(el) => format!("{} <{}>", kind_name(el.kind), el.name.text(src)),
            NodeKind::If { branches, .. } => {
                format!("If, {} branches", h.branches(*branches).len())
            }
            NodeKind::Each(_) => "Each".to_owned(),
        };
        row(w, depth, &label, node.span);
        w.key("id").num(id.index()).key("origin").num(h.origin[id]);
        if let NodeKind::Element(el) = &node.kind {
            w.key("attrs").begin_array();
            for attr in h.attrs(el.attrs) {
                w.begin_object()
                    .key("name")
                    .str(attr.name.text(src))
                    .key("value");
                match &attr.value {
                    AttrValue::Boolean => w.str("Boolean"),
                    AttrValue::Static(v) => w.str(&format!("Static {v:?}")),
                    AttrValue::Expression { .. } => w.str("Expression"),
                    AttrValue::Shorthand(_) => w.str("Shorthand"),
                    AttrValue::Interpolated(p) => {
                        w.str(&format!("Interpolated, {} parts", p.len()))
                    }
                    AttrValue::Bind(_) => w.str("Bind"),
                    AttrValue::Attach(_) => w.str("Attach"),
                    AttrValue::Class(_) => w.str("Class"),
                    AttrValue::Spread(_) => w.str("Spread"),
                };
                w.end_object();
            }
            w.end_array();
        }
        w.end_object();
        match &node.kind {
            NodeKind::Element(el) => lowered(w, c, h, src, el.children, depth + 1),
            NodeKind::If {
                branches,
                otherwise,
            } => {
                for branch in h.branches(*branches) {
                    let test = c.js.loc(branch.test).span().expect("parsed from source");
                    let at = c.node(branch.origin).span();
                    row(w, depth + 1, &format!("branch {}", test.text(src)), at);
                    w.key("id")
                        .null()
                        .key("origin")
                        .num(branch.origin)
                        .end_object();
                    lowered(w, c, h, src, branch.body, depth + 2);
                }
                if let Some(alt) = otherwise {
                    row(w, depth + 1, "else", node.span);
                    w.key("id").null().key("origin").null().end_object();
                    lowered(w, c, h, src, *alt, depth + 2);
                }
            }
            NodeKind::Each(each) => {
                lowered(w, c, h, src, each.body, depth + 1);
                if let Some(f) = each.fallback {
                    row(w, depth + 1, "else", node.span);
                    w.key("id").null().key("origin").null().end_object();
                    lowered(w, c, h, src, f, depth + 2);
                }
            }
            _ => {}
        }
    }
}

fn kind_name(k: ElementKind) -> String {
    match k {
        ElementKind::Meta(Some(m)) => format!("Meta({m:?})"),
        other => format!("{other:?}"),
    }
}
