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

use oxc_ast::ast::Expression;
use oxc_semantic::ReferenceId;
use oxc_span::GetSpan;
use rsvelte_kernel::diagnostics::Unsupported;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{ExpressionIdentifier, document_span, node_span};
use rsvelte_vue_semantic::expressions::{
    Identifier, Parent, camelize, can_prefix, collect_identifiers, collect_pattern_identifiers,
    is_simple_identifier, to_handler_key,
};
use rsvelte_vue_semantic::resolve::Resolution;
use rsvelte_vue_syntax::syntax_tree::{
    AttributeKind, DirectiveExpression, DirectiveName, SingleFileComponent, TemplateNode,
    TemplateNodeIdentifier,
};

#[derive(Debug)]
pub(crate) enum Projection {
    /// Not type-checked: a `<script setup>` without `lang="ts"` makes the virtual file JavaScript,
    /// and vue-tsc reports no semantic diagnostics for it (`checkJs` is off).
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
pub(crate) fn project(
    component: &SingleFileComponent,
    source_text: &str,
    resolution: &Resolution,
) -> R<Projection> {
    if component.script.is_some() && !component.typescript {
        return Ok(Projection::JavaScript);
    }
    if let Some(p) = resolution.define_props() {
        return Err(Unsupported::at(
            "defineProps in a type-checked component",
            document_span(p.call.span),
        ));
    }
    let mut p = Projector {
        component,
        source_text,
        resolution,
        emitter: Emitter::default(),
        chain_open: false,
    };
    if let Some(script) = &component.script {
        p.emitter.copy(source_text, script.content);
        p.emitter.push("\n");
    }
    p.emitter.push(PRELUDE);
    let exposed = p.exposed();
    if exposed.is_empty() {
        p.emitter
            .push(&format!("const __VLS_ctx = {{}} as {INSTANCE};\n"));
    } else {
        p.emitter
            .push("type __VLS_SetupExposed = import('vue').ShallowUnwrapRef<{\n");
        for name in exposed {
            p.emitter.push(&format!("{name}: typeof {name};\n"));
        }
        p.emitter.push("}>;\nconst __VLS_ctx = {\n");
        p.emitter.push(&format!(
            "...{{}} as {INSTANCE},\n...{{}} as __VLS_SetupExposed,\n}};\n"
        ));
    }
    p.emitter
        .push("let __VLS_intrinsics!: import('vue/jsx-runtime').JSX.IntrinsicElements;\n");
    p.children(component.root())?;
    Ok(Projection::TypeScript(p.emitter))
}

struct Projector<'a> {
    component: &'a SingleFileComponent,
    source_text: &'a str,
    resolution: &'a Resolution,
    emitter: Emitter,
    /// The last statement closed a `v-if` / `v-else-if` block, so a `v-else` may follow.
    chain_open: bool,
}

impl<'a> Projector<'a> {
    /// The script's top-level names the template reads, in the order it first reads them:
    /// upstream's `__VLS_SetupExposed`.
    fn exposed(&self) -> Vec<&'a str> {
        let resolution = self.resolution;
        let Some(template) = &self.component.template else {
            return Vec::new();
        };
        let content = template.content;
        let (scoping, nodes) = (resolution.scoping(), resolution.semantic().nodes());
        let mut first_reads: Vec<(u32, &'a str)> = scoping
            .get_bindings(resolution.root_scope())
            .iter()
            .filter_map(|(name, &symbol)| {
                let first = scoping
                    .get_resolved_reference_ids(symbol)
                    .iter()
                    .map(|&r| nodes.kind(scoping.get_reference(r).node_id()).span())
                    .filter(|at| content.start_offset <= at.start && at.end <= content.end_offset)
                    .map(|at| at.start)
                    .min()?;
                Some((first, name.as_str()))
            })
            .collect();
        first_reads.sort_unstable_by_key(|&(at, _)| at);
        first_reads.into_iter().map(|(_, name)| name).collect()
    }

    fn children(&mut self, identifiers: &[TemplateNodeIdentifier]) -> R<()> {
        for &identifier in identifiers {
            self.node(identifier)?;
        }
        Ok(())
    }

    fn node(&mut self, identifier: TemplateNodeIdentifier) -> R<()> {
        match *self.component.node(identifier) {
            TemplateNode::Text { .. } | TemplateNode::Comment { .. } => {}
            TemplateNode::Interpolation { expression, span } => {
                self.chain_open = false;
                self.emitter.push("(");
                self.expression(
                    expression,
                    Span::new(span.start_offset + 2, span.end_offset - 2),
                    false,
                );
                self.emitter.push(");\n");
            }
            TemplateNode::Element {
                name,
                attributes,
                children,
                start_tag,
                span,
                ..
            } => {
                let condition =
                    rsvelte_vue_semantic::resolve::if_directive(self.component, identifier);
                let for_exp = self.component.directive(attributes, DirectiveName::For);
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
                        let javascript = &self.component.javascript;
                        let parameters = javascript.get_parameters(f.parameters);
                        if let Some(rest) = &parameters.rest {
                            return Err(Unsupported::at(
                                "a rest alias in v-for",
                                document_span(rest.span),
                            ));
                        }
                        self.emitter.push("for (const [");
                        for (i, param) in parameters.items.iter().enumerate() {
                            if i > 0 {
                                self.emitter.push(", ");
                            }
                            let mut identifiers = Vec::new();
                            collect_pattern_identifiers(&param.pattern, &mut identifiers);
                            self.prefixed(identifiers, node_span(&param.pattern), false);
                        }
                        self.emitter.push("] of __VLS_vFor((");
                        let source = javascript.get_expression(f.source);
                        self.expression(f.source, node_span(source), false);
                        self.emitter.push(")!)) {\n");
                    }
                    (None, None) => self.chain_open = false,
                }
                self.element(name, attributes, span != start_tag)?;
                self.children(self.component.children(children))?;
                if condition.is_some() || for_exp.is_some() {
                    self.emitter.push("}\n");
                }
                self.chain_open =
                    matches!(condition, Some(DirectiveName::If | DirectiveName::ElseIf));
            }
        }
        Ok(())
    }

    fn open_branch(
        &mut self,
        attributes: rsvelte_vue_syntax::syntax_tree::Range,
        dir: DirectiveName,
    ) -> R<()> {
        let (a, d) = self
            .component
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
            self.emitter.push("else ");
        }
        if let Some(test) = test {
            self.emitter.push("if (");
            let value = a.value.expect("an expression has a value");
            self.expression(test, value, false);
            self.emitter.push(") ");
        }
        self.emitter.push("{\n");
        Ok(())
    }

    /// `__VLS_asFunctionalElement1(__VLS_intrinsics.p, __VLS_intrinsics.p)({ … });`: the end tag is
    /// the second argument, when there is one.
    fn element(
        &mut self,
        name: Span,
        attributes: rsvelte_vue_syntax::syntax_tree::Range,
        end_tag: bool,
    ) -> R<()> {
        let tag = name.text(self.source_text);
        if !tag
            .bytes()
            .all(|b| b.is_ascii_lowercase() || b.is_ascii_digit())
        {
            return Err(Unsupported::at("components and custom elements", name));
        }
        self.emitter
            .push("__VLS_asFunctionalElement1(__VLS_intrinsics.");
        self.emitter.copy(self.source_text, name);
        if end_tag {
            self.emitter.push(", __VLS_intrinsics.");
            self.emitter.push(tag);
        }
        self.emitter.push(")({\n");
        for a in self.component.attributes(attributes) {
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
                        self.emitter.push(if spread { "...{ " } else { "" });
                        self.key(arg);
                        self.emitter.push(": (");
                        self.expression(*e, value, false);
                        self.emitter.push(if spread { ") },\n" } else { "),\n" });
                    }
                    (DirectiveName::On, Some(arg), DirectiveExpression::Expression(e)) => {
                        let value = a.value.expect("an expression has a value");
                        self.handler(arg, *e, value);
                    }
                    _ => return Err(Unsupported::at("this directive", a.span)),
                },
            }
        }
        self.emitter.push("});\n");
        Ok(())
    }

    fn static_attribute(&mut self, name: Span, value: Option<Span>, quoted: bool) -> R<()> {
        let text = name.text(self.source_text);
        if text == "style" {
            return Err(Unsupported::at("a static style attribute", name));
        }
        let class = text == "class";
        self.emitter.push(if class { "...{ " } else { "" });
        self.key(name);
        self.emitter.push(": ");
        match value {
            None => self.emitter.push("true"),
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
                self.emitter.push(quote);
                self.emitter.copy(self.source_text, v);
                self.emitter.push(quote);
            }
        }
        self.emitter.push(if class { " },\n" } else { ",\n" });
        Ok(())
    }

    /// An attribute name as an object key: bare when it is an identifier, else single-quoted.
    fn key(&mut self, name: Span) {
        if is_simple_identifier(name.text(self.source_text)) {
            self.emitter.copy(self.source_text, name);
        } else {
            self.emitter.push("'");
            self.emitter.copy(self.source_text, name);
            self.emitter.push("'");
        }
    }

    /// `...{ onClick: … },`: a name or a function as written, an inline statement as a function
    /// that receives `$event`.
    fn handler(&mut self, arg: Span, exp: ExpressionIdentifier, value: Span) {
        let key = to_handler_key(&camelize(arg.text(self.source_text)));
        self.emitter.push("...{ ");
        if is_simple_identifier(&key) {
            self.emitter.push(&key);
        } else {
            self.emitter.push(&format!("'{key}'"));
        }
        self.emitter.push(": ");
        let as_written = match self.component.javascript.get_expression(exp) {
            Expression::StaticMemberExpression(_)
            | Expression::ComputedMemberExpression(_)
            | Expression::PrivateFieldExpression(_)
            | Expression::ArrowFunctionExpression(_)
            | Expression::FunctionExpression(_) => true,
            Expression::Identifier(identifier) => identifier.name != "undefined",
            _ => false,
        };
        if as_written {
            self.emitter.push("(");
            self.expression(exp, value, false);
            self.emitter.push(")");
        } else {
            self.emitter.push("(...[$event]) => {\nreturn (");
            self.expression(exp, value, true);
            self.emitter.push(");\n}");
        }
        self.emitter.push("},\n");
    }

    /// The source text `text` of expression `root`, with every name read from the component
    /// prefixed by `__VLS_context.` (a shorthand property keeps its key).
    fn expression(&mut self, root: ExpressionIdentifier, text: Span, event_local: bool) {
        let mut identifiers = Vec::new();
        collect_identifiers(
            self.component.javascript.get_expression(root),
            &mut identifiers,
        );
        self.prefixed(identifiers, text, event_local);
    }

    /// Whether `reference` names something the template declares (a `v-for` alias, a parameter
    /// of a function written in an expression).
    fn is_local(&self, reference: ReferenceId) -> bool {
        let resolution = self.resolution;
        resolution.symbol_of(reference).is_some_and(|symbol| {
            resolution.scoping().symbol_scope_id(symbol) != resolution.root_scope()
        })
    }

    fn prefixed(&mut self, identifiers: Vec<Identifier<'_>>, text: Span, event_local: bool) {
        let mut prefixed: Vec<(Span, bool)> = identifiers
            .into_iter()
            .filter_map(|identifier| {
                let local = self.is_local(identifier.reference?);
                let name = identifier.name;
                if local || (event_local && name == "$event") || !can_prefix(name) {
                    return None;
                }
                Some((identifier.span, identifier.parent == Parent::Shorthand))
            })
            .collect();
        prefixed.sort_unstable_by_key(|(s, _)| s.start_offset);
        let mut at = text.start_offset;
        for (span, shorthand) in prefixed {
            self.copy(Span::new(at, span.start_offset));
            if shorthand {
                self.emitter.copy(self.source_text, span);
                self.emitter.push(": ");
            }
            self.emitter.push("__VLS_ctx.");
            self.emitter.copy(self.source_text, span);
            at = span.end_offset;
        }
        self.copy(Span::new(at, text.end_offset));
    }

    fn copy(&mut self, span: Span) {
        if !span.is_empty() {
            self.emitter.copy(self.source_text, span);
        }
    }
}

#[cfg(test)]
mod tests;
