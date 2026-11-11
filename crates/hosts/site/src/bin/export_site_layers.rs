//! Prints one component's layers as JSON: the surface template, the HIR with each node's surface
//! origin, the bindings of name resolution and the template's references to them. The site's layer
//! figure is generated from this, so it shows what the pipeline built rather than a drawing of it.
//! Text nodes that are only whitespace are left out of both trees. Spans are UTF-16 offsets, as the
//! site indexes the source string.
//!
//! `cargo run -p rsvelte_site --bin export_site_layers -- <file.svelte>`

#![expect(
    clippy::print_stdout,
    clippy::print_stderr,
    reason = "a tool that prints its output"
)]

use std::process::ExitCode;

use oxc_ast::AstKind;
use oxc_ast::ast::VariableDeclarationKind;
use oxc_semantic::{ReferenceId, SymbolId};
use oxc_span::GetSpan;
use rsvelte_kernel::index::TypedIndex;
use rsvelte_kernel::output::structured_data::StructuredDataWriter;
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    self, AttributeValue, Children, CompilerSyntaxTree, ElementKind, NodeKind,
};
use rsvelte_svelte_syntax::syntax_tree::{Component, TemplateNode, TemplateNodeIdentifier};

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
    // The site keeps its sample as `.svelte.txt` only to hide it from its own svelte-check.
    let name = path.strip_suffix(".txt").unwrap_or(path).to_owned();
    let document = match rsvelte_kernel::source::document::Document::new(name, source_text) {
        Ok(document) => document,
        Err(error) => {
            eprintln!("{path}: {error:?}");
            return ExitCode::FAILURE;
        }
    };
    let source_text = document.text.as_str();
    let mut registry = rsvelte_kernel::computation::registry::Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let context = rsvelte_kernel::computation::database::DocumentContext::new(
        &document,
        registry.artifacts(),
    );
    let c = match rsvelte_svelte_syntax::fully_parsed(&context) {
        Ok(c) => c,
        Err(d) => {
            eprintln!("{path}: {}", d.message);
            return ExitCode::FAILURE;
        }
    };
    let h = context
        .get::<rsvelte_svelte_semantic::Lowered>()
        .as_ref()
        .expect("parsed component lowers");
    let res = context
        .get::<rsvelte_svelte_semantic::Resolved>()
        .as_ref()
        .expect("parsed component resolves");

    let index = LineIndex::new(source_text);
    let at = Positions {
        text: source_text,
        index: &index,
    };
    let mut w = StructuredDataWriter::new(true);
    w.begin_object().key("source").write_string(source_text);
    w.key("syntax_tree").begin_array();
    surface(&mut w, c, &at, c.children(c.root), 0);
    w.end_array();
    w.key("compiler_syntax_tree").begin_array();
    lowered(&mut w, c, h, &at, h.root, 0);
    w.end_array();

    let scoping = res.scoping();
    w.key("bindings").begin_array();
    for symbol in scoping.symbol_ids() {
        let span = scoping.symbol_span(symbol);
        w.begin_object()
            .key("id")
            .write_number(symbol.index())
            .key("name")
            .write_string(scoping.symbol_name(symbol))
            .key("declaration")
            .write_string(declaration(res, symbol))
            .key("rune")
            .write_string(&format!("{:?}", res.binding(symbol).kind))
            .key("reads")
            .write_number(res.counts().reads[symbol.index()])
            .key("writes")
            .write_number(res.writes(symbol));
        at.span_key(&mut w, "span", Span::new(span.start, span.end));
        w.end_object();
    }
    w.end_array();

    let script = c.instance.as_ref().map(|s| s.span);
    w.key("refs").begin_array();
    for reference in (0..scoping.references_len()).map(ReferenceId::from_usize) {
        let span = res.reference_span(reference);
        if script.is_some_and(|s| s.start_offset <= span.start && span.end <= s.end_offset) {
            continue;
        }
        w.begin_object();
        at.span_key(&mut w, "span", Span::new(span.start, span.end));
        w.key("binding");
        match scoping.get_reference(reference).symbol_id() {
            Some(symbol) => w.write_number(symbol.index()),
            None => w.null(),
        };
        w.end_object();
    }
    w.end_array();

    w.key("lint").begin_array();
    for finding in
        rsvelte_svelte_lint::lint(&context, &rsvelte_svelte_lint::Configuration::default())
            .expect("the component parsed")
    {
        let d = &finding.diagnostic;
        w.begin_object()
            .key("rule")
            .write_string(&d.code)
            .key("message")
            .write_string(&d.message);
        at.span_key(&mut w, "span", d.span);
        w.end_object();
    }
    w.end_array();
    w.end_object();
    print!("{}", w.finish());
    ExitCode::SUCCESS
}

/// What declares `symbol`, as the site's binding table names it.
fn declaration(
    res: &rsvelte_svelte_semantic::resolve::Resolution,
    symbol: SymbolId,
) -> &'static str {
    match res.declaration(symbol) {
        AstKind::VariableDeclarator(_) => match res.variable_kind(symbol) {
            Some(VariableDeclarationKind::Const) => "Const",
            Some(VariableDeclarationKind::Let) => "Let",
            _ => "Variable",
        },
        AstKind::Function(_) => "Function",
        AstKind::Class(_) => "Class",
        AstKind::ImportSpecifier(_)
        | AstKind::ImportDefaultSpecifier(_)
        | AstKind::ImportNamespaceSpecifier(_) => "Import",
        AstKind::FormalParameter(_) | AstKind::FormalParameterRest(_) => "Parameter",
        _ => "Template",
    }
}

/// The source and its line index, which turns byte spans into the site's UTF-16 offsets.
struct Positions<'a> {
    text: &'a str,
    index: &'a LineIndex,
}

impl Positions<'_> {
    fn span_key(&self, w: &mut StructuredDataWriter, key: &str, s: Span) {
        w.key(key)
            .begin_array()
            .write_number(self.index.line_column(s.start_offset).character)
            .write_number(self.index.line_column(s.end_offset).character)
            .end_array();
    }

    fn blank(&self, s: Span) -> bool {
        s.text(self.text).trim().is_empty()
    }

    fn row(&self, w: &mut StructuredDataWriter, depth: u32, label: &str, span: Span) {
        w.begin_object()
            .key("depth")
            .write_number(depth)
            .key("label")
            .write_string(label);
        self.span_key(w, "span", span);
    }
}

fn surface(
    w: &mut StructuredDataWriter,
    c: &Component,
    at: &Positions<'_>,
    list: &[TemplateNodeIdentifier],
    depth: u32,
) {
    for &t in list {
        let n = c.node(t);
        match *n {
            TemplateNode::Text { span } if at.blank(span) => continue,
            TemplateNode::Text { span } => {
                at.row(
                    w,
                    depth,
                    &format!("Text {:?}", span.text(at.text).trim()),
                    span,
                );
            }
            TemplateNode::Comment { span, .. } => at.row(w, depth, "Comment", span),
            TemplateNode::Expression { span, .. } => {
                at.row(
                    w,
                    depth,
                    &format!("Expression {}", span.text(at.text)),
                    span,
                );
            }
            TemplateNode::Element { name, span, .. } => {
                at.row(w, depth, &format!("Element <{}>", name.text(at.text)), span);
            }
            TemplateNode::If { elseif, span, .. } => {
                at.row(w, depth, if elseif { "If (elseif)" } else { "If" }, span);
            }
            TemplateNode::Each { span, .. } => at.row(w, depth, "Each", span),
            TemplateNode::Key { span, .. } => at.row(w, depth, "Key", span),
            TemplateNode::Await { span, .. } => at.row(w, depth, "Await", span),
            TemplateNode::Snippet { span, .. } => at.row(w, depth, "Snippet", span),
            TemplateNode::Render { span, .. } => at.row(w, depth, "Render", span),
            TemplateNode::Html { span, .. } => at.row(w, depth, "Html", span),
            TemplateNode::Const { span, .. } => at.row(w, depth, "Const", span),
            TemplateNode::Debug { span, .. } => at.row(w, depth, "Debug", span),
            TemplateNode::Declaration { span, .. } => at.row(w, depth, "Declaration", span),
        }
        w.key("id").write_number(t);
        w.end_object();
        match *n {
            TemplateNode::Element { children, .. } => {
                surface(w, c, at, c.children(children), depth + 1);
            }
            TemplateNode::If {
                consequent,
                alternate,
                ..
            } => {
                surface(w, c, at, c.children(consequent), depth + 1);
                if let Some(a) = alternate {
                    at.row(w, depth + 1, "alt", n.span());
                    w.key("id").null().end_object();
                    surface(w, c, at, c.children(a), depth + 2);
                }
            }
            TemplateNode::Each {
                body,
                fallback,
                has_fallback,
                ..
            } => {
                surface(w, c, at, c.children(body), depth + 1);
                if has_fallback {
                    at.row(w, depth + 1, "else", n.span());
                    w.key("id").null().end_object();
                    surface(w, c, at, c.children(fallback), depth + 2);
                }
            }
            TemplateNode::Key { body, .. } | TemplateNode::Snippet { body, .. } => {
                surface(w, c, at, c.children(body), depth + 1);
            }
            TemplateNode::Await {
                pending,
                then,
                catch,
                ..
            } => {
                for children in [pending, then, catch]
                    .into_iter()
                    .filter_map(rsvelte_svelte_syntax::syntax_tree::Range::present)
                {
                    surface(w, c, at, c.children(children), depth + 1);
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
    at: &Positions<'_>,
    list: Children,
    depth: u32,
) {
    for &identifier in h.children(list) {
        let node = h.node(identifier);
        let label = match &node.kind {
            NodeKind::Text { raw, .. } if at.blank(*raw) => continue,
            NodeKind::Text { .. } => {
                format!(
                    "Text {:?}",
                    node.kind.text(at.text).expect("a text node").trim()
                )
            }
            NodeKind::Comment { .. } => "Comment".to_owned(),
            NodeKind::Expression { .. } => format!("Expression {}", node.span.text(at.text)),
            NodeKind::Element(el) => {
                format!("{} <{}>", kind_name(el.kind), el.name.text(at.text))
            }
            NodeKind::If { branches, .. } => {
                format!("If, {} branches", h.branches(*branches).len())
            }
            NodeKind::Each(_) => "Each".to_owned(),
            NodeKind::Key { .. } => "Key".to_owned(),
            NodeKind::Await(_) => "Await".to_owned(),
            NodeKind::Snippet(_) => "Snippet".to_owned(),
            NodeKind::Render { .. } => "Render".to_owned(),
            NodeKind::Html { .. } => "Html".to_owned(),
            NodeKind::Const { .. } => "Const".to_owned(),
            NodeKind::Debug { .. } => "Debug".to_owned(),
            NodeKind::Declaration { .. } => "Declaration".to_owned(),
        };
        at.row(w, depth, &label, node.span);
        w.key("id")
            .write_number(identifier.index())
            .key("origin")
            .write_number(h.origin[identifier]);
        if let NodeKind::Element(el) = &node.kind {
            lowered_attributes(w, h.attributes(el.attributes), at);
        }
        w.end_object();
        match &node.kind {
            NodeKind::Element(el) => lowered(w, c, h, at, el.children, depth + 1),
            NodeKind::If {
                branches,
                otherwise,
            } => {
                for branch in h.branches(*branches) {
                    let test = c.javascript.get_expression(branch.test).span();
                    let test = Span::new(test.start, test.end);
                    let origin = c.node(branch.origin).span();
                    at.row(
                        w,
                        depth + 1,
                        &format!("branch {}", test.text(at.text)),
                        origin,
                    );
                    w.key("id")
                        .null()
                        .key("origin")
                        .write_number(branch.origin)
                        .end_object();
                    lowered(w, c, h, at, branch.body, depth + 2);
                }
                if let Some(alternate) = otherwise {
                    at.row(w, depth + 1, "else", node.span);
                    w.key("id").null().key("origin").null().end_object();
                    lowered(w, c, h, at, *alternate, depth + 2);
                }
            }
            NodeKind::Each(each) => {
                lowered(w, c, h, at, each.body, depth + 1);
                if let Some(f) = each.fallback {
                    at.row(w, depth + 1, "else", node.span);
                    w.key("id").null().key("origin").null().end_object();
                    lowered(w, c, h, at, f, depth + 2);
                }
            }
            _ => {
                for children in h.child_lists(identifier) {
                    lowered(w, c, h, at, children, depth + 1);
                }
            }
        }
    }
}

fn lowered_attributes(
    w: &mut StructuredDataWriter,
    attributes: &[compiler_syntax_tree::Attribute],
    at: &Positions<'_>,
) {
    w.key("attributes").begin_array();
    for attribute in attributes {
        w.begin_object()
            .key("name")
            .write_string(attribute.name.text(at.text))
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
            AttributeValue::On { .. } => w.write_string("On"),
            AttributeValue::Use { .. } => w.write_string("Use"),
            AttributeValue::Transition { .. } => w.write_string("Transition"),
            AttributeValue::Animate { .. } => w.write_string("Animate"),
            AttributeValue::Style { .. } => w.write_string("Style"),
            AttributeValue::Let(_) => w.write_string("Let"),
        };
        w.end_object();
    }
    w.end_array();
}

fn kind_name(k: ElementKind) -> String {
    match k {
        ElementKind::Metadata(Some(m)) => format!("Meta({m:?})"),
        other => format!("{other:?}"),
    }
}
