//! The TypeScript view of a component, for type checking (upstream: `@vue/language-core`'s
//! virtual code, which vue-tsc checks).
//!
//! The `<script setup>` comes first, verbatim. The template follows as statements: an element is an
//! `__VLS_asFunctionalElement1` call on its intrinsic type with its attributes as an object
//! literal, a `v-if` chain is an `if` chain, a `v-for` is a `for … of`, an interpolation is a
//! parenthesized expression. A name the template reads from the component becomes
//! `__VLS_context.name`, and `__VLS_context` is typed as upstream types it, so the checker's
//! messages (which print that name and that type) match. Everything copied from the component is
//! mapped; the inserted text is not, so a diagnostic maps back to what was written
//! ([`Emitter::lookup_overlap`]).

use rsvelte_javascript::scope::ScopeIdentifier;
use rsvelte_javascript::{Kind, NodeIdentifier};
use rsvelte_kernel::diagnostics::diagnostic::Unsupported;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rustc_hash::FxHashMap;

use crate::compile::template::{
    camelize, can_prefix, collect_identifiers, is_simple_identifier, to_handler_key,
};
use crate::resolve::Resolution;
use crate::syntax_tree::{
    AttributeKind, DirectiveExpression, DirectiveName, SingleFileComponent, TemplateNode,
    TemplateNodeIdentifier,
};

#[derive(Debug)]
pub enum Projection {
    /// Not type-checked: a `<script setup>` without `lang="ts"` makes the virtual file JavaScript,
    /// and vue-tsc reports no semantic diagnostics for it (`checkJavaScript` is offset).
    JavaScript,
    TypeScript(Emitter),
}

type R<T> = Result<T, Unsupported>;

const PRELUDE: &str = "// @ts-ignore\ndeclare const { defineProps, defineSlots, defineEmits, \
                       defineExpose, defineModel, defineOptions, withDefaults, }: typeof \
                       import('vue');\n";
const INSTANCE: &str = "import('vue').ComponentPublicInstance";

/// # Errors
///
/// [`Unsupported`] if the component holds a construct the projection does not handle yet.
pub fn project(c: &SingleFileComponent, source_text: &str, res: &Resolution) -> R<Projection> {
    if c.script.is_some() && !c.typescript {
        return Ok(Projection::JavaScript);
    }
    if let Some(p) = &res.define_props {
        return Err(Unsupported::at(
            "defineProps in a type-checked component",
            c.javascript
                .source_location(p.call)
                .span()
                .unwrap_or_default(),
        ));
    }
    let mut p = Projector {
        c,
        source_text,
        locals: res
            .sem
            .references
            .iter()
            .map(|r| {
                let local = r
                    .binding
                    .is_some_and(|b| res.sem.bindings[b].scope != ScopeIdentifier::ROOT);
                (r.node, local)
            })
            .collect(),
        e: Emitter::new(),
        chain_open: false,
    };
    if let Some(script) = &c.script {
        p.e.copy(source_text, script.content);
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
    Ok(Projection::TypeScript(p.e))
}

struct Projector<'a> {
    c: &'a SingleFileComponent,
    source_text: &'a str,
    /// Every reference, and whether it names something the template declares (a `v-for` alias, a
    /// parameter of a function written in an expression).
    locals: FxHashMap<NodeIdentifier, bool>,
    e: Emitter,
    /// The last statement closed a `v-if` / `v-else-if` block, so a `v-else` may follow.
    chain_open: bool,
}

impl<'a> Projector<'a> {
    /// The script's top-level names the template reads, in the order it first reads them:
    /// upstream's `__VLS_SetupExposed`.
    fn exposed(&self, res: &Resolution) -> Vec<&'a str> {
        let c: &'a SingleFileComponent = self.c;
        let Some(template) = &c.template else {
            return Vec::new();
        };
        let mut found: Vec<(u32, &str)> = res
            .sem
            .references
            .iter()
            .filter_map(|r| {
                let b = &res.sem.bindings[r.binding?];
                let at = c.javascript.source_location(r.node).span()?;
                (b.scope == ScopeIdentifier::ROOT
                    && template.content.start_offset <= at.start_offset
                    && at.end_offset <= template.content.end_offset)
                    .then(|| (at.start_offset, c.javascript.name(r.node)))
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

    fn children(&mut self, identifiers: &[TemplateNodeIdentifier]) -> R<()> {
        for &identifier in identifiers {
            self.node(identifier)?;
        }
        Ok(())
    }

    fn node(&mut self, identifier: TemplateNodeIdentifier) -> R<()> {
        match *self.c.node(identifier) {
            TemplateNode::Text { .. } | TemplateNode::Comment { .. } => {}
            TemplateNode::Interpolation { expression, span } => {
                self.chain_open = false;
                self.e.push("(");
                self.expression(
                    expression,
                    Span::new(span.start_offset + 2, span.end_offset - 2),
                    false,
                );
                self.e.push(");\n");
            }
            TemplateNode::Element {
                name,
                attributes,
                children,
                start_tag,
                span,
                ..
            } => {
                let condition = crate::resolve::if_directive(self.c, identifier);
                let for_exp = self.c.directive(attributes, DirectiveName::For);
                match (condition, for_exp) {
                    (Some(_), Some((a, _))) => {
                        return Err(Unsupported::at("v-if and v-for on one element", a.span));
                    }
                    (Some(dir), None) => self.open_branch(attributes, dir)?,
                    (None, Some((_, d))) => {
                        self.chain_open = false;
                        let DirectiveExpression::For(f) = &d.exp else {
                            unreachable!("the parser gives v-for a for expression")
                        };
                        self.e.push("for (const [");
                        for (i, &param) in f.parameters.iter().enumerate() {
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
                self.element(name, attributes, span != start_tag)?;
                self.children(self.c.children(children))?;
                if condition.is_some() || for_exp.is_some() {
                    self.e.push("}\n");
                }
                self.chain_open =
                    matches!(condition, Some(DirectiveName::If | DirectiveName::ElseIf));
            }
        }
        Ok(())
    }

    fn open_branch(&mut self, attributes: crate::syntax_tree::Range, dir: DirectiveName) -> R<()> {
        let (a, d) = self
            .c
            .directive(attributes, dir)
            .expect("if_directive found it");
        if dir != DirectiveName::If && !self.chain_open {
            return Err(Unsupported::at("a v-else without its v-if", a.span));
        }
        let test = match (&d.exp, dir) {
            (DirectiveExpression::None, DirectiveName::Else) => None,
            (DirectiveExpression::Expression(e), DirectiveName::If | DirectiveName::ElseIf) => {
                Some(*e)
            }
            _ => return Err(Unsupported::at("this v-if expression", a.span)),
        };
        if dir != DirectiveName::If {
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
    fn element(
        &mut self,
        name: Span,
        attributes: crate::syntax_tree::Range,
        end_tag: bool,
    ) -> R<()> {
        let tag = name.text(self.source_text);
        if !tag
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit())
        {
            return Err(Unsupported::at("components and custom elements", name));
        }
        self.e.push("__VLS_asFunctionalElement1(__VLS_intrinsics.");
        self.e.copy(self.source_text, name);
        if end_tag {
            self.e.push(", __VLS_intrinsics.");
            self.e.push(tag);
        }
        self.e.push(")({\n");
        for a in self.c.attributes(attributes) {
            match &a.kind {
                AttributeKind::Static => self.static_attribute(a.name, a.value, a.quoted)?,
                AttributeKind::Directive(d) => match (d.name, d.arg, &d.exp) {
                    (
                        DirectiveName::If
                        | DirectiveName::ElseIf
                        | DirectiveName::Else
                        | DirectiveName::For,
                        ..,
                    ) => {}
                    (DirectiveName::Bind, Some(arg), DirectiveExpression::Expression(e)) => {
                        let value = a.value.expect("an expression has a value");
                        let spread = matches!(arg.text(self.source_text), "class" | "style");
                        self.e.push(if spread { "...{ " } else { "" });
                        self.key(arg);
                        self.e.push(": (");
                        self.expression(*e, value, false);
                        self.e.push(if spread { ") },\n" } else { "),\n" });
                    }
                    (DirectiveName::On, Some(arg), DirectiveExpression::Expression(e)) => {
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
        let text = name.text(self.source_text);
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
                if v.text(self.source_text)
                    .contains(['\\', '\n', '\r', '"', '\''])
                {
                    return Err(Unsupported::at("this attribute value", v));
                }
                let quote = if quoted {
                    &self.source_text[v.start_offset as usize - 1..v.start_offset as usize]
                } else {
                    "\""
                };
                self.e.push(quote);
                self.e.copy(self.source_text, v);
                self.e.push(quote);
            }
        }
        self.e.push(if class { " },\n" } else { ",\n" });
        Ok(())
    }

    /// An attribute name as an object key: bare when it is an identifier, else single-quoted.
    fn key(&mut self, name: Span) {
        if is_simple_identifier(name.text(self.source_text)) {
            self.e.copy(self.source_text, name);
        } else {
            self.e.push("'");
            self.e.copy(self.source_text, name);
            self.e.push("'");
        }
    }

    /// `...{ onClick: … },`: a name or a function as written, an inline statement as a function
    /// that receives `$event`.
    fn handler(&mut self, arg: Span, exp: NodeIdentifier, value: Span) {
        let key = to_handler_key(&camelize(arg.text(self.source_text)));
        self.e.push("...{ ");
        if is_simple_identifier(&key) {
            self.e.push(&key);
        } else {
            self.e.push(&format!("'{key}'"));
        }
        self.e.push(": ");
        let as_written = match self.c.javascript.kind(exp) {
            Kind::Member { .. } | Kind::Arrow { .. } | Kind::Function { .. } => true,
            Kind::Identifier(_) => self.c.javascript.name(exp) != "undefined",
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

    fn span_of(&self, n: NodeIdentifier) -> Span {
        self.c
            .javascript
            .source_location(n)
            .span()
            .expect("a parsed template expression has a source range")
    }

    /// The source text `text` of expression `root`, with every name read from the component
    /// prefixed by `__VLS_context.` (a shorthand property keeps its key).
    fn expression(&mut self, root: NodeIdentifier, text: Span, event_local: bool) {
        let mut idents = Vec::new();
        collect_identifiers(&self.c.javascript, root, None, &mut idents);
        let mut prefixed: Vec<(Span, bool)> = idents
            .into_iter()
            .filter_map(|(identifier, parent)| {
                let local = *self.locals.get(&identifier)?;
                let name = self.c.javascript.name(identifier);
                if local || (event_local && name == "$event") || !can_prefix(name) {
                    return None;
                }
                let shorthand = parent.is_some_and(|p| {
                    matches!(
                        self.c.javascript.kind(p),
                        Kind::Property {
                            shorthand: true,
                            ..
                        }
                    )
                });
                Some((self.span_of(identifier), shorthand))
            })
            .collect();
        prefixed.sort_unstable_by_key(|(s, _)| s.start_offset);
        let mut at = text.start_offset;
        for (span, shorthand) in prefixed {
            self.copy(Span::new(at, span.start_offset));
            if shorthand {
                self.e.copy(self.source_text, span);
                self.e.push(": ");
            }
            self.e.push("__VLS_ctx.");
            self.e.copy(self.source_text, span);
            at = span.end_offset;
        }
        self.copy(Span::new(at, text.end_offset));
    }

    fn copy(&mut self, span: Span) {
        if !span.is_empty() {
            self.e.copy(self.source_text, span);
        }
    }
}
