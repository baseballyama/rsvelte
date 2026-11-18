//! The template: Vue's HIR to Svelte's.

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{
    Argument, AssignmentOperator, AssignmentTarget, BinaryOperator, Expression, LogicalOperator,
    SimpleAssignmentTarget, Statement, UnaryOperator,
};
use oxc_semantic::SymbolId;
use oxc_span::{GetSpan, SPAN};
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_compile::Target;
use rsvelte_svelte_semantic::compiler_syntax_tree::{
    self as svelte, Attribute, AttributeValue, Branch,
    CompilerNodeIdentifier as SvelteNodeIdentifier, CompilerSyntaxTreeBuilder, Each,
    Element as SvelteElement, NodeKind as SvelteNodeKind,
};
use rsvelte_typescript_compile::build::Builder;
use rsvelte_typescript_tree::ExpressionIdentifier;
use rsvelte_vue_semantic::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, Directive, Element, NodeKind, Property,
    PropertyKind, TagType,
};
use rsvelte_vue_syntax::syntax_tree::{DirectiveExpression, DirectiveName};
use rustc_hash::FxHashMap;

use crate::context::{
    Class, Declared, Helper, Info, Names, R, Rewriter, output_span, span_of, unsupported,
};

/// The translated template, and the declarations the instance script needs for it.
#[derive(Debug)]
pub(crate) struct Template<'a> {
    pub(crate) compiler_syntax_tree: svelte::CompilerSyntaxTree,
    /// Statements that go before the script's own.
    pub(crate) hoisted: Vec<Statement<'a>>,
}

/// runtime-core `getChildRoot` / `filterSingleRoot` in development: the elements that receive the
/// attributes that fall through, when the template renders a single element root (one element,
/// or one `v-if` chain of elements). Comments do not count.
#[must_use]
pub(crate) fn fallthrough_targets(
    compiler_syntax_tree: &CompilerSyntaxTree,
) -> Vec<CompilerNodeIdentifier> {
    let roots: Vec<CompilerNodeIdentifier> = compiler_syntax_tree
        .root()
        .iter()
        .copied()
        .filter(|&n| !matches!(compiler_syntax_tree.node(n).kind, NodeKind::Comment { .. }))
        .collect();
    let element = |n: CompilerNodeIdentifier| match &compiler_syntax_tree.node(n).kind {
        NodeKind::Element(el) if el.tag_type == TagType::Element => {
            let dirs = directives(compiler_syntax_tree, el);
            (!dirs.iter().any(|d| d.name == DirectiveName::For)).then(|| {
                dirs.iter()
                    .find(|d| {
                        matches!(
                            d.name,
                            DirectiveName::If | DirectiveName::ElseIf | DirectiveName::Else
                        )
                    })
                    .map(|d| d.name)
            })
        }
        _ => None,
    };
    match *roots.as_slice() {
        [one] if element(one) == Some(None) => vec![one],
        [first, ..] if element(first) == Some(Some(DirectiveName::If)) => {
            let mut chain = vec![first];
            for &n in &roots[1..] {
                match element(n) {
                    Some(Some(DirectiveName::ElseIf)) => chain.push(n),
                    Some(Some(DirectiveName::Else)) => {
                        chain.push(n);
                        return if chain.len() == roots.len() {
                            chain
                        } else {
                            Vec::new()
                        };
                    }
                    _ => return Vec::new(),
                }
            }
            Vec::new()
        }
        _ => Vec::new(),
    }
}

fn directives<'h>(
    compiler_syntax_tree: &'h CompilerSyntaxTree,
    el: &Element,
) -> Vec<&'h Directive> {
    compiler_syntax_tree
        .props(el.props)
        .iter()
        .filter_map(|p| match &p.kind {
            PropertyKind::Directive(d) => Some(d),
            PropertyKind::Attribute { .. } => None,
        })
        .collect()
}

fn directive<'h>(
    compiler_syntax_tree: &'h CompilerSyntaxTree,
    el: &Element,
    name: DirectiveName,
) -> Option<(&'h Property, &'h Directive)> {
    compiler_syntax_tree
        .props(el.props)
        .iter()
        .find_map(|p| match &p.kind {
            PropertyKind::Directive(d) if d.name == name => Some((p, d)),
            _ => None,
        })
}

fn expression_of(d: &Directive, span: Span) -> R<ExpressionIdentifier> {
    match d.exp {
        DirectiveExpression::Expression(e) => Ok(e),
        _ => Err(unsupported("a directive without a value", span)),
    }
}

/// # Errors
///
/// A refusal for what the template does that svue does not translate.
pub(crate) fn translate<'a>(
    info: &Info<'_>,
    compiler_syntax_tree: Option<&CompilerSyntaxTree>,
    roots: &[CompilerNodeIdentifier],
    attributes: Option<&str>,
    tree: &mut rsvelte_typescript_tree::Builder<'a>,
    b: &Builder<'a>,
    names: &mut Names<'_>,
) -> R<Template<'a>> {
    let mut builder = CompilerSyntaxTreeBuilder::new(info.source_text, 0, 0);
    let Some(vue_tree) = compiler_syntax_tree else {
        let root = builder.children(&[]);
        return Ok(Template {
            compiler_syntax_tree: builder.finish(root),
            hoisted: Vec::new(),
        });
    };
    let mut t = T {
        info,
        vue_tree,
        source_text: info.source_text,
        tree,
        b,
        names,
        builder,
        aliases: FxHashMap::default(),
        roots,
        attributes,
        select_model: None,
        hoisted: Vec::new(),
        vmodel: None,
        boolean_attribute: None,
        renderable: None,
    };
    let root = t.list(vue_tree.root(), None)?;
    let root = t.builder.children(&root);
    let T {
        builder, hoisted, ..
    } = t;
    Ok(Template {
        compiler_syntax_tree: builder.finish(root),
        hoisted,
    })
}

struct T<'t, 'v, 'n, 'a> {
    info: &'t Info<'v>,
    vue_tree: &'t CompilerSyntaxTree,
    source_text: &'v str,
    tree: &'t mut rsvelte_typescript_tree::Builder<'a>,
    b: &'t Builder<'a>,
    names: &'t mut Names<'n>,
    builder: CompilerSyntaxTreeBuilder<'v>,
    /// The aliases of the enclosing `v-for`s with more than one: read through their block's entry.
    aliases: FxHashMap<SymbolId, (String, u32)>,
    roots: &'t [CompilerNodeIdentifier],
    attributes: Option<&'t str>,
    /// On the server, inside a `<select v-model>`: the model.
    select_model: Option<ExpressionIdentifier>,
    hoisted: Vec<Statement<'a>>,
    vmodel: Option<String>,
    boolean_attribute: Option<String>,
    renderable: Option<String>,
}

impl<'a> T<'_, '_, '_, 'a> {
    /// A template expression, rewritten.
    fn expression(&self, e: ExpressionIdentifier) -> R<Expression<'a>> {
        Rewriter::new(self.info, self.b, true, &self.aliases)
            .expression(self.info.from.get_expression(e))
    }

    /// Keeps an expression the HIR refers to, its types erased.
    fn keep(&mut self, mut e: Expression<'a>) -> ExpressionIdentifier {
        if self.info.typescript {
            oxc_ast_visit::VisitMut::visit_expression(
                &mut rsvelte_typescript_compile::strip::Strip::new(self.b.allocator()),
                &mut e,
            );
        }
        self.tree.keep_expression(e)
    }

    fn helper(&mut self, h: Helper) -> Expression<'a> {
        let name = self.names.helper(h);
        self.b.id(&name)
    }

    fn copy(&self, e: &Expression<'a>) -> Expression<'a> {
        e.clone_in(self.b.allocator())
    }
}

/// `test ? consequent : alternate`.
fn conditional<'a>(
    b: &Builder<'a>,
    test: Expression<'a>,
    consequent: Expression<'a>,
    alternate: Expression<'a>,
) -> Expression<'a> {
    Expression::new_conditional_expression(SPAN, test, consequent, alternate, b)
}

/// `@vue/shared`'s `isBooleanAttr` with `isSpecialBooleanAttr`.
fn is_boolean_attribute(name: &str) -> bool {
    matches!(
        name,
        "itemscope"
            | "allowfullscreen"
            | "formnovalidate"
            | "ismap"
            | "nomodule"
            | "novalidate"
            | "readonly"
            | "async"
            | "autofocus"
            | "autoplay"
            | "controls"
            | "default"
            | "defer"
            | "disabled"
            | "hidden"
            | "inert"
            | "loop"
            | "open"
            | "required"
            | "reversed"
            | "scoped"
            | "seamless"
            | "checked"
            | "muted"
            | "multiple"
            | "selected"
    )
}

mod runtime;
use runtime::{include_boolean_attribute, renderable, vmodel};

mod attributes;
mod blocks;
mod elements;
mod model;
