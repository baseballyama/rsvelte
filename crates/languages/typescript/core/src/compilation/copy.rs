//! Copying a subtree from one [`SyntaxTree`] into another through a [`Rewrite`].
//!
//! Lowerings build their output in a fresh `SyntaxTree` and bring user code over with [`copy`]: the
//! rewriter sees every node first — including nodes reached while it is rewriting another one — and
//! may return a replacement (`count++` → `$.update(count)`); everything else is rebuilt as is.
//! Spans are carried over, so output that came from user code maps back to it in the source map
//! without extra bookkeeping. Both trees must describe the same source text (in-source string
//! slices stay valid).

use rsvelte_kernel::source::positions::Span;

use crate::syntax_tree::{Kind, NodeIdentifier, SyntaxTree, flag};

pub trait Rewrite {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier>;
}

/// Copies without rewriting.
#[derive(Debug)]
pub struct Verbatim;

impl Rewrite for Verbatim {
    fn rewrite(
        &mut self,
        _: &SyntaxTree,
        _: &mut SyntaxTree,
        _: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        None
    }
}

pub fn copy<R: Rewrite + ?Sized>(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    r: &mut R,
    identifier: NodeIdentifier,
) -> NodeIdentifier {
    r.rewrite(from, to, identifier)
        .unwrap_or_else(|| copy_node(from, to, r, identifier))
}

pub fn copy_opt<R: Rewrite + ?Sized>(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    r: &mut R,
    identifier: Option<NodeIdentifier>,
) -> Option<NodeIdentifier> {
    identifier.map(|i| copy(from, to, r, i))
}

pub fn copy_all<R: Rewrite + ?Sized>(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    r: &mut R,
    identifiers: &[NodeIdentifier],
) -> Vec<NodeIdentifier> {
    identifiers.iter().map(|&i| copy(from, to, r, i)).collect()
}

/// Rebuilds `identifier` itself; its children still go through `r`.
#[expect(clippy::too_many_lines, reason = "one arm per node kind")]
pub fn copy_node<R: Rewrite + ?Sized>(
    f: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut R,
    identifier: NodeIdentifier,
) -> NodeIdentifier {
    let span = f.source_location(identifier);
    let fl = f.flags(identifier);
    let copied = match f.kind(identifier) {
        Kind::ImportExpression { source, options } => {
            let s = copy(f, to, rw, source);
            let o = copy_opt(f, to, rw, options);
            to.import_expression(s, o, span)
        }
        Kind::MetaProperty { meta, property } => {
            let m = copy(f, to, rw, meta);
            let p = copy(f, to, rw, property);
            to.meta_property(m, p, span)
        }
        Kind::BigInt => {
            let [lo, hi] = f.raw_data(identifier);
            to.bigint(Span::new(lo, hi))
        }
        Kind::Super => to.super_(span),
        Kind::Yield { argument, delegate } => {
            let a = copy_opt(f, to, rw, argument);
            to.yield_(a, delegate, span)
        }
        Kind::Class(class) => copy_class(f, to, rw, class, span),
        Kind::Control(control) => copy_control(f, to, rw, control, span),
        Kind::Program(body) => {
            let b = copy_all(f, to, rw, body);
            to.program(&b, span)
        }
        Kind::VariableDeclaration { kind, declarations } => {
            let d = copy_all(f, to, rw, declarations);
            to.var_declaration(kind, &d, span)
        }
        Kind::Declarator {
            identifier: t,
            initializer,
        } => {
            let t = copy(f, to, rw, t);
            let i = copy_opt(f, to, rw, initializer);
            to.declarator(t, i, span)
        }
        Kind::ExpressionStatement(e) => {
            let e = copy(f, to, rw, e);
            to.expression_statement_at(e, span)
        }
        Kind::Function {
            name,
            parameters,
            body,
            is_async,
            declaration,
        } => {
            let n = copy_opt(f, to, rw, name);
            let p = copy_all(f, to, rw, parameters);
            let b = copy(f, to, rw, body);
            let function = to.function(declaration, n, &p, b, is_async, span);
            to.mark_generator(function, fl & flag::GENERATOR != 0);
            function
        }
        Kind::Return(a) => {
            let a = copy_opt(f, to, rw, a);
            to.return_(a, span)
        }
        Kind::If {
            test,
            consequent,
            alternate,
        } => {
            let t = copy(f, to, rw, test);
            let c = copy(f, to, rw, consequent);
            let a = copy_opt(f, to, rw, alternate);
            to.if_(t, c, a, span)
        }
        Kind::For {
            initializer,
            test,
            update,
            body,
        } => {
            let initializer = copy_opt(f, to, rw, initializer);
            let test = copy_opt(f, to, rw, test);
            let update = copy_opt(f, to, rw, update);
            let body = copy(f, to, rw, body);
            to.for_(initializer, test, update, body, span)
        }
        Kind::Block(body) => {
            let b = copy_all(f, to, rw, body);
            to.block(&b, span)
        }
        Kind::Empty => to.empty(span),
        Kind::Import {
            specifiers,
            source,
            type_only,
            attributes,
        } => {
            let s = copy_all(f, to, rw, specifiers);
            let source_text = copy(f, to, rw, source);
            let attributes = attributes.map(|a| copy(f, to, rw, a));
            to.import_with_attributes(&s, source_text, type_only, attributes, span)
        }
        Kind::ImportDefault(l) => {
            let l = copy(f, to, rw, l);
            to.import_default(l, span)
        }
        Kind::ImportNamed { imported, local } => {
            let i = copy(f, to, rw, imported);
            let l = copy(f, to, rw, local);
            to.import_named(i, l, fl & flag::TYPE_ONLY != 0, span)
        }
        Kind::ImportNamespace(l) => {
            let l = copy(f, to, rw, l);
            to.import_namespace(l, span)
        }
        Kind::ExportNamed(d) => {
            let d = copy(f, to, rw, d);
            to.export_named(d, span)
        }
        Kind::ExportDefault(d) => {
            let d = copy(f, to, rw, d);
            to.export_default(d, span)
        }
        Kind::TypeScriptDeclaration => to.typescript_declaration(span),
        Kind::TypeScriptInterface { name, members } => {
            let n = copy_node(f, to, rw, name);
            let m = members
                .iter()
                .map(|&m| copy_node(f, to, rw, m))
                .collect::<Vec<_>>();
            to.typescript_interface(n, &m, span)
        }
        Kind::TypeScriptPropertySignature { key, optional } => {
            let k = copy_node(f, to, rw, key);
            to.typescript_prop_sig(k, optional, span)
        }
        Kind::Identifier(a) => to.ident(f.atoms.get(a), span),
        Kind::Number(v) => to.write_number(v, span),
        Kind::String => {
            if fl & flag::OWNED != 0 {
                to.str_owned(f.str_value(identifier, ""), span)
            } else {
                let [start_offset, end_offset] = f.raw_data(identifier);
                to.str_in_source(Span::new(start_offset, end_offset), span)
            }
        }
        Kind::Regex { pattern, flags } => to.regex(pattern, flags),
        Kind::Boolean(b) => to.write_boolean(b, span),
        Kind::Null => to.null(span),
        Kind::This => to.this(span),
        Kind::Template {
            quasis,
            expressions,
        } => {
            let q = quasis
                .iter()
                .map(|&q| copy_template_element(f, to, q))
                .collect::<Vec<_>>();
            let e = copy_all(f, to, rw, expressions);
            to.template(&q, &e, span)
        }
        Kind::TemplateElement { .. } => copy_template_element(f, to, identifier),
        Kind::Array(items) => {
            let i = copy_all(f, to, rw, items);
            to.array(&i, span)
        }
        Kind::Object(props) => {
            let p = copy_all(f, to, rw, props);
            to.object(&p, span)
        }
        Kind::Property { key, value, .. } => {
            let k = copy(f, to, rw, key);
            let v = copy(f, to, rw, value);
            to.property(k, v, fl, span)
        }
        Kind::Spread(a) => {
            let a = copy(f, to, rw, a);
            to.spread(a, span)
        }
        Kind::Member {
            object,
            property,
            computed,
            optional,
        } => {
            let o = copy(f, to, rw, object);
            let p = if computed {
                copy(f, to, rw, property)
            } else {
                copy_node(f, to, rw, property)
            };
            to.member(o, p, computed, optional, span)
        }
        Kind::Call {
            callee,
            arguments,
            optional,
            pure,
        } => {
            let c = copy(f, to, rw, callee);
            let a = copy_all(f, to, rw, arguments);
            let call = to.call(c, &a, optional, span);
            if pure {
                to.mark_pure(call);
            }
            call
        }
        Kind::New { callee, arguments } => {
            let c = copy(f, to, rw, callee);
            let a = copy_all(f, to, rw, arguments);
            to.new_(c, &a, span)
        }
        Kind::Arrow {
            parameters,
            body,
            is_async,
            expression_body,
        } => {
            let p = copy_all(f, to, rw, parameters);
            let b = copy(f, to, rw, body);
            to.arrow(&p, b, expression_body, is_async, span)
        }
        Kind::Unary(op, a) => {
            let a = copy(f, to, rw, a);
            to.unary(op, a, span)
        }
        Kind::Update { op, prefix, arg } => {
            let a = copy(f, to, rw, arg);
            to.update(op, prefix, a, span)
        }
        Kind::Binary(op, l, r) => {
            let l = copy(f, to, rw, l);
            let r = copy(f, to, rw, r);
            to.binary(op, l, r, span)
        }
        Kind::Logical(op, l, r) => {
            let l = copy(f, to, rw, l);
            let r = copy(f, to, rw, r);
            to.logical(op, l, r, span)
        }
        Kind::Conditional {
            test,
            consequent,
            alternate,
        } => {
            let t = copy(f, to, rw, test);
            let c = copy(f, to, rw, consequent);
            let a = copy(f, to, rw, alternate);
            to.cond(t, c, a, span)
        }
        Kind::Assign(op, t, v) => {
            let t = copy(f, to, rw, t);
            let v = copy(f, to, rw, v);
            to.assign(op, t, v, span)
        }
        Kind::Sequence(items) => {
            let i = copy_all(f, to, rw, items);
            to.seq(&i, span)
        }
        Kind::Await(a) => {
            let a = copy(f, to, rw, a);
            to.await_(a, span)
        }
        Kind::ObjectPattern(props) => {
            let p = copy_all(f, to, rw, props);
            to.object_pat(&p, span)
        }
        Kind::ArrayPattern(items) => {
            let i = copy_all(f, to, rw, items);
            to.array_pat(&i, span)
        }
        Kind::AssignPattern(l, r) => {
            let l = copy(f, to, rw, l);
            let r = copy(f, to, rw, r);
            to.assign_pat(l, r, span)
        }
        Kind::Rest(a) => {
            let a = copy(f, to, rw, a);
            to.rest(a, span)
        }
        Kind::Hole => to.hole(span),
    };
    if fl & flag::GROUPED != 0 {
        to.grouped(copied)
    } else {
        copied
    }
}

fn copy_template_element(f: &SyntaxTree, to: &mut SyntaxTree, q: NodeIdentifier) -> NodeIdentifier {
    let tail = f.flags(q) & flag::TAIL != 0;
    if f.flags(q) & flag::OWNED != 0 {
        to.template_element(f.str_value(q, ""), tail)
    } else {
        let [start_offset, end_offset] = f.raw_data(q);
        to.template_element_in_source(
            Span::new(start_offset, end_offset),
            tail,
            f.source_location(q),
        )
    }
}

mod control;
use control::copy_control;

mod classes;
use classes::copy_class;
