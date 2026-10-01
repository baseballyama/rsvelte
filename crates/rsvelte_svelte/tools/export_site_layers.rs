//! Prints one component's layers as JSON: the surface template, the HIR with each node's surface
//! origin, the bindings of name resolution and the template's references to them. The site's layer
//! figure is generated from this, so it shows what the pipeline built rather than a drawing of it.
//! Text nodes that are only whitespace are left out of both trees.
//!
//! `cargo run -p rsvelte_svelte --example export_site_layers -- <file.svelte>`

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "an example that prints its output"
)]

use std::process::ExitCode;

use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte::compilation::compiler_syntax_tree;
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    AttributeValue, Children, CompilerSyntaxTree, ElementKind, NodeKind,
};
use rsvelte_svelte::semantic::resolve;
use rsvelte_svelte::syntax::parse;
use rsvelte_svelte::syntax::syntax_tree::{Component, TemplateNode, TemplateNodeIdentifier};

#[expect(
    clippy::too_many_lines,
    reason = "prints each layer in turn; splitting it only adds plumbing"
)]
fn main() -> ExitCode {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    let [path] = arguments.as_slice() else {
        eprintln!("usage: export_site_layers <file.svelte>");
        return ExitCode::FAILURE;
    };
    let source_text = match std::fs::read_to_string(path) {
        Ok(s) => s,
        Err(e) => {
            eprintln!("{path}: {e}");
            return ExitCode::FAILURE;
        }
    };
    let c = match parse::parse(&source_text) {
        Ok(c) => c,
        Err(d) => {
            eprintln!("{path}: {}", d.message);
            return ExitCode::FAILURE;
        }
    };
    let h = compiler_syntax_tree::lower(&c, &source_text);
    let res = resolve::resolve(&c.javascript, c.program, &h);

    let mut w = StructuredDataWriter::new(true);
    w.begin_object().key("source").write_string(&source_text);
    w.key("syntax_tree").begin_array();
    surface(&mut w, &c, &source_text, c.children(c.root), 0);
    w.end_array();
    w.key("compiler_syntax_tree").begin_array();
    lowered(&mut w, &c, &h, &source_text, h.root, 0);
    w.end_array();

    w.key("bindings").begin_array();
    for (identifier, b) in res.sem.bindings.iter_enumerated() {
        let info = &res.bindings[identifier];
        let span = c
            .javascript
            .source_location(b.node)
            .span()
            .expect("declared in source");
        w.begin_object()
            .key("id")
            .write_number(identifier.index())
            .key("name")
            .write_string(c.javascript.atoms.get(b.name))
            .key("declaration")
            .write_string(&format!("{:?}", b.kind))
            .key("rune")
            .write_string(&format!("{:?}", info.kind))
            .key("reads")
            .write_number(b.reads)
            .key("writes")
            .write_number(b.writes);
        span_key(&mut w, "span", span);
        w.end_object();
    }
    w.end_array();

    let script = c.instance.as_ref().map(|s| s.span);
    w.key("refs").begin_array();
    for r in &res.sem.references {
        let span = c
            .javascript
            .source_location(r.node)
            .span()
            .expect("parsed from source");
        if script
            .is_some_and(|s| s.start_offset <= span.start_offset && span.end_offset <= s.end_offset)
        {
            continue;
        }
        w.begin_object();
        span_key(&mut w, "span", span);
        w.key("binding");
        match r.binding {
            Some(b) => w.write_number(b.index()),
            None => w.null(),
        };
        w.end_object();
    }
    w.end_array();

    let parents = c.javascript.parents();
    let early = rsvelte_svelte::tooling::lint::SyntaxTreeContext {
        c: &c,
        source_text: &source_text,
        javascript: rsvelte_javascript::lint::JavaScriptFacts {
            syntax_tree: &c.javascript,
            sem: &res.sem,
            parents: &parents,
        },
    };
    let late = rsvelte_svelte::tooling::lint::CompilerSyntaxTreeContext {
        compiler_syntax_tree: &h,
        res: &res,
        source_text: &source_text,
    };
    w.key("lint").begin_array();
    for d in rsvelte_svelte::tooling::lint::lint(&early, &late) {
        let layer = if d.code == "svelte/button-has-type" {
            "late"
        } else {
            "early"
        };
        w.begin_object()
            .key("rule")
            .write_string(&d.code)
            .key("layer")
            .write_string(layer)
            .key("message")
            .write_string(&d.message);
        span_key(&mut w, "span", d.span);
        w.end_object();
    }
    w.end_array();
    w.end_object();
    print!("{}", w.finish());
    ExitCode::SUCCESS
}

fn span_key(w: &mut StructuredDataWriter, key: &str, s: Span) {
    w.key(key)
        .begin_array()
        .write_number(s.start_offset)
        .write_number(s.end_offset)
        .end_array();
}

fn blank(source_text: &str, s: Span) -> bool {
    s.text(source_text).trim().is_empty()
}

fn row(w: &mut StructuredDataWriter, depth: u32, label: &str, span: Span) {
    w.begin_object()
        .key("depth")
        .write_number(depth)
        .key("label")
        .write_string(label);
    span_key(w, "span", span);
}

fn surface(
    w: &mut StructuredDataWriter,
    c: &Component,
    source_text: &str,
    list: &[TemplateNodeIdentifier],
    depth: u32,
) {
    for &t in list {
        let n = c.node(t);
        match *n {
            TemplateNode::Text { span } if blank(source_text, span) => continue,
            TemplateNode::Text { span } => {
                row(
                    w,
                    depth,
                    &format!("Text {:?}", span.text(source_text).trim()),
                    span,
                );
            }
            TemplateNode::Comment { span, .. } => row(w, depth, "Comment", span),
            TemplateNode::Expression { span, .. } => {
                row(
                    w,
                    depth,
                    &format!("Expression {}", span.text(source_text)),
                    span,
                );
            }
            TemplateNode::Element { name, span, .. } => {
                row(
                    w,
                    depth,
                    &format!("Element <{}>", name.text(source_text)),
                    span,
                );
            }
            TemplateNode::If { elseif, span, .. } => {
                row(w, depth, if elseif { "If (elseif)" } else { "If" }, span);
            }
            TemplateNode::Each { span, .. } => row(w, depth, "Each", span),
        }
        w.key("id").write_number(t);
        w.end_object();
        match *n {
            TemplateNode::Element { children, .. } => {
                surface(w, c, source_text, c.children(children), depth + 1);
            }
            TemplateNode::If {
                consequent,
                alternate,
                ..
            } => {
                surface(w, c, source_text, c.children(consequent), depth + 1);
                if let Some(a) = alternate {
                    row(w, depth + 1, "alt", n.span());
                    w.key("id").null().end_object();
                    surface(w, c, source_text, c.children(a), depth + 2);
                }
            }
            TemplateNode::Each {
                body,
                fallback,
                has_fallback,
                ..
            } => {
                surface(w, c, source_text, c.children(body), depth + 1);
                if has_fallback {
                    row(w, depth + 1, "else", n.span());
                    w.key("id").null().end_object();
                    surface(w, c, source_text, c.children(fallback), depth + 2);
                }
            }
            _ => {}
        }
    }
}

fn lowered(
    w: &mut StructuredDataWriter,
    c: &Component,
    h: &CompilerSyntaxTree,
    source_text: &str,
    list: Children,
    depth: u32,
) {
    for &identifier in h.children(list) {
        let node = h.node(identifier);
        let label = match &node.kind {
            NodeKind::Text { raw, .. } if blank(source_text, *raw) => continue,
            NodeKind::Text { .. } => {
                format!(
                    "Text {:?}",
                    node.kind.text(source_text).expect("a text node").trim()
                )
            }
            NodeKind::Comment { .. } => "Comment".to_owned(),
            NodeKind::Expression { .. } => format!("Expression {}", node.span.text(source_text)),
            NodeKind::Element(el) => {
                format!("{} <{}>", kind_name(el.kind), el.name.text(source_text))
            }
            NodeKind::If { branches, .. } => {
                format!("If, {} branches", h.branches(*branches).len())
            }
            NodeKind::Each(_) => "Each".to_owned(),
        };
        row(w, depth, &label, node.span);
        w.key("id")
            .write_number(identifier.index())
            .key("origin")
            .write_number(h.origin[identifier]);
        if let NodeKind::Element(el) = &node.kind {
            w.key("attributes").begin_array();
            for attribute in h.attributes(el.attributes) {
                w.begin_object()
                    .key("name")
                    .write_string(attribute.name.text(source_text))
                    .key("value");
                match &attribute.value {
                    AttributeValue::Boolean => w.write_string("Boolean"),
                    AttributeValue::Static(v) => w.write_string(&format!("Static {v:?}")),
                    AttributeValue::Expression { .. } => w.write_string("Expression"),
                    AttributeValue::Shorthand(_) => w.write_string("Shorthand"),
                    AttributeValue::Interpolated(p) => {
                        w.write_string(&format!("Interpolated, {} parts", p.len()))
                    }
                    AttributeValue::Bind(_) => w.write_string("Bind"),
                    AttributeValue::Attach(_) => w.write_string("Attach"),
                    AttributeValue::Class(_) => w.write_string("Class"),
                    AttributeValue::Spread(_) => w.write_string("Spread"),
                };
                w.end_object();
            }
            w.end_array();
        }
        w.end_object();
        match &node.kind {
            NodeKind::Element(el) => lowered(w, c, h, source_text, el.children, depth + 1),
            NodeKind::If {
                branches,
                otherwise,
            } => {
                for branch in h.branches(*branches) {
                    let test = c
                        .javascript
                        .source_location(branch.test)
                        .span()
                        .expect("parsed from source");
                    let at = c.node(branch.origin).span();
                    row(
                        w,
                        depth + 1,
                        &format!("branch {}", test.text(source_text)),
                        at,
                    );
                    w.key("id")
                        .null()
                        .key("origin")
                        .write_number(branch.origin)
                        .end_object();
                    lowered(w, c, h, source_text, branch.body, depth + 2);
                }
                if let Some(alternate) = otherwise {
                    row(w, depth + 1, "else", node.span);
                    w.key("id").null().key("origin").null().end_object();
                    lowered(w, c, h, source_text, *alternate, depth + 2);
                }
            }
            NodeKind::Each(each) => {
                lowered(w, c, h, source_text, each.body, depth + 1);
                if let Some(f) = each.fallback {
                    row(w, depth + 1, "else", node.span);
                    w.key("id").null().key("origin").null().end_object();
                    lowered(w, c, h, source_text, f, depth + 2);
                }
            }
            _ => {}
        }
    }
}

fn kind_name(k: ElementKind) -> String {
    match k {
        ElementKind::Metadata(Some(m)) => format!("Meta({m:?})"),
        other => format!("{other:?}"),
    }
}
