//! The template: Vue's HIR to Svelte's.

use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    self as svelte, Attribute, AttributeValue, Branch,
    CompilerNodeIdentifier as SvelteNodeIdentifier, CompilerSyntaxTreeBuilder, Each,
    Element as SvelteElement, NodeKind as SvelteNodeKind,
};
use rsvelte_svelte_compile::Target;
use rsvelte_typescript::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator,
};
use rsvelte_typescript::scope::{BindingIdentifier, DeclarationKind};
use rsvelte_typescript::syntax_tree::flag;
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_vue::compiler_syntax_tree::{
    CompilerNodeIdentifier, CompilerSyntaxTree, Directive, Element, NodeKind, Property,
    PropertyKind, TagType,
};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName};
use rustc_hash::FxHashMap;

use crate::context::{Class, Helper, Info, Names, R, Rewriter, span_of, unsupported};

/// The translated template, and the declarations the instance script needs for it.
#[derive(Debug)]
pub(crate) struct Template {
    pub(crate) compiler_syntax_tree: svelte::CompilerSyntaxTree,
    pub(crate) expressions: Vec<NodeIdentifier>,
    /// Statements that go before the script's own.
    pub(crate) hoisted: Vec<NodeIdentifier>,
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

fn expression_of(d: &Directive, span: Span) -> R<NodeIdentifier> {
    match d.exp {
        DirectiveExpression::Expression(e) => Ok(e),
        _ => Err(unsupported("a directive without a value", span)),
    }
}

/// # Errors
///
/// A refusal for what the template does that svue does not translate.
pub(crate) fn translate(
    info: &Info<'_>,
    compiler_syntax_tree: Option<&CompilerSyntaxTree>,
    roots: &[CompilerNodeIdentifier],
    attributes: Option<&str>,
    to: &mut SyntaxTree,
    names: &mut Names,
) -> R<Template> {
    let mut b = CompilerSyntaxTreeBuilder::new(info.source_text, 0, 0);
    let Some(vue_tree) = compiler_syntax_tree else {
        let root = b.children(&[]);
        return Ok(Template {
            compiler_syntax_tree: b.finish(root),
            expressions: Vec::new(),
            hoisted: Vec::new(),
        });
    };
    let mut t = T {
        info,
        vue_tree,
        source_text: info.source_text,
        to,
        names,
        b,
        expressions: Vec::new(),
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
    let root = t.b.children(&root);
    let T {
        b,
        expressions,
        hoisted,
        ..
    } = t;
    Ok(Template {
        compiler_syntax_tree: b.finish(root),
        expressions,
        hoisted,
    })
}

struct T<'a, 'i> {
    info: &'a Info<'i>,
    vue_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    to: &'a mut SyntaxTree,
    names: &'a mut Names,
    b: CompilerSyntaxTreeBuilder<'a>,
    expressions: Vec<NodeIdentifier>,
    /// The aliases of the enclosing `v-for`s with more than one: read through their block's entry.
    aliases: FxHashMap<BindingIdentifier, (String, u32)>,
    roots: &'a [CompilerNodeIdentifier],
    attributes: Option<&'a str>,
    /// On the server, inside a `<select v-model>`: the model.
    select_model: Option<NodeIdentifier>,
    hoisted: Vec<NodeIdentifier>,
    vmodel: Option<String>,
    boolean_attribute: Option<String>,
    renderable: Option<String>,
}

impl T<'_, '_> {
    /// A template expression, rewritten.
    fn expression(&mut self, e: NodeIdentifier) -> R<NodeIdentifier> {
        let aliases = std::mem::take(&mut self.aliases);
        let out = Rewriter::new(self.info, true, &aliases).copy(self.to, e);
        self.aliases = aliases;
        out
    }

    fn root_expression(&mut self, e: NodeIdentifier) -> NodeIdentifier {
        self.expressions.push(e);
        e
    }

    fn helper(&mut self, h: Helper) -> NodeIdentifier {
        let name = self.names.helper(self.info.from, h);
        self.to.identifier(&name)
    }
}

/// The `:key` of a `v-for` element.
fn directive_key<'h>(
    compiler_syntax_tree: &'h CompilerSyntaxTree,
    el: &Element,
    source_text: &str,
) -> Option<(&'h Property, &'h Directive)> {
    compiler_syntax_tree
        .props(el.props)
        .iter()
        .find_map(|p| match &p.kind {
            PropertyKind::Directive(d)
                if d.name == DirectiveName::Bind
                    && d.arg.as_ref().is_some_and(|a| a.text(source_text) == "key") =>
            {
                Some((p, d))
            }
            _ => None,
        })
}

fn check_name(name: &str, span: Span) -> R<()> {
    if name.is_empty()
        || !name
            .bytes()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == b'-')
    {
        return Err(unsupported(
            format_args!("the attribute name `{name}` (svue takes lowercase names)"),
            span,
        ));
    }
    Ok(())
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

/// Whether Vue's runtime leaves the attribute as written: runtime-dom's `shouldSetAsProp` sets
/// some names as DOM properties, and these properties either do not reflect to the attribute or
/// reflect it converted (to a number, or for `value` not at all).
fn reflects_as_written(name: &str, tag: &str) -> bool {
    match name {
        "checked" | "selected" | "muted" | "autofocus" | "indeterminate" | "start" | "size"
        | "span" | "high" | "low" | "optimum" | "srcobject" | "innerhtml" | "textcontent"
        | "innertext" => false,
        "min" | "max" => tag == "input",
        "width" | "height" => matches!(tag, "img" | "video" | "canvas" | "source"),
        _ => true,
    }
}

mod runtime;
use runtime::{include_boolean_attribute, renderable, vmodel};

mod attributes;
mod blocks;
mod elements;
mod model;
