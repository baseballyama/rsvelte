//! The template: the Svelte HIR, read with Svelte's meaning, as a Vue template HIR built through
//! [`rsvelte_vue_semantic::compiler_syntax_tree::CompilerSyntaxTreeBuilder`].
//!
//! Text is what Svelte's [`clean_nodes`] leaves; the Vue HIR is post-condense, so the Vue compiler
//! keeps it as is. Expressions are copied into the component's tree; a reference to a prop becomes
//! `$$props.<key>` and everything else is left to the Vue compiler, which unwraps setup refs.
//!
//! The client and the server output differ where Svelte's client and server runtimes do: the
//! client mirrors what Svelte's DOM updates do (`set_text`, `set_attribute`, `set_value`, the
//! binding effects), the server what its renderer prints (`escape`, `attr`, `stringify`).

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    Argument, BindingPattern, Expression, FormalParameter, IdentifierReference, LogicalOperator,
    ObjectProperty, Statement,
};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_semantic::SymbolId;
use oxc_span::{GetSpan, GetSpanMut};
use rsvelte_kernel::index::{IndexRange, TypedIndex};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_compile::lower::{Item, Parent, clean_nodes};
use rsvelte_svelte_compile::render_plan::Namespace;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element,
    ElementKind, NodeKind, Part,
};
use rsvelte_svelte_semantic::evaluate::{Evaluation, Evaluator, Value};
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_compile::build::{Builder, sanitize_template_string};
use rsvelte_typescript_compile::strip::Strip;
use rsvelte_typescript_tree::{ExpressionIdentifier, ParametersIdentifier};
use rsvelte_vue_semantic::compiler_syntax_tree::{
    self as vue, CompilerSyntaxTreeBuilder, Name, PropertyKind, Text,
};
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName, LoopExpression};
use rustc_hash::{FxHashMap, FxHashSet};

use crate::compilation::{Input, span_of};
use crate::helpers::{self, Helper};
use crate::script::prop_member;
use crate::{R, unsupported};

/// What the emitter reads of the template besides the Vue HIR's expressions.
#[derive(Debug)]
pub(crate) struct Built {
    pub compiler_syntax_tree: vue::CompilerSyntaxTree,
    /// The helpers the template calls, sorted.
    pub helpers: Vec<Helper>,
    /// The spans of the template expressions with a call, which the client reads once per
    /// update.
    pub memoized: FxHashSet<oxc_span::Span>,
    pub namespaces: FxHashMap<vue::CompilerNodeIdentifier, Namespace>,
    /// The `$$Scope` elements of `{let}` and `{const}` declarations.
    pub scopes: FxHashSet<vue::CompilerNodeIdentifier>,
    pub animation_loops: FxHashSet<vue::CompilerNodeIdentifier>,
    pub custom_element: Option<CustomElementValues>,
}

/// The custom element options, their expressions copied into the component's tree.
#[derive(Debug)]
pub(crate) struct CustomElementValues {
    pub tag: Option<String>,
    pub shadow_root: bool,
    pub shadow: Option<ExpressionIdentifier>,
    pub props: Option<ExpressionIdentifier>,
    pub extend: Option<ExpressionIdentifier>,
}

/// Svelte's passive events: a listener for them cannot prevent the default.
const PASSIVE_EVENTS: &[&str] = &["touchstart", "touchmove"];

/// Builds the Vue HIR, and the snippet declarations the setup program needs.
///
/// # Errors
///
/// A `vuelte_unsupported` diagnostic for a construct outside the mapping.
pub(crate) fn build<'t>(
    i: Input<'_>,
    stylesheet_hash: Option<&str>,
    tree: &mut rsvelte_typescript_tree::Builder<'t>,
    b: &Builder<'t>,
) -> R<(Built, Vec<Statement<'t>>)> {
    let compiler_syntax_tree = i.compiler_syntax_tree;
    let mut snippet_names = FxHashMap::default();
    let mut declarations = Vec::new();
    for (identifier, node) in compiler_syntax_tree.nodes.iter_enumerated() {
        if matches!(node.kind, NodeKind::Snippet(_)) {
            let symbol = i
                .resolution
                .snippet(identifier)
                .expect("a snippet name has a symbol");
            let name = format!("$$snippet_{}", symbol.index());
            declarations.push(b.function_declaration(&name, b.params([]), [], false));
            snippet_names.insert(symbol, name);
        }
    }
    let mut t = Template {
        i,
        stylesheet_hash,
        tree,
        b,
        vb: CompilerSyntaxTreeBuilder::new(
            compiler_syntax_tree.nodes.len(),
            compiler_syntax_tree.attributes.len(),
        ),
        helpers: FxHashSet::default(),
        snippet_names,
        memoized: FxHashSet::default(),
        scopes: FxHashSet::default(),
        animation_loops: FxHashSet::default(),
        namespaces: FxHashMap::default(),
        declarations,
    };
    if !i.server && i.plan.async_values {
        t.helpers.insert(Helper::Async);
    }
    if !i.server && i.plan.auxiliary.contains_key("$effect.pending") {
        t.helpers.insert(Helper::Pending);
    }
    let root = t.list(
        Parent::Root,
        compiler_syntax_tree.children(compiler_syntax_tree.root),
        None,
        i.plan.preserve_whitespace,
        Span::default(),
    )?;
    let custom_element = i
        .plan
        .custom_element
        .as_ref()
        .map(|options| t.custom_element_values(options));
    let required: Vec<Helper> = t
        .helpers
        .iter()
        .flat_map(|&h| helpers::requires(h).iter().copied())
        .collect();
    t.helpers.extend(required);
    let mut helpers: Vec<Helper> = t.helpers.into_iter().collect();
    helpers.sort_unstable();
    Ok((
        Built {
            compiler_syntax_tree: t.vb.finish(root),
            helpers,
            memoized: t.memoized,
            namespaces: t.namespaces,
            scopes: t.scopes,
            animation_loops: t.animation_loops,
            custom_element,
        },
        t.declarations,
    ))
}

/// What an element's function ref runs: steps that need the element, and `bind:this`.
#[derive(Default)]
struct Steps<'t> {
    mounted: Vec<Expression<'t>>,
    this: Vec<Expression<'t>>,
}

struct Template<'i, 'r, 't> {
    i: Input<'i>,
    stylesheet_hash: Option<&'i str>,
    tree: &'r mut rsvelte_typescript_tree::Builder<'t>,
    b: &'r Builder<'t>,
    vb: CompilerSyntaxTreeBuilder,
    helpers: FxHashSet<Helper>,
    snippet_names: FxHashMap<SymbolId, String>,
    memoized: FxHashSet<oxc_span::Span>,
    scopes: FxHashSet<vue::CompilerNodeIdentifier>,
    animation_loops: FxHashSet<vue::CompilerNodeIdentifier>,
    namespaces: FxHashMap<vue::CompilerNodeIdentifier, Namespace>,
    /// What the setup program declares for the template: snippet names and attachment keys.
    declarations: Vec<Statement<'t>>,
}

fn known_string(v: &Value) -> String {
    match v {
        Value::Null | Value::Undefined => String::new(),
        v => v.to_javascript_string(),
    }
}

impl<'i, 't> Template<'i, '_, 't> {
    fn source(&self, e: ExpressionIdentifier) -> &'i Expression<'i> {
        self.i.component.javascript.get_expression(e)
    }

    /// `e` in the component's tree, for the Vue HIR to name.
    fn keep(&mut self, e: Expression<'t>) -> ExpressionIdentifier {
        self.tree.keep_expression(e)
    }

    fn call(
        &self,
        name: &str,
        arguments: impl IntoIterator<Item = Expression<'t>>,
    ) -> Expression<'t> {
        self.b.call(self.b.id(name), arguments)
    }

    /// Upstream's `scope.evaluate` of a template expression.
    fn evaluate(&self, e: ExpressionIdentifier) -> Evaluation {
        Evaluator::new(self.i.resolution).evaluate(self.source(e))
    }

    /// A template expression in the component's tree.
    fn template_expression(&mut self, e: ExpressionIdentifier) -> Expression<'t> {
        let source = self.source(e);
        if !self.i.server && crate::compilation::asynchronous::has_await(source) {
            self.helpers.insert(Helper::Async);
        }
        let value = self.rewrite(source);
        if !self.i.server
            && self.i.analysis.meta(e).has_call
            && !matches!(
                source.get_inner_expression(),
                Expression::ArrowFunctionExpression(_) | Expression::FunctionExpression(_)
            )
        {
            self.memoized.insert(value.span());
        }
        value
    }

    const fn rewriter(&self) -> TemplateRewrite<'_, 't> {
        TemplateRewrite {
            b: self.b,
            res: self.i.resolution,
            snippet_names: &self.snippet_names,
            server: self.i.server,
        }
    }

    /// `e` copied with [`TemplateRewrite`].
    fn rewrite(&self, e: &Expression<'_>) -> Expression<'t> {
        let mut value = e.clone_in_with_semantic_ids(self.b.allocator());
        Strip::new(self.b.allocator()).visit_expression(&mut value);
        self.rewriter().visit_expression(&mut value);
        value
    }

    /// A pattern copied with [`TemplateRewrite`].
    fn pattern(&self, p: &BindingPattern<'_>) -> BindingPattern<'t> {
        let mut value = p.clone_in_with_semantic_ids(self.b.allocator());
        Strip::new(self.b.allocator()).visit_binding_pattern(&mut value);
        self.rewriter().visit_binding_pattern(&mut value);
        value
    }

    /// A parameter copied with [`TemplateRewrite`].
    fn parameter(&self, p: &FormalParameter<'_>) -> FormalParameter<'t> {
        let mut value = p.clone_in_with_semantic_ids(self.b.allocator());
        Strip::new(self.b.allocator()).visit_formal_parameter(&mut value);
        self.rewriter().visit_formal_parameter(&mut value);
        value
    }

    /// `v-for="(parameters) in source"`.
    fn loop_directive(
        &mut self,
        parameters: impl IntoIterator<Item = FormalParameter<'t>>,
        source: Expression<'t>,
        span: Span,
    ) -> vue::Property {
        let parameters = self.b.formal_parameters(parameters);
        let parameters: ParametersIdentifier = self.tree.keep_parameters(parameters.unbox());
        let source = self.keep(source);
        directive(
            DirectiveName::For,
            None,
            DirectiveExpression::For(LoopExpression { parameters, source }),
            span,
        )
    }

    /// `:name="value"`.
    fn bound(&mut self, name: &str, at: Span, value: Expression<'t>, span: Span) -> vue::Property {
        let value = self.keep(value);
        directive(
            DirectiveName::Bind,
            Some(spelled(name, at)),
            DirectiveExpression::Expression(value),
            span,
        )
    }

    /// `v-<name>="value"`, or `v-<name>` without one.
    fn directive_with(
        &mut self,
        name: DirectiveName,
        value: Option<Expression<'t>>,
        span: Span,
    ) -> vue::Property {
        let exp = value.map_or(DirectiveExpression::None, |value| {
            DirectiveExpression::Expression(self.keep(value))
        });
        directive(name, None, exp, span)
    }

    /// `a="s{e}t"`: Svelte's attribute chunk, with `?? ''` (client) or `stringify` (server)
    /// around each expression it cannot prove a string.
    fn interpolated(&mut self, parts: &[Part]) -> Expression<'t> {
        let b = self.b;
        let source_text = self.i.source_text;
        let mut quasis = Vec::with_capacity(parts.len() + 1);
        let mut expressions = Vec::with_capacity(parts.len());
        let mut text = String::new();
        for p in parts {
            match *p {
                Part::Text(span) => {
                    text.push_str(&rsvelte_svelte_syntax::syntax_tree::decode_attribute(
                        span.text(source_text),
                    ));
                }
                Part::Expression { expression, .. } => {
                    let evaluated = self.evaluate(expression);
                    if evaluated.is_known {
                        text.push_str(&known_string(&evaluated.value));
                        continue;
                    }
                    quasis.push(sanitize_template_string(&text).into_owned());
                    text.clear();
                    let x = self.template_expression(expression);
                    let value = if self.i.server {
                        if evaluated.is_string && evaluated.is_defined {
                            x
                        } else {
                            self.helpers.insert(Helper::Stringify);
                            self.call("$$stringify", [x])
                        }
                    } else if evaluated.is_defined {
                        x
                    } else {
                        b.logical(x, LogicalOperator::Coalesce, b.string(""))
                    };
                    expressions.push(value);
                }
            }
        }
        if expressions.is_empty() {
            return b.string(&text);
        }
        quasis.push(sanitize_template_string(&text).into_owned());
        b.template(quasis.iter().map(String::as_str), expressions)
    }

    /// A `<template>` with `props`, its children set later.
    fn template_node(
        &mut self,
        tag: &str,
        at: Span,
        props: Vec<vue::Property>,
        parent: Option<vue::CompilerNodeIdentifier>,
    ) -> vue::CompilerNodeIdentifier {
        let props = self.vb.props(props);
        let kind = template_element(tag, at, props);
        self.vb.node(kind, at, parent, 0)
    }
}

/// Template references to props read `$$props.<key>`, snippets their declaration's name, and
/// runes Vue's reactivity; the Vue compiler handles the rest.
struct TemplateRewrite<'r, 't> {
    b: &'r Builder<'t>,
    res: &'r Resolution,
    snippet_names: &'r FxHashMap<SymbolId, String>,
    server: bool,
}

impl<'t> TemplateRewrite<'_, 't> {
    fn rune(&mut self, it: &mut Expression<'t>) -> Option<Expression<'t>> {
        let (name, _) = self.res.rune(it)?;
        let b = self.b;
        let span = it.span();
        let local = crate::script::runes::local(name);
        let eager = crate::script::runes::eager(name);
        if local.is_none() && !eager {
            return None;
        }
        let Expression::CallExpression(call) = it else {
            return None;
        };
        let mut arguments: Vec<Expression<'t>> = std::mem::replace(&mut call.arguments, b.vec([]))
            .into_iter()
            .map(Argument::into_expression)
            .collect();
        for a in &mut arguments {
            self.visit_expression(a);
        }
        if eager {
            return arguments.pop();
        }
        let mut value = match (name, local) {
            ("$effect.pending", _) if self.server => b.number(0.0),
            ("$effect.tracking", _) if self.server => b.boolean(false),
            (_, Some(local)) => b.call(b.id(local), arguments),
            (_, None) => unreachable!("checked above"),
        };
        *value.span_mut() = span;
        Some(value)
    }

    fn read(&self, identifier: &IdentifierReference<'_>) -> Option<Expression<'t>> {
        if let Some(symbol) = self.res.symbol(identifier)
            && let Some(name) = self.snippet_names.get(&symbol)
        {
            return Some(self.b.id_at(name, identifier.span));
        }
        prop_member(self.b, self.res, identifier)
    }
}

impl<'t> VisitMut<'t> for TemplateRewrite<'_, 't> {
    fn visit_expression(&mut self, it: &mut Expression<'t>) {
        let rewritten = match it {
            Expression::Identifier(identifier) => match self.read(identifier) {
                Some(e) => e,
                None => return,
            },
            Expression::CallExpression(_) => match self.rune(it) {
                Some(e) => e,
                None => return walk_mut::walk_expression(self, it),
            },
            _ => return walk_mut::walk_expression(self, it),
        };
        *it = rewritten;
    }

    fn visit_object_property(&mut self, it: &mut ObjectProperty<'t>) {
        if it.shorthand
            && let Expression::Identifier(identifier) = &it.value
            && let Some(read) = self.read(identifier)
        {
            it.value = read;
            it.shorthand = false;
            return;
        }
        walk_mut::walk_object_property(self, it);
    }
}

/// The Svelte node a Vue node came from, as the Vue tree records it.
fn origin(identifier: CompilerNodeIdentifier) -> u32 {
    u32::try_from(identifier.index()).expect("fewer than u32::MAX nodes")
}

fn spelled(text: &str, span: Span) -> Name {
    Name::Spelled {
        text: text.into(),
        span,
    }
}

fn directive(
    name: DirectiveName,
    arg: Option<Name>,
    exp: DirectiveExpression,
    span: Span,
) -> vue::Property {
    vue::Property {
        kind: PropertyKind::Directive(vue::Directive {
            name,
            arg,
            modifiers: Box::new([]),
            exp,
        }),
        span,
        origin: 0,
    }
}

fn attribute(a: &Attribute, value: Option<&str>) -> vue::Property {
    vue::Property {
        kind: PropertyKind::Attribute {
            name: Name::Source(a.name.span()),
            value: value.map(|v| Text {
                raw: a.span,
                cooked: Some(v.into()),
            }),
        },
        span: a.span,
        origin: a.origin,
    }
}

fn template_element(
    tag: &str,
    at: Span,
    props: IndexRange<vue::PropertyIdentifier>,
) -> vue::NodeKind {
    vue::NodeKind::Element(vue::Element {
        tag: spelled(tag, at),
        tag_type: vue::TagType::Template,
        props,
        children: vue::Children::default(),
    })
}

mod properties;
use properties::{binding_event, is_boolean, is_primitive, reads_this, static_type};

mod check;
pub(crate) use check::check;
pub(crate) use options::{CssMode, CustomElement, Options};

mod attributes;
mod await_block;
mod bindings;
mod blocks;
mod boolean_attributes;
mod components;
mod custom_elements;
mod declarations;
mod defaults;
mod each_block;
mod elements;
mod expressions;
mod groups;
mod options;
mod property_bindings;
mod raw_markup;
mod snippets;
mod static_text;
mod styles;
