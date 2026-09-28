//! The TypeScript view of a component, for type checking (upstream: svelte2tsx). The instance
//! script comes first, verbatim; the template follows as statements TypeScript can check: an
//! element is a `svelteHTML.createElement` call (declared by the vendored svelte-check shim) with
//! its attributes as an object literal, an `{#if}` is an `if`, a `{expression}` is a statement.
//! Everything copied from the component is mapped, so a diagnostic maps back to where it was written.

use crate::ast::{Attr, AttrValue, Component, Part, TId, TNode};
use rsv_js::{Ast, NodeId, ast::TsKind};
use rsv_kernel::diag::Unsupported;
use rsv_kernel::emit::Emitter;
use rsv_kernel::source::Span;

pub enum Projection {
    /// Not type-checked: without `lang="ts"` svelte-check reports no semantic diagnostics
    /// (`checkJs` is off).
    Js,
    Ts(Emitter),
}

type R<T> = Result<T, Unsupported>;

pub fn project(c: &Component, src: &str) -> R<Projection> {
    let Some(script) = c.instance.as_ref().filter(|s| s.ts) else {
        return Ok(Projection::Js);
    };
    let mut p = Projector {
        c,
        src,
        e: Emitter::new(),
    };
    p.e.copy(src, script.content);
    p.e.push("\n;{\n");
    p.children(c.children(c.root))?;
    p.e.push("}\n");
    Ok(Projection::Ts(p.e))
}

struct Projector<'a> {
    c: &'a Component,
    src: &'a str,
    e: Emitter,
}

impl Projector<'_> {
    fn children(&mut self, ids: &[TId]) -> R<()> {
        for &id in ids {
            self.node(id)?;
        }
        Ok(())
    }

    fn node(&mut self, id: TId) -> R<()> {
        match *self.c.node(id) {
            TNode::Text { .. } | TNode::Comment { .. } => {}
            TNode::Expr { span, .. } => {
                self.expression(span);
                self.e.push(";\n");
            }
            TNode::Element {
                name,
                attrs,
                children,
                ..
            } => {
                let tag = name.text(self.src);
                if !tag.starts_with(|c: char| c.is_ascii_lowercase()) || tag.contains(['-', ':']) {
                    return Err(Unsupported(
                        "components, custom elements and svelte: elements",
                    ));
                }
                self.e.push("{ svelteHTML.createElement(\"");
                self.e.push(tag);
                self.e.push("\", {");
                for a in self.c.attrs(attrs) {
                    self.attribute(a);
                }
                self.e.push("});\n");
                self.children(self.c.children(children))?;
                self.e.push("}\n");
            }
            TNode::If {
                test, cons, alt, ..
            } => {
                self.e.push("if (");
                let test = expression_range(&self.c.js, test);
                self.e.copy(self.src, test);
                self.e.mark(test.hi);
                self.e.push(") {\n");
                self.children(self.c.children(cons))?;
                self.e.push("}");
                if let Some(alt) = alt {
                    self.e.push(" else {\n");
                    self.children(self.c.children(alt))?;
                    self.e.push("}");
                }
                self.e.push("\n");
            }
        }
        Ok(())
    }

    fn attribute(&mut self, a: &Attr) {
        let src = self.src;
        let parts = match a.value {
            AttrValue::True => &[][..],
            AttrValue::Parts(r) => self.c.parts(r),
        };
        self.e.push(" ");
        if src.as_bytes()[a.span.lo as usize] == b'{' {
            // `{name}` is a shorthand property: TypeScript reports an undeclared name on it.
            self.expression(a.span);
            self.e.push(",");
            return;
        }
        let name = a.name.text(src);
        if is_identifier(name) {
            self.e.copy(src, a.name);
        } else {
            self.e.mark(a.name.lo);
            self.e.push("\"");
            self.e.copy(src, a.name);
            self.e.push("\"");
        }
        // svelte2tsx turns `=` into `:` in place, so a range ending at the key maps to the `=`;
        // a valueless attribute has no `=` and its key's range ends on its last character.
        if !matches!(a.value, AttrValue::True) {
            self.e.mark(a.name.hi);
        }
        self.e.push(": ");
        match (a.value, parts) {
            (AttrValue::True, _) => self.e.push("true"),
            (_, [Part::Expr { span, .. }]) if !a.quoted => self.expression(*span),
            (_, [Part::Text(s)]) if s.is_empty() => {
                self.e.copy(src, Span::new(s.lo - 1, s.hi + 1));
            }
            _ if parts.iter().all(|p| matches!(p, Part::Text(_))) => {
                self.e.push("\"");
                for p in parts {
                    if let Part::Text(s) = p {
                        self.text(*s, &['"', '\\', '\n', '\r']);
                    }
                }
                self.e.push("\"");
            }
            _ => {
                self.e.push("`");
                for p in parts {
                    match p {
                        Part::Text(s) => self.text(*s, &['`', '\\', '$']),
                        Part::Expr { span, .. } => {
                            self.e.push("${");
                            self.expression(*span);
                            self.e.push("}");
                        }
                    }
                }
                self.e.push("`");
            }
        }
        self.e.push(",");
    }

    /// The expression inside `{…}`, with the `}` mapped: svelte2tsx rewrites the braces in place,
    /// so a range ending at the expression's end maps to the `}`.
    fn expression(&mut self, braces: Span) {
        self.e.copy(self.src, inner(braces));
        self.e.mark(braces.hi - 1);
    }

    /// Raw attribute text (character references stay as written, as in svelte2tsx) inside a
    /// literal delimited by one of `special`.
    fn text(&mut self, s: Span, special: &[char]) {
        let raw = s.text(self.src);
        if !raw.contains(special) {
            self.e.copy(self.src, s);
            return;
        }
        self.e.mark(s.lo);
        for ch in raw.chars() {
            match ch {
                '\n' => self.e.push("\\n"),
                '\r' => self.e.push("\\r"),
                c if special.contains(&c) => {
                    self.e.push_char('\\');
                    self.e.push_char(c);
                }
                c => self.e.push_char(c),
            }
        }
    }
}

/// The expression inside `{…}`.
fn inner(braces: Span) -> Span {
    Span::new(braces.lo + 1, braces.hi - 1)
}

/// An expression's range including the TypeScript suffix the tree erases (`x as T`, `x!`).
fn expression_range(ast: &Ast, e: NodeId) -> Span {
    let mut span = ast
        .loc(e)
        .span()
        .expect("a parsed expression has a source range");
    for t in &ast.ts {
        if t.node == e && matches!(t.kind, TsKind::As | TsKind::Satisfies | TsKind::NonNull) {
            span.hi = span.hi.max(t.span.hi);
        }
    }
    span
}

fn is_identifier(s: &str) -> bool {
    let mut chars = s.chars();
    chars
        .next()
        .is_some_and(|c| c.is_ascii_alphabetic() || c == '_' || c == '$')
        && chars.all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '$')
}
