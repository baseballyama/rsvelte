//! Copying a subtree from one [`Ast`] into another through a [`Rewrite`].
//!
//! Lowerings build their output in a fresh `Ast` and bring user code over with [`copy`]: the
//! rewriter sees every node first — including nodes reached while it is rewriting another one — and
//! may return a replacement (`count++` → `$.update(count)`); everything else is rebuilt as is.
//! Spans are carried over, so output that came from user code maps back to it in the source map
//! without extra bookkeeping. Both trees must describe the same source text (in-source string
//! slices stay valid).

use rsv_kernel::source::Span;

use crate::ast::{Ast, Kind, NodeId, flag};

pub trait Rewrite {
    fn rewrite(&mut self, from: &Ast, to: &mut Ast, id: NodeId) -> Option<NodeId>;
}

/// Copies without rewriting.
#[derive(Debug)]
pub struct Verbatim;

impl Rewrite for Verbatim {
    fn rewrite(&mut self, _: &Ast, _: &mut Ast, _: NodeId) -> Option<NodeId> {
        None
    }
}

pub fn copy<R: Rewrite + ?Sized>(from: &Ast, to: &mut Ast, r: &mut R, id: NodeId) -> NodeId {
    r.rewrite(from, to, id)
        .unwrap_or_else(|| copy_node(from, to, r, id))
}

pub fn copy_opt<R: Rewrite + ?Sized>(
    from: &Ast,
    to: &mut Ast,
    r: &mut R,
    id: Option<NodeId>,
) -> Option<NodeId> {
    id.map(|i| copy(from, to, r, i))
}

pub fn copy_all<R: Rewrite + ?Sized>(
    from: &Ast,
    to: &mut Ast,
    r: &mut R,
    ids: &[NodeId],
) -> Vec<NodeId> {
    ids.iter().map(|&i| copy(from, to, r, i)).collect()
}

/// Rebuilds `id` itself; its children still go through `r`.
#[expect(clippy::too_many_lines, reason = "one arm per node kind")]
pub fn copy_node<R: Rewrite + ?Sized>(f: &Ast, to: &mut Ast, rw: &mut R, id: NodeId) -> NodeId {
    let span = f.loc(id);
    let fl = f.flags(id);
    match f.kind(id) {
        Kind::Program(body) => {
            let b = copy_all(f, to, rw, body);
            to.program(&b, span)
        }
        Kind::VarDecl { kind, decls } => {
            let d = copy_all(f, to, rw, decls);
            to.var_decl(kind, &d, span)
        }
        Kind::Declarator { id: t, init } => {
            let t = copy(f, to, rw, t);
            let i = copy_opt(f, to, rw, init);
            to.declarator(t, i, span)
        }
        Kind::ExprStmt(e) => {
            let e = copy(f, to, rw, e);
            to.expr_stmt_at(e, span)
        }
        Kind::Function {
            name,
            params,
            body,
            is_async,
            decl,
        } => {
            let n = copy_opt(f, to, rw, name);
            let p = copy_all(f, to, rw, params);
            let b = copy(f, to, rw, body);
            to.function(decl, n, &p, b, is_async, span)
        }
        Kind::Return(a) => {
            let a = copy_opt(f, to, rw, a);
            to.return_(a, span)
        }
        Kind::If { test, cons, alt } => {
            let t = copy(f, to, rw, test);
            let c = copy(f, to, rw, cons);
            let a = copy_opt(f, to, rw, alt);
            to.if_(t, c, a, span)
        }
        Kind::For {
            init,
            test,
            update,
            body,
        } => {
            let init = copy_opt(f, to, rw, init);
            let test = copy_opt(f, to, rw, test);
            let update = copy_opt(f, to, rw, update);
            let body = copy(f, to, rw, body);
            to.for_(init, test, update, body, span)
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
        } => {
            let s = copy_all(f, to, rw, specifiers);
            let src = copy(f, to, rw, source);
            to.import(&s, src, type_only, span)
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
        Kind::TsDecl => to.ts_decl(span),
        Kind::TsInterface { name, members } => {
            let n = copy_node(f, to, rw, name);
            let m = members
                .iter()
                .map(|&m| copy_node(f, to, rw, m))
                .collect::<Vec<_>>();
            to.ts_interface(n, &m, span)
        }
        Kind::TsPropSig { key, optional } => {
            let k = copy_node(f, to, rw, key);
            to.ts_prop_sig(k, optional, span)
        }
        Kind::Ident(a) => to.ident(f.atoms.get(a), span),
        Kind::Num(v) => to.num(v, span),
        Kind::Str => {
            if fl & flag::OWNED != 0 {
                to.str_owned(f.str_value(id, ""), span)
            } else {
                let [lo, hi] = f.raw_data(id);
                to.str_in_source(Span::new(lo, hi), span)
            }
        }
        Kind::Bool(b) => to.bool(b, span),
        Kind::Null => to.null(span),
        Kind::This => to.this(span),
        Kind::Template { quasis, exprs } => {
            let q = quasis
                .iter()
                .map(|&q| copy_template_elem(f, to, q))
                .collect::<Vec<_>>();
            let e = copy_all(f, to, rw, exprs);
            to.template(&q, &e, span)
        }
        Kind::TemplateElem { .. } => copy_template_elem(f, to, id),
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
            args,
            optional,
            pure,
        } => {
            let c = copy(f, to, rw, callee);
            let a = copy_all(f, to, rw, args);
            let call = to.call(c, &a, optional, span);
            if pure {
                to.mark_pure(call);
            }
            call
        }
        Kind::New { callee, args } => {
            let c = copy(f, to, rw, callee);
            let a = copy_all(f, to, rw, args);
            to.new_(c, &a, span)
        }
        Kind::Arrow {
            params,
            body,
            is_async,
            expr_body,
        } => {
            let p = copy_all(f, to, rw, params);
            let b = copy(f, to, rw, body);
            to.arrow(&p, b, expr_body, is_async, span)
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
        Kind::Cond { test, cons, alt } => {
            let t = copy(f, to, rw, test);
            let c = copy(f, to, rw, cons);
            let a = copy(f, to, rw, alt);
            to.cond(t, c, a, span)
        }
        Kind::Assign(op, t, v) => {
            let t = copy(f, to, rw, t);
            let v = copy(f, to, rw, v);
            to.assign(op, t, v, span)
        }
        Kind::Seq(items) => {
            let i = copy_all(f, to, rw, items);
            to.seq(&i, span)
        }
        Kind::Await(a) => {
            let a = copy(f, to, rw, a);
            to.await_(a, span)
        }
        Kind::ObjectPat(props) => {
            let p = copy_all(f, to, rw, props);
            to.object_pat(&p, span)
        }
        Kind::ArrayPat(items) => {
            let i = copy_all(f, to, rw, items);
            to.array_pat(&i, span)
        }
        Kind::AssignPat(l, r) => {
            let l = copy(f, to, rw, l);
            let r = copy(f, to, rw, r);
            to.assign_pat(l, r, span)
        }
        Kind::Rest(a) => {
            let a = copy(f, to, rw, a);
            to.rest(a, span)
        }
        Kind::Hole => to.hole(span),
    }
}

fn copy_template_elem(f: &Ast, to: &mut Ast, q: NodeId) -> NodeId {
    let tail = f.flags(q) & flag::TAIL != 0;
    if f.flags(q) & flag::OWNED != 0 {
        to.template_elem(f.str_value(q, ""), tail)
    } else {
        let [lo, hi] = f.raw_data(q);
        to.template_elem_in_source(Span::new(lo, hi), tail, f.loc(q))
    }
}
