//! The TypeScript view of a component, for type checking (upstream: `@vue/language-core`'s
//! virtual code, which vue-tsc checks).
//!
//! The `<script setup>` comes first, verbatim. The template follows as statements: an element is an
//! `__VLS_asFunctionalElement1` call on its intrinsic type with its attributes as an object
//! literal, a `v-if` chain is an `if` chain, a `v-for` is a `for … of`, an interpolation is a
//! parenthesized expression. A name the template reads from the component becomes `__VLS_ctx.name`,
//! and `__VLS_ctx` is typed as upstream types it, so the checker's messages (which print that name
//! and that type) match. Everything copied from the component is mapped; the inserted text is not,
//! so a diagnostic maps back to what was written ([`Emitter::lookup_overlap`]).

use rsv_js::scope::ScopeId;
use rsv_js::{Kind, NodeId};
use rsv_kernel::diag::Unsupported;
use rsv_kernel::emit::Emitter;
use rsv_kernel::source::Span;
use rustc_hash::FxHashMap;

use crate::ast::{AttrKind, DirExp, DirName, Sfc, TId, TNode};
use crate::compile::template::{
    camelize, can_prefix, identifiers, is_simple_identifier, to_handler_key,
};
use crate::resolve::Resolution;

#[derive(Debug)]
pub enum Projection {
    /// Not type-checked: a `<script setup>` without `lang="ts"` makes the virtual file JavaScript,
    /// and vue-tsc reports no semantic diagnostics for it (`checkJs` is off).
    Js,
    Ts(Emitter),
}

type R<T> = Result<T, Unsupported>;

const PRELUDE: &str = "// @ts-ignore\ndeclare const { defineProps, defineSlots, defineEmits, \
                       defineExpose, defineModel, defineOptions, withDefaults, }: typeof \
                       import('vue');\n";
const INSTANCE: &str = "import('vue').ComponentPublicInstance";

/// # Errors
///
/// [`Unsupported`] if the component holds a construct the projection does not handle yet.
pub fn project(c: &Sfc, src: &str, res: &Resolution) -> R<Projection> {
    if c.script.is_some() && !c.ts {
        return Ok(Projection::Js);
    }
    if let Some(p) = &res.define_props {
        return Err(Unsupported::at(
            "defineProps in a type-checked component",
            c.js.loc(p.call).span().unwrap_or_default(),
        ));
    }
    let mut p = Projector {
        c,
        src,
        locals: res
            .sem
            .references
            .iter()
            .map(|r| {
                let local = r
                    .binding
                    .is_some_and(|b| res.sem.bindings[b].scope != ScopeId::ROOT);
                (r.node, local)
            })
            .collect(),
        e: Emitter::new(),
        chain_open: false,
    };
    if let Some(script) = &c.script {
        p.e.copy(src, script.content);
        p.e.push("\n");
    }
    p.e.push(PRELUDE);
    let exposed = p.exposed(res);
    if exposed.is_empty() {
        p.e.push(&format!("const __VLS_ctx = {{}} as {INSTANCE};\n"));
    } else {
        p.e.push("type __VLS_SetupExposed = import('vue').ShallowUnwrapRef<{\n");
        for name in exposed {
            p.e.push(&format!("{name}: typeof {name};\n"));
        }
        p.e.push("}>;\nconst __VLS_ctx = {\n");
        p.e.push(&format!(
            "...{{}} as {INSTANCE},\n...{{}} as __VLS_SetupExposed,\n}};\n"
        ));
    }
    p.e.push("let __VLS_intrinsics!: import('vue/jsx-runtime').JSX.IntrinsicElements;\n");
    p.children(c.root())?;
    Ok(Projection::Ts(p.e))
}

struct Projector<'a> {
    c: &'a Sfc,
    src: &'a str,
    /// Every reference, and whether it names something the template declares (a `v-for` alias, a
    /// parameter of a function written in an expression).
    locals: FxHashMap<NodeId, bool>,
    e: Emitter,
    /// The last statement closed a `v-if` / `v-else-if` block, so a `v-else` may follow.
    chain_open: bool,
}

impl<'a> Projector<'a> {
    /// The script's top-level names the template reads, in the order it first reads them:
    /// upstream's `__VLS_SetupExposed`.
    fn exposed(&self, res: &Resolution) -> Vec<&'a str> {
        let c: &'a Sfc = self.c;
        let Some(template) = &c.template else {
            return Vec::new();
        };
        let mut found: Vec<(u32, &str)> = res
            .sem
            .references
            .iter()
            .filter_map(|r| {
                let b = &res.sem.bindings[r.binding?];
                let at = c.js.loc(r.node).span()?;
                (b.scope == ScopeId::ROOT
                    && template.content.lo <= at.lo
                    && at.hi <= template.content.hi)
                    .then(|| (at.lo, c.js.name(r.node)))
            })
            .collect();
        found.sort_unstable_by_key(|&(at, _)| at);
        let mut names: Vec<&'a str> = Vec::new();
        for (_, name) in found {
            if !names.contains(&name) {
                names.push(name);
            }
        }
        names
    }

    fn children(&mut self, ids: &[TId]) -> R<()> {
        for &id in ids {
            self.node(id)?;
        }
        Ok(())
    }

    fn node(&mut self, id: TId) -> R<()> {
        match *self.c.node(id) {
            TNode::Text { .. } | TNode::Comment { .. } => {}
            TNode::Interpolation { expr, span } => {
                self.chain_open = false;
                self.e.push("(");
                self.expression(expr, Span::new(span.lo + 2, span.hi - 2), false);
                self.e.push(");\n");
            }
            TNode::Element {
                name,
                attrs,
                children,
                start_tag,
                span,
                ..
            } => {
                let condition = crate::resolve::if_directive(self.c, id);
                let for_exp = self.c.directive(attrs, DirName::For);
                match (condition, for_exp) {
                    (Some(_), Some((a, _))) => {
                        return Err(Unsupported::at("v-if and v-for on one element", a.span));
                    }
                    (Some(dir), None) => self.open_branch(attrs, dir)?,
                    (None, Some((_, d))) => {
                        self.chain_open = false;
                        let DirExp::For(f) = &d.exp else {
                            unreachable!("the parser gives v-for a for expression")
                        };
                        self.e.push("for (const [");
                        for (i, &param) in f.params.iter().enumerate() {
                            if i > 0 {
                                self.e.push(", ");
                            }
                            self.expression(param, self.span_of(param), false);
                        }
                        self.e.push("] of __VLS_vFor((");
                        self.expression(f.source, self.span_of(f.source), false);
                        self.e.push(")!)) {\n");
                    }
                    (None, None) => self.chain_open = false,
                }
                self.element(name, attrs, span != start_tag)?;
                self.children(self.c.children(children))?;
                if condition.is_some() || for_exp.is_some() {
                    self.e.push("}\n");
                }
                self.chain_open = matches!(condition, Some(DirName::If | DirName::ElseIf));
            }
        }
        Ok(())
    }

    fn open_branch(&mut self, attrs: crate::ast::Range, dir: DirName) -> R<()> {
        let (a, d) = self.c.directive(attrs, dir).expect("if_directive found it");
        if dir != DirName::If && !self.chain_open {
            return Err(Unsupported::at("a v-else without its v-if", a.span));
        }
        let test = match (&d.exp, dir) {
            (DirExp::None, DirName::Else) => None,
            (DirExp::Expr(e), DirName::If | DirName::ElseIf) => Some(*e),
            _ => return Err(Unsupported::at("this v-if expression", a.span)),
        };
        if dir != DirName::If {
            self.e.push("else ");
        }
        if let Some(test) = test {
            self.e.push("if (");
            let value = a.value.expect("an expression has a value");
            self.expression(test, value, false);
            self.e.push(") ");
        }
        self.e.push("{\n");
        Ok(())
    }

    /// `__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({ … });`: the end tag is
    /// the second argument, when there is one.
    fn element(&mut self, name: Span, attrs: crate::ast::Range, end_tag: bool) -> R<()> {
        let tag = name.text(self.src);
        if !tag
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit())
        {
            return Err(Unsupported::at("components and custom elements", name));
        }
        self.e.push("__VLS_asFunctionalElement1(__VLS_intrinsics.");
        self.e.copy(self.src, name);
        if end_tag {
            self.e.push(", __VLS_intrinsics.");
            self.e.push(tag);
        }
        self.e.push(")({\n");
        for a in self.c.attrs(attrs) {
            match &a.kind {
                AttrKind::Static => self.static_attribute(a.name, a.value, a.quoted)?,
                AttrKind::Directive(d) => match (d.name, d.arg, &d.exp) {
                    (DirName::If | DirName::ElseIf | DirName::Else | DirName::For, ..) => {}
                    (DirName::Bind, Some(arg), DirExp::Expr(e)) => {
                        let value = a.value.expect("an expression has a value");
                        let spread = matches!(arg.text(self.src), "class" | "style");
                        self.e.push(if spread { "...{ " } else { "" });
                        self.key(arg);
                        self.e.push(": (");
                        self.expression(*e, value, false);
                        self.e.push(if spread { ") },\n" } else { "),\n" });
                    }
                    (DirName::On, Some(arg), DirExp::Expr(e)) => {
                        let value = a.value.expect("an expression has a value");
                        self.handler(arg, *e, value);
                    }
                    _ => return Err(Unsupported::at("this directive", a.span)),
                },
            }
        }
        self.e.push("});\n");
        Ok(())
    }

    fn static_attribute(&mut self, name: Span, value: Option<Span>, quoted: bool) -> R<()> {
        let text = name.text(self.src);
        if text == "style" {
            return Err(Unsupported::at("a static style attribute", name));
        }
        let class = text == "class";
        self.e.push(if class { "...{ " } else { "" });
        self.key(name);
        self.e.push(": ");
        match value {
            None => self.e.push("true"),
            Some(v) => {
                // The value is written in its own quotes, whose content JavaScript would read
                // differently only through these characters.
                if v.text(self.src).contains(['\\', '\n', '\r', '"', '\'']) {
                    return Err(Unsupported::at("this attribute value", v));
                }
                let quote = if quoted {
                    &self.src[v.lo as usize - 1..v.lo as usize]
                } else {
                    "\""
                };
                self.e.push(quote);
                self.e.copy(self.src, v);
                self.e.push(quote);
            }
        }
        self.e.push(if class { " },\n" } else { ",\n" });
        Ok(())
    }

    /// An attribute name as an object key: bare when it is an identifier, else single-quoted.
    fn key(&mut self, name: Span) {
        if is_simple_identifier(name.text(self.src)) {
            self.e.copy(self.src, name);
        } else {
            self.e.push("'");
            self.e.copy(self.src, name);
            self.e.push("'");
        }
    }

    /// `...{ onClick: … },`: a name or a function as written, an inline statement as a function
    /// that receives `$event`.
    fn handler(&mut self, arg: Span, exp: NodeId, value: Span) {
        let key = to_handler_key(&camelize(arg.text(self.src)));
        self.e.push("...{ ");
        if is_simple_identifier(&key) {
            self.e.push(&key);
        } else {
            self.e.push(&format!("'{key}'"));
        }
        self.e.push(": ");
        let as_written = match self.c.js.kind(exp) {
            Kind::Member { .. } | Kind::Arrow { .. } | Kind::Function { .. } => true,
            Kind::Ident(_) => self.c.js.name(exp) != "undefined",
            _ => false,
        };
        if as_written {
            self.e.push("(");
            self.expression(exp, value, false);
            self.e.push(")");
        } else {
            self.e.push("(...[$event]) => {\nreturn (");
            self.expression(exp, value, true);
            self.e.push(");\n}");
        }
        self.e.push("},\n");
    }

    fn span_of(&self, n: NodeId) -> Span {
        self.c
            .js
            .loc(n)
            .span()
            .expect("a parsed template expression has a source range")
    }

    /// The source text `text` of expression `root`, with every name read from the component
    /// prefixed by `__VLS_ctx.` (a shorthand property keeps its key).
    fn expression(&mut self, root: NodeId, text: Span, event_local: bool) {
        let mut idents = Vec::new();
        identifiers(&self.c.js, root, None, &mut idents);
        let mut prefixed: Vec<(Span, bool)> = idents
            .into_iter()
            .filter_map(|(id, parent)| {
                let local = *self.locals.get(&id)?;
                let name = self.c.js.name(id);
                if local || (event_local && name == "$event") || !can_prefix(name) {
                    return None;
                }
                let shorthand = parent.is_some_and(|p| {
                    matches!(
                        self.c.js.kind(p),
                        Kind::Property {
                            shorthand: true,
                            ..
                        }
                    )
                });
                Some((self.span_of(id), shorthand))
            })
            .collect();
        prefixed.sort_unstable_by_key(|(s, _)| s.lo);
        let mut at = text.lo;
        for (span, shorthand) in prefixed {
            self.copy(Span::new(at, span.lo));
            if shorthand {
                self.e.copy(self.src, span);
                self.e.push(": ");
            }
            self.e.push("__VLS_ctx.");
            self.e.copy(self.src, span);
            at = span.hi;
        }
        self.copy(Span::new(at, text.hi));
    }

    fn copy(&mut self, span: Span) {
        if !span.is_empty() {
            self.e.copy(self.src, span);
        }
    }
}
