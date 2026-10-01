//! Server lowering: the component becomes string pushes onto `$$renderer`. Mirrors upstream
//! `3-transform/server` (Fragment, `RegularElement`, `IfBlock`, shared/utils, shared/element).

use rsvelte_javascript::copy::copy;
use rsvelte_javascript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_kernel::diagnostics::diagnostic::Diagnostic;
use rsvelte_kernel::source::positions::SourceLocation;
use rsvelte_markup::decode_text;

use super::script::{ScriptRewrite, lower_instance};
use super::{
    CompileInput, Item, Parent, Target, clean_nodes, escape_markup, event_attribute,
    is_boolean_attribute, sanitize_template_string,
};
use crate::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, ElementKind, NodeKind,
    Part,
};
use crate::semantic::analyze::Analysis;
use crate::semantic::resolve::Resolution;
use crate::syntax::parse::is_void;

type R<T> = Result<T, Diagnostic>;

const BLOCK_CLOSE: &str = "<!--]-->";
const EMPTY_COMMENT: &str = "<!---->";

/// One piece of a server template before it is folded into `$$renderer.push(…)` calls.
enum Piece {
    /// Cooked text.
    Text(String),
    /// A template literal, as cooked quasis and expressions.
    Template(Vec<String>, Vec<NodeIdentifier>),
    Expression(NodeIdentifier),
    Statement(NodeIdentifier),
}

struct Sx<'a> {
    javascript: &'a SyntaxTree,
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    res: &'a Resolution,
    an: &'a Analysis,
    out: SyntaxTree,
}

/// # Errors
///
/// An `unsupported` [`Diagnostic`] if the component uses an element or attribute the server
/// lowering does not handle yet.
pub fn lower(
    input: &CompileInput<'_>,
    res: &Resolution,
    an: &Analysis,
) -> R<(SyntaxTree, NodeIdentifier)> {
    let mut sx = Sx {
        javascript: input.javascript,
        compiler_syntax_tree: input.compiler_syntax_tree,
        source_text: input.source_text,
        res,
        an,
        out: SyntaxTree::new(),
    };
    let mut hoisted = Vec::new();
    let mut rw = ScriptRewrite {
        target: Target::Server,
        res,
    };
    let instance = lower_instance(
        input.javascript,
        &mut sx.out,
        &mut rw,
        input.program,
        &mut hoisted,
    )?;
    let template = sx.fragment(
        Parent::Root,
        input
            .compiler_syntax_tree
            .children(input.compiler_syntax_tree.root),
    )?;

    let o = &mut sx.out;
    let mut body: Vec<NodeIdentifier> = instance;
    body.extend(template);
    if an.needs_context {
        let block = o.block(&body, SourceLocation::SYNTHETIC);
        let param = o.identifier("$$renderer");
        let f = o.arrow(&[param], block, false, false, SourceLocation::SYNTHETIC);
        let r = o.identifier("$$renderer");
        let callee = o.dot(r, "component");
        let call = o.call(callee, &[f], false, SourceLocation::SYNTHETIC);
        body = vec![o.expression_statement(call)];
    }
    let mut parameters = vec![o.identifier("$$renderer")];
    if an.needs_context || res.uses_props {
        parameters.push(o.identifier("$$props"));
    }
    let block = o.block(&body, SourceLocation::SYNTHETIC);
    let name = o.identifier(&an.name);
    let func = o.function(
        true,
        Some(name),
        &parameters,
        block,
        false,
        SourceLocation::SYNTHETIC,
    );

    let ns = o.identifier("$");
    let spec = o.import_namespace(ns, SourceLocation::SYNTHETIC);
    let source = o.write_string("svelte/internal/server");
    let mut program = vec![o.import(&[spec], source, false, SourceLocation::SYNTHETIC)];
    program.extend(hoisted);
    program.push(o.export_default(func, SourceLocation::SYNTHETIC));
    let root = o.program(&program, SourceLocation::SYNTHETIC);
    Ok((sx.out, root))
}

impl Sx<'_> {
    fn expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        let mut rw = ScriptRewrite {
            target: Target::Server,
            res: self.res,
        };
        copy(self.javascript, &mut self.out, &mut rw, e)
    }

    fn fragment(
        &mut self,
        parent: Parent<'_>,
        list: &[CompilerNodeIdentifier],
    ) -> R<Vec<NodeIdentifier>> {
        let cleaned = clean_nodes(
            self.compiler_syntax_tree,
            self.source_text,
            parent,
            list,
            false,
        );
        let mut template = Vec::new();
        if cleaned.text_first {
            template.push(Piece::Text(EMPTY_COMMENT.into()));
        }
        self.process_children(&cleaned.items, &mut template)?;
        Ok(self.build_template(template))
    }

    /// Upstream `process_children` (server).
    fn process_children(&mut self, items: &[Item<'_>], template: &mut Vec<Piece>) -> R<()> {
        let mut sequence: Vec<&Item<'_>> = Vec::new();
        for item in items {
            match item {
                Item::Text { .. } | Item::Expression(_) => sequence.push(item),
                Item::Node(identifier) => {
                    self.flush(&mut sequence, template);
                    match self.compiler_syntax_tree.node(*identifier).kind {
                        NodeKind::Element(_) => self.element(*identifier, template)?,
                        NodeKind::If { .. } => self.if_block(*identifier, template)?,
                        _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
                    }
                }
            }
        }
        self.flush(&mut sequence, template);
        Ok(())
    }

    fn flush(&mut self, sequence: &mut Vec<&Item<'_>>, template: &mut Vec<Piece>) {
        if sequence.is_empty() {
            return;
        }
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for item in sequence.drain(..) {
            match item {
                Item::Text { data, .. } => quasis
                    .last_mut()
                    .expect("never empty")
                    .push_str(&escape_markup(data, false)),
                Item::Expression(e) => {
                    let evaluated = self.res.evaluate(self.javascript, self.source_text, *e);
                    if evaluated.is_known {
                        let s = known_string(&evaluated.value);
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&escape_markup(&s, false));
                    } else {
                        let v = self.expression(*e);
                        expressions.push(self.out.runtime("$", "escape", &[v]));
                        quasis.push(String::new());
                    }
                }
                Item::Node(_) => unreachable!("sequences hold text and expressions"),
            }
        }
        template.push(Piece::Template(quasis, expressions));
    }

    /// Upstream `build_template`: adjacent pieces fold into one `$$renderer.push(`…`)`.
    fn build_template(&mut self, template: Vec<Piece>) -> Vec<NodeIdentifier> {
        let mut statements = Vec::new();
        let mut strings: Vec<String> = Vec::new();
        let mut expressions: Vec<NodeIdentifier> = Vec::new();
        for piece in template {
            if let Piece::Statement(s) = piece {
                if !strings.is_empty() {
                    statements.push(self.push_call(
                        &std::mem::take(&mut strings),
                        &std::mem::take(&mut expressions),
                    ));
                }
                statements.push(s);
                continue;
            }
            if strings.is_empty() {
                strings.push(String::new());
            }
            match piece {
                Piece::Text(t) => strings.last_mut().expect("never empty").push_str(&t),
                Piece::Template(q, e) => {
                    let mut q = q.into_iter();
                    strings
                        .last_mut()
                        .expect("never empty")
                        .push_str(&q.next().expect("at least one quasi"));
                    strings.extend(q);
                    expressions.extend(e);
                }
                Piece::Expression(e) => {
                    expressions.push(e);
                    strings.push(String::new());
                }
                Piece::Statement(_) => unreachable!("handled above"),
            }
        }
        if !strings.is_empty() {
            statements.push(self.push_call(&strings, &expressions));
        }
        statements
    }

    fn push_call(&mut self, strings: &[String], expressions: &[NodeIdentifier]) -> NodeIdentifier {
        let n = strings.len();
        let quasis: Vec<NodeIdentifier> = strings
            .iter()
            .enumerate()
            .map(|(i, s)| {
                self.out
                    .template_element(&sanitize_template_string(s), i + 1 == n)
            })
            .collect();
        let t = self
            .out
            .template(&quasis, expressions, SourceLocation::SYNTHETIC);
        let r = self.out.identifier("$$renderer");
        let callee = self.out.dot(r, "push");
        let call = self
            .out
            .call(callee, &[t], false, SourceLocation::SYNTHETIC);
        self.out.expression_statement(call)
    }

    /// Upstream `RegularElement` + `build_element_attributes` (server, no spread).
    fn element(&mut self, identifier: CompilerNodeIdentifier, template: &mut Vec<Piece>) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::Element(el) = &compiler_syntax_tree.node(identifier).kind else {
            unreachable!()
        };
        if el.kind != ElementKind::Regular {
            return Err(Diagnostic::error(
                "unsupported",
                "components, `<slot>` and `svelte:` elements are not supported yet",
                el.name,
            ));
        }
        let tag = el.name.text(self.source_text).to_ascii_lowercase();
        if matches!(
            tag.as_str(),
            "svg" | "math" | "script" | "style" | "select" | "option" | "textarea" | "template"
        ) || tag.contains('-')
        {
            return Err(Diagnostic::error(
                "unsupported",
                format!("`<{tag}>` is not supported yet"),
                el.name,
            ));
        }
        template.push(Piece::Text(format!("<{tag}")));
        let hash = if self.an.scoped[identifier] {
            self.an.stylesheet_hash.clone()
        } else {
            None
        };
        let list = compiler_syntax_tree.attributes(el.attributes);
        for a in list {
            let raw_name = a.name.text(self.source_text);
            if event_attribute(self.source_text, a).is_some() {
                continue;
            }
            let attribute_name = super::client::normalize_attribute(raw_name);
            let trim = matches!(attribute_name.as_str(), "class" | "style");
            let literal = match &a.value {
                AttributeValue::Boolean => Some(None),
                AttributeValue::Static(v) => Some(Some(
                    escape_markup(&attribute_text(v, trim), true).into_owned(),
                )),
                _ => None,
            };
            if let Some(v) = literal {
                Self::literal_attribute(template, &attribute_name, v, hash.as_deref());
                continue;
            }
            if attribute_name == "class" || attribute_name == "style" {
                return Err(Diagnostic::error(
                    "unsupported",
                    format!("a dynamic `{attribute_name}` attribute is not supported yet"),
                    a.span,
                ));
            }
            let value = self.attribute_value(a, trim);
            let n = self.out.write_string(&attribute_name);
            let mut arguments = vec![n, value];
            if is_boolean_attribute(&attribute_name) {
                arguments.push(self.out.write_boolean(true, SourceLocation::SYNTHETIC));
            }
            template.push(Piece::Expression(self.out.runtime("$", "attr", &arguments)));
        }
        let has_class = list
            .iter()
            .any(|a| a.name.text(self.source_text).eq_ignore_ascii_case("class"));
        if !has_class && self.an.scoped[identifier] {
            Self::literal_attribute(template, "class", Some(String::new()), hash.as_deref());
        }
        let void = is_void(&tag);
        template.push(Piece::Text(if void { "/>".into() } else { ">".into() }));
        let preserve = tag == "pre" || tag == "textarea";
        let cleaned = clean_nodes(
            compiler_syntax_tree,
            self.source_text,
            Parent::Element(&tag),
            compiler_syntax_tree.children(el.children),
            preserve,
        );
        self.process_children(&cleaned.items, template)?;
        if !void {
            template.push(Piece::Text(format!("</{tag}>")));
        }
        Ok(())
    }

    fn literal_attribute(
        template: &mut Vec<Piece>,
        name: &str,
        value: Option<String>,
        hash: Option<&str>,
    ) {
        let mut value = value;
        if name == "class"
            && let Some(h) = hash
        {
            let base = value
                .as_deref()
                .map_or_else(|| "true".to_owned(), str::to_owned);
            value = Some(format!("{base} {h}").trim().to_owned());
        }
        if name != "class" || value.as_deref() != Some("") {
            template.push(Piece::Text(format!(
                " {name}=\"{}\"",
                value.unwrap_or_default()
            )));
        }
    }

    /// Upstream `build_attribute_value` (server) for a value with at least one expression.
    fn attribute_value(&mut self, a: &Attribute, trim: bool) -> NodeIdentifier {
        let parts = match &a.value {
            &(AttributeValue::Expression { expression, .. }
            | AttributeValue::Shorthand(expression)) => {
                return self.expression(expression);
            }
            AttributeValue::Interpolated(parts) => parts,
            AttributeValue::Boolean | AttributeValue::Static(_) => {
                unreachable!("literal values are handled by the caller")
            }
        };
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for p in parts {
            match p {
                Part::Text(s) => {
                    let data = decode_text(s.text(self.source_text));
                    let data = if trim {
                        collapse_ws(&data)
                    } else {
                        data.into_owned()
                    };
                    quasis.last_mut().expect("never empty").push_str(&data);
                }
                Part::Expression { expression, .. } => {
                    let evaluated =
                        self.res
                            .evaluate(self.javascript, self.source_text, *expression);
                    if evaluated.is_known {
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&known_string(&evaluated.value));
                    } else {
                        let v = self.expression(*expression);
                        let v = if evaluated.is_string && evaluated.is_defined {
                            v
                        } else {
                            self.out.runtime("$", "stringify", &[v])
                        };
                        expressions.push(v);
                        quasis.push(String::new());
                    }
                }
            }
        }
        if expressions.is_empty() {
            return self.out.write_string(&quasis[0]);
        }
        let n = quasis.len();
        let elements: Vec<NodeIdentifier> = quasis
            .iter()
            .enumerate()
            .map(|(i, q)| {
                self.out
                    .template_element(&sanitize_template_string(q), i + 1 == n)
            })
            .collect();
        self.out
            .template(&elements, &expressions, SourceLocation::SYNTHETIC)
    }

    /// Upstream `IfBlock` (server).
    fn if_block(&mut self, identifier: CompilerNodeIdentifier, template: &mut Vec<Piece>) -> R<()> {
        let compiler_syntax_tree = self.compiler_syntax_tree;
        let NodeKind::If {
            branches,
            otherwise,
        } = compiler_syntax_tree.node(identifier).kind
        else {
            unreachable!()
        };
        let mut arms = Vec::new();
        for (index, b) in compiler_syntax_tree.branches(branches).iter().enumerate() {
            let body = self.fragment(Parent::Block, compiler_syntax_tree.children(b.body))?;
            let marker = format!("<!--[{index}-->");
            let block = self.prepend_block_marker(body, &marker);
            let t = self.expression(b.test);
            arms.push((t, block));
        }
        let final_body = match otherwise {
            Some(o) => self.fragment(Parent::Block, compiler_syntax_tree.children(o))?,
            None => Vec::new(),
        };
        let mut chain = self.prepend_block_marker(final_body, "<!--[-1-->");
        for (t, block) in arms.into_iter().rev() {
            chain = self
                .out
                .if_(t, block, Some(chain), SourceLocation::SYNTHETIC);
        }
        template.push(Piece::Statement(chain));
        template.push(Piece::Text(BLOCK_CLOSE.into()));
        Ok(())
    }

    /// Upstream `prepend_block_marker`: folds the marker into a leading static push.
    fn prepend_block_marker(
        &mut self,
        mut body: Vec<NodeIdentifier>,
        marker: &str,
    ) -> NodeIdentifier {
        let folded = body.first().and_then(|&first| {
            let Kind::ExpressionStatement(call) = self.out.kind(first) else {
                return None;
            };
            let Kind::Call {
                callee,
                arguments: [arg],
                ..
            } = self.out.kind(call)
            else {
                return None;
            };
            let is_push = matches!(self.out.kind(callee), Kind::Member { object, property, .. }
                if self.out.name(object) == "$$renderer" && self.out.name(property) == "push");
            let Kind::Template {
                quasis,
                expressions,
            } = self.out.kind(*arg)
            else {
                return None;
            };
            if !is_push {
                return None;
            }
            let (quasis, expressions) = (quasis.to_vec(), expressions.to_vec());
            let n = quasis.len();
            let mut new_quasis = Vec::with_capacity(n);
            for (i, &q) in quasis.iter().enumerate() {
                let raw = self.out.str_value(q, self.source_text).to_owned();
                let raw = if i == 0 {
                    format!("{}{raw}", sanitize_template_string(marker))
                } else {
                    raw
                };
                new_quasis.push(self.out.template_element(&raw, i + 1 == n));
            }
            let t = self
                .out
                .template(&new_quasis, &expressions, SourceLocation::SYNTHETIC);
            let r = self.out.identifier("$$renderer");
            let callee = self.out.dot(r, "push");
            let call = self
                .out
                .call(callee, &[t], false, SourceLocation::SYNTHETIC);
            Some(self.out.expression_statement(call))
        });
        if let Some(s) = folded {
            body[0] = s;
        } else {
            let r = self.out.identifier("$$renderer");
            let callee = self.out.dot(r, "push");
            let m = self.out.write_string(marker);
            let call = self
                .out
                .call(callee, &[m], false, SourceLocation::SYNTHETIC);
            body.insert(0, self.out.expression_statement(call));
        }
        self.out.block(&body, SourceLocation::SYNTHETIC)
    }
}

/// `String(value ?? '')` for a known value.
fn known_string(v: &crate::semantic::evaluate::Value) -> String {
    match v {
        crate::semantic::evaluate::Value::Null | crate::semantic::evaluate::Value::Undefined => {
            String::new()
        }
        v => v.to_javascript_string(),
    }
}

fn attribute_text(data: &str, trim: bool) -> String {
    if trim {
        collapse_ws(data).trim().to_owned()
    } else {
        data.to_owned()
    }
}

/// `regex_whitespaces_strict` → `' '`.
fn collapse_ws(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut in_ws = false;
    for ch in s.chars() {
        if matches!(ch, ' ' | '\t' | '\n' | '\r' | '\u{c}') {
            if !in_ws {
                out.push(' ');
            }
            in_ws = true;
        } else {
            out.push(ch);
            in_ws = false;
        }
    }
    out
}
