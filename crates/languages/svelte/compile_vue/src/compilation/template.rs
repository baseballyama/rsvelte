//! The template: the Svelte HIR, read with Svelte's meaning, as a Vue template HIR built through
//! [`rsvelte_vue::compiler_syntax_tree::CompilerSyntaxTreeBuilder`].
//!
//! Text is what Svelte's [`clean_nodes`] leaves; the Vue HIR is post-condense, so the Vue compiler
//! keeps it as is. Expressions are copied into the component's tree; a reference to a prop becomes
//! `$$props.<key>` and everything else is left to the Vue compiler, which unwraps setup refs.
//!
//! The client and the server output differ where Svelte's client and server runtimes do: the
//! client mirrors what Svelte's DOM updates do (`set_text`, `set_attribute`, `set_value`, the
//! binding effects), the server what its renderer prints (`escape`, `attr`, `stringify`).

use rsvelte_kernel::source::index::TypedIndex;
use rsvelte_kernel::source::positions::{SourceLocation, Span};
use rsvelte_svelte::compilation::compiler_syntax_tree::{
    Attribute, AttributeValue, Children, CompilerNodeIdentifier, CompilerSyntaxTree, Element,
    ElementKind, NodeKind, Part,
};
use rsvelte_svelte::semantic::analyze::Analysis;
use rsvelte_svelte::semantic::evaluate::Value;
use rsvelte_svelte::semantic::resolve::{BindingKind, Resolution};
use rsvelte_svelte_compile::lower::{Item, Parent, clean_nodes, sanitize_template_string};
use rsvelte_typescript::copy::{Rewrite, Verbatim, copy};
use rsvelte_typescript::operators::{
    AssignmentOperator, BinaryOperator, LogicalOperator, UnaryOperator,
};
use rsvelte_typescript::scope::{BindingIdentifier, DeclarationKind, ScopeIdentifier};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};
use rsvelte_vue::compiler_syntax_tree::{
    self as vue, CompilerSyntaxTreeBuilder, Name, PropertyKind, Text,
};
use rsvelte_vue::syntax_tree::{DirectiveExpression, DirectiveName, LoopExpression};
use rustc_hash::FxHashSet;

use crate::helpers::{self, Helper};
use crate::script::{Plan, VUE_GLOBALS, prop_member, walk};
use crate::{R, unsupported};

#[derive(Debug)]
pub struct Built {
    pub compiler_syntax_tree: vue::CompilerSyntaxTree,
    /// The helpers the template calls, sorted.
    pub helpers: Vec<Helper>,
}

/// Svelte's passive events: a listener for them cannot prevent the default.
const PASSIVE_EVENTS: &[&str] = &["touchstart", "touchmove"];

/// The text-like input types whose `bind:value` is Svelte's string binding.
const TEXT_INPUT_TYPES: &[&str] = &["text", "search", "email", "url", "tel", "password"];

/// Svelte's boolean attributes that are a boolean property of these elements (where Svelte's
/// client assigns the property and Vue's sets the property or the boolean attribute), that Vue's
/// server renders as a boolean attribute, and that the user cannot change.
const BOOLEAN_ATTRIBUTES: &[(&str, &[&str])] = &[
    (
        "disabled",
        &[
            "button", "fieldset", "input", "optgroup", "option", "select", "textarea",
        ],
    ),
    ("required", &["input", "select", "textarea"]),
    ("readonly", &["input", "textarea"]),
    ("multiple", &["input", "select"]),
    ("formnovalidate", &["button", "input"]),
    ("novalidate", &["form"]),
    ("reversed", &["ol"]),
    ("ismap", &["img"]),
    ("autoplay", &["audio", "video"]),
    ("controls", &["audio", "video"]),
    ("loop", &["audio", "video"]),
];

/// Attributes that reflect a string property of every element that has one, or are no property
/// at all: Svelte's `set_attribute` and Vue's `patchProp` give the same DOM for a string value.
fn is_text_attribute(name: &str) -> bool {
    matches!(
        name,
        "id" | "title"
            | "lang"
            | "href"
            | "src"
            | "alt"
            | "name"
            | "placeholder"
            | "role"
            | "rel"
            | "target"
            | "for"
            | "tabindex"
    ) || name.starts_with("aria-")
        || name.starts_with("data-")
}

/// Svelte's `LOAD_ERROR_ELEMENTS`: its server marks `onload` / `onerror` on them so that the
/// client can replay an event that fired before hydration.
const LOAD_ERROR_ELEMENTS: &[&str] = &[
    "body", "embed", "iframe", "img", "link", "object", "script", "style", "track",
];

/// Element names whose content or namespace the translation does not handle. Svelte's client
/// template drops `<html>`, `<head>` and `<body>` when the browser parses it.
const REFUSED_ELEMENTS: &[&str] = &[
    "template", "script", "style", "svg", "math", "slot", "noscript", "iframe", "object", "html",
    "head", "body",
];

/// The parents a table part needs for the browser to parse it where it is written.
fn table_parents(tag: &str) -> Option<&'static [&'static str]> {
    Some(match tag {
        "caption" | "colgroup" | "tbody" | "thead" | "tfoot" => &["table"],
        "col" => &["colgroup"],
        "tr" => &["tbody", "thead", "tfoot"],
        "td" | "th" => &["tr"],
        _ => return None,
    })
}

/// A table part outside its parent, which the browser reparents or drops when it parses Svelte's
/// client template, unless the part is alone in its template (the template element's own
/// insertion mode then fits it).
fn check_table_part(
    compiler_syntax_tree: &CompilerSyntaxTree,
    source_text: &str,
    identifier: CompilerNodeIdentifier,
    tag: &str,
    at: Span,
) -> R<()> {
    let Some(parents) = table_parents(tag) else {
        return Ok(());
    };
    let parent = compiler_syntax_tree.node(identifier).parent;
    let lists: Vec<Children> = match parent.map(|p| &compiler_syntax_tree.node(p).kind) {
        None => vec![compiler_syntax_tree.root],
        Some(NodeKind::Element(el)) => {
            if parents.contains(&el.name.text(source_text)) {
                return Ok(());
            }
            vec![el.children]
        }
        Some(NodeKind::If {
            branches,
            otherwise,
        }) => compiler_syntax_tree
            .branches(*branches)
            .iter()
            .map(|b| b.body)
            .chain(*otherwise)
            .collect(),
        Some(NodeKind::Each(each)) => std::iter::once(each.body).chain(each.fallback).collect(),
        Some(_) => Vec::new(),
    };
    let alone = lists
        .iter()
        .map(|&l| compiler_syntax_tree.children(l))
        .find(|l| l.contains(&identifier))
        .is_some_and(|l| {
            l.iter().all(|&s| match &compiler_syntax_tree.node(s).kind {
                NodeKind::Text { raw, .. } => {
                    s == identifier || raw.text(source_text).trim().is_empty()
                }
                NodeKind::Comment { .. } => true,
                _ => s == identifier,
            })
        });
    if alone {
        return Ok(());
    }
    Err(unsupported(
        format_args!(
            "a <{tag}> outside {} beside other content",
            parents.join(" or ")
        ),
        at,
    ))
}
/// What [`build`] reads.
#[derive(Clone, Copy, Debug)]
pub struct Input<'a> {
    pub compiler_syntax_tree: &'a CompilerSyntaxTree,
    pub resolution: &'a Resolution,
    pub analysis: &'a Analysis,
    pub javascript: &'a SyntaxTree,
    pub source_text: &'a str,
    pub plan: &'a Plan,
    pub server: bool,
}

/// Builds the Vue HIR.
///
/// # Errors
///
/// A `vuelte_unsupported` diagnostic for a construct outside the mapping.
pub fn build(input: Input<'_>, to: &mut SyntaxTree) -> R<Built> {
    let compiler_syntax_tree = input.compiler_syntax_tree;
    let mut b = Builder {
        i: input,
        to,
        vb: CompilerSyntaxTreeBuilder::new(
            compiler_syntax_tree.nodes.len(),
            compiler_syntax_tree.attributes.len(),
        ),
        helpers: FxHashSet::default(),
        visited: FxHashSet::default(),
    };
    let root = b.list(
        Parent::Root,
        compiler_syntax_tree.children(compiler_syntax_tree.root),
        None,
        false,
        Span::default(),
    )?;
    let required: Vec<Helper> = b
        .helpers
        .iter()
        .flat_map(|&h| helpers::requires(h).iter().copied())
        .collect();
    b.helpers.extend(required);
    let mut helpers: Vec<Helper> = b.helpers.into_iter().collect();
    helpers.sort_unstable();
    Ok(Built {
        compiler_syntax_tree: b.vb.finish(root),
        helpers,
    })
}

/// What an element's function ref runs: steps that need the element, and `bind:this`.
#[derive(Default)]
struct Steps {
    mounted: Vec<NodeIdentifier>,
    this: Vec<NodeIdentifier>,
}

struct Builder<'a, 't> {
    i: Input<'a>,
    to: &'t mut SyntaxTree,
    vb: CompilerSyntaxTreeBuilder,
    helpers: FxHashSet<Helper>,
    /// The top-level functions already checked for what they read.
    visited: FxHashSet<BindingIdentifier>,
}

fn known_string(v: &Value) -> String {
    match v {
        Value::Null | Value::Undefined => String::new(),
        v => v.to_javascript_string(),
    }
}

fn span_of(javascript: &SyntaxTree, n: NodeIdentifier) -> Span {
    javascript.source_location(n).span().unwrap_or_default()
}

/// Template references to props read `$$props.<key>`; the Vue compiler handles the rest.
struct TemplateRewrite<'a> {
    resolution: &'a Resolution,
}

impl Rewrite for TemplateRewrite<'_> {
    fn rewrite(
        &mut self,
        from: &SyntaxTree,
        to: &mut SyntaxTree,
        identifier: NodeIdentifier,
    ) -> Option<NodeIdentifier> {
        match from.kind(identifier) {
            Kind::Identifier(_) => prop_member(self.resolution, from, to, identifier),
            Kind::Property {
                key,
                value,
                shorthand: true,
                computed: false,
                ..
            } => {
                let v = prop_member(self.resolution, from, to, value)?;
                let k = to.ident(from.name(key), from.source_location(key));
                Some(to.property(k, v, 0, from.source_location(identifier)))
            }
            _ => None,
        }
    }
}

mod properties;
use properties::{
    attribute, binding_event, bound, captured_event, directive, is_boolean, is_name_chain,
    is_primitive, reads_this, spelled, static_type,
};

mod check;
pub use check::check;

mod attributes;
mod bindings;
mod blocks;
mod elements;
mod expressions;
