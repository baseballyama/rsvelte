//! What a component call passes, in upstream `build_component`'s order. The targets differ only
//! in how they spell each prop, the children callback and the call.

use oxc_allocator::ArenaBox;
use oxc_ast::ast::{Expression, FormalParameters, ObjectPropertyKind, PropertyKind, Statement};
use rsvelte_svelte_semantic::compiler_syntax_tree::{Children, ElementKind, MetadataTag, Snippet};
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};

use super::javascript::member_root;
use super::snippets::{is_dynamic_render, render_call};
use super::template::single_expression;
use super::{
    Attribute, AttributeValue, BindingKind, Builder, CompilerNodeIdentifier, CompilerSyntaxTree,
    Diagnostic, Item, NodeKind, Resolution, Target,
};
use crate::lower::builder::Runtime;

#[derive(Clone, Copy)]
pub(super) enum Prop<'t> {
    /// `name`, `name="text"`, `name={value}` or `name="a {b}"`.
    Value(&'t Attribute),
    Spread(ExpressionIdentifier),
    /// `bind:name={target}`: a getter and a setter.
    Bind(&'t Attribute, ExpressionIdentifier),
    /// `bind:name={get, set}`, whose functions the parent declares.
    Accessors(&'t Attribute, &'t Expression<'t>, &'t Expression<'t>),
}

/// Values, spreads and getter-and-setter bindings as written, then the other bindings, so that a
/// spread cannot overwrite them. `bind:this` is no prop; see [`bind_this`].
pub(super) fn props<'t>(
    attributes: &'t [Attribute],
    source_text: &'t str,
    javascript: &'t Tree,
) -> impl Iterator<Item = Prop<'t>> {
    let accessors = |e| match javascript.get_expression(e).get_inner_expression() {
        Expression::SequenceExpression(s) if let [get, set] = s.expressions.as_slice() => {
            Some((get, set))
        }
        _ => None,
    };
    let values = attributes.iter().filter_map(move |a| match a.value {
        AttributeValue::Bind(e) if a.name.text(source_text) != "this" => {
            accessors(e).map(|(get, set)| Prop::Accessors(a, get, set))
        }
        AttributeValue::Bind(_) | AttributeValue::On { .. } | AttributeValue::Let(_) => None,
        AttributeValue::Spread(e) => Some(Prop::Spread(e)),
        _ => Some(Prop::Value(a)),
    });
    let bindings = attributes.iter().filter_map(move |a| match a.value {
        AttributeValue::Bind(e) if a.name.text(source_text) != "this" && accessors(e).is_none() => {
            Some(Prop::Bind(a, e))
        }
        _ => None,
    });
    values.chain(bindings)
}

/// Upstream's binding to a getter and a setter: `var bind_get = get; var bind_set = set;` in
/// the parent, read by the prop's accessors.
pub(super) fn push_accessors<'o>(
    b: &Builder<'o>,
    parts: &mut Vec<Entry<'o>>,
    declarations: &mut Vec<Statement<'o>>,
    name: &str,
    (get, set): (Expression<'o>, Expression<'o>),
    names: &mut super::names::Names,
) {
    let get_id = names.generate("bind_get");
    let set_id = names.generate("bind_set");
    declarations.push(b.var(&get_id, get));
    declarations.push(b.var(&set_id, set));
    let setter = vec![b.stmt(b.call(b.id(&set_id), [b.id("$$value")]))];
    push_binding(b, parts, name, b.call(b.id(&get_id), []), setter);
}

/// The target of a component's `bind:this`, which the client binds to the instance.
pub(super) fn bind_this(
    attributes: &[Attribute],
    source_text: &str,
) -> Option<ExpressionIdentifier> {
    attributes.iter().find_map(|a| match a.value {
        AttributeValue::Bind(e) if a.name.text(source_text) == "this" => Some(e),
        _ => None,
    })
}

/// Upstream `metadata.dynamic`: the component may change, so it is read through `$.component` on
/// the client and tested on the server.
pub(super) fn is_dynamic(res: &Resolution, reference: &Expression<'_>) -> bool {
    member_root(reference)
        .and_then(|root| res.symbol(root))
        .is_some_and(|symbol| {
            !matches!(reference, Expression::Identifier(_))
                || res.binding(symbol).kind != BindingKind::Normal
        })
}

/// What a component element calls.
#[derive(Clone, Copy)]
pub(super) enum Callee {
    /// A name or member chain read once.
    Static(ExpressionIdentifier),
    /// A component that may change: a dynamic name, or `<svelte:component this>`.
    Dynamic(ExpressionIdentifier),
    /// `<svelte:self>`: the component's own function.
    OwnFunction,
}

pub(super) fn callee(
    compiler_syntax_tree: &CompilerSyntaxTree,
    javascript: &Tree,
    res: &Resolution,
    identifier: CompilerNodeIdentifier,
) -> Callee {
    let NodeKind::Element(element) = &compiler_syntax_tree.node(identifier).kind else {
        unreachable!("a component element")
    };
    match element.kind {
        ElementKind::Metadata(Some(MetadataTag::SelfRef)) => Callee::OwnFunction,
        ElementKind::Metadata(Some(MetadataTag::Component)) => {
            let this = element.this.expect("validation checked `this`");
            let this = &compiler_syntax_tree.attributes[this].value;
            Callee::Dynamic(single_expression(this).expect("validation checked `this`"))
        }
        _ => {
            let reference = reference(compiler_syntax_tree, identifier);
            let expression = javascript.get_expression(reference).get_inner_expression();
            if is_dynamic(res, expression) {
                Callee::Dynamic(reference)
            } else {
                Callee::Static(reference)
            }
        }
    }
}

/// The component node's reference: its name as an identifier or a member chain.
pub(super) fn reference(
    compiler_syntax_tree: &CompilerSyntaxTree,
    identifier: CompilerNodeIdentifier,
) -> ExpressionIdentifier {
    compiler_syntax_tree
        .component_reference(identifier)
        .expect("a component name parses to a reference")
}

/// A fragment's only item that renders at the block's anchor.
#[derive(Clone, Copy)]
pub(super) enum Standalone {
    Component(CompilerNodeIdentifier),
    Render(CompilerNodeIdentifier),
}

/// Upstream `is_standalone`: the static component or render tag that is a fragment's only item
/// needs no template.
pub(super) fn standalone(
    compiler_syntax_tree: &CompilerSyntaxTree,
    javascript: &Tree,
    res: &Resolution,
    items: &[Item<'_>],
) -> Option<Standalone> {
    let &[Item::Node(identifier)] = items else {
        return None;
    };
    match &compiler_syntax_tree.node(identifier).kind {
        NodeKind::Element(element)
            if element.kind == ElementKind::Component
                && !is_dynamic(
                    res,
                    javascript
                        .get_expression(reference(compiler_syntax_tree, identifier))
                        .get_inner_expression(),
                ) =>
        {
            Some(Standalone::Component(identifier))
        }
        &NodeKind::Render { expression }
            if !is_dynamic_render(res, render_call(javascript.get_expression(expression)).0) =>
        {
            Some(Standalone::Render(identifier))
        }
        _ => None,
    }
}

pub(super) enum Entry<'o> {
    Property(ObjectPropertyKind<'o>),
    Spread(Expression<'o>),
}

/// A binding's `get name()` and `set name($$value)` props; the targets differ only in the
/// setter's body, which writes `$$value`.
pub(super) fn push_binding<'o>(
    b: &Builder<'o>,
    parts: &mut Vec<Entry<'o>>,
    name: &str,
    value: Expression<'o>,
    setter: Vec<Statement<'o>>,
) {
    parts.push(Entry::Property(b.getter(name, value)));
    parts.push(Entry::Property(b.accessor(
        PropertyKind::Set,
        name,
        b.params(["$$value"]),
        setter,
    )));
}

/// The snippets a component holds, each declared by `declare`, and their names. Upstream
/// declares them in a block, so that they can be props without clashing with the parent's names.
pub(super) fn child_snippets<'t, 'o>(
    tree: &'t CompilerSyntaxTree,
    javascript: &'t Tree,
    children: Children,
    mut declare: impl FnMut(&'t Snippet) -> Result<Statement<'o>, Diagnostic>,
) -> Result<(Vec<Statement<'o>>, Vec<&'t str>), Diagnostic> {
    let mut declarations = Vec::new();
    let mut names = Vec::new();
    for &child in tree.children(children) {
        if let NodeKind::Snippet(snippet) = &tree.node(child).kind {
            declarations.push(declare(snippet)?);
            names.push(super::snippets::snippet_name(javascript, snippet));
        }
    }
    Ok((declarations, names))
}

/// A slot's name, its callback's parameters and body.
pub(super) type SlotCallback<'s, 'o> = (
    &'s str,
    ArenaBox<'o, FormalParameters<'o>>,
    Vec<Statement<'o>>,
);

/// Each snippet child as a prop of its name, the default slot as a callback in the `children`
/// prop, the other slots in `$$slots`, and `$$slots` so that a `<slot>` in the child renders them
/// all. A default slot that takes slot props goes in `$$slots` too, and `children` throws.
pub(super) fn push_children<'o>(
    b: &Builder<'o>,
    parts: &mut Vec<Entry<'o>>,
    snippets: &[&str],
    slot_callbacks: Vec<SlotCallback<'_, 'o>>,
    default_takes_props: bool,
) {
    let mut slots = Vec::new();
    for &name in snippets {
        parts.push(Entry::Property(b.init(name, b.id(name))));
        // So that a component that still renders slots finds the snippet.
        let slot = if name == "children" { "default" } else { name };
        slots.push(b.init(slot, b.boolean(true)));
    }
    for (name, parameters, body) in slot_callbacks {
        if body.is_empty() {
            continue;
        }
        let callback = b.arrow_block(parameters, body, false);
        if name == "default" && !default_takes_props {
            parts.push(Entry::Property(b.init("children", callback)));
            slots.push(b.init("default", b.boolean(true)));
        } else {
            if name == "default" {
                let throws = b.member(b.id("$"), "invalid_default_snippet");
                parts.push(Entry::Property(b.init("children", throws)));
            }
            slots.push(b.init(name, callback));
        }
    }
    if !slots.is_empty() {
        parts.push(Entry::Property(b.init("$$slots", b.object(slots))));
    }
}

/// One object, or `$.spread_props` over the runs of properties and the spreads between them.
pub(super) fn props_expression<'o>(
    b: &Builder<'o>,
    parts: Vec<Entry<'o>>,
    target: Target,
) -> Expression<'o> {
    let mut groups = Vec::new();
    let mut properties = Vec::new();
    for part in parts {
        match part {
            Entry::Property(property) => properties.push(property),
            Entry::Spread(expression) => {
                if !properties.is_empty() {
                    groups.push(b.object(std::mem::take(&mut properties)));
                }
                groups.push(expression);
            }
        }
    }
    if groups.is_empty() {
        return b.object(properties);
    }
    if !properties.is_empty() {
        groups.push(b.object(properties));
    }
    match target {
        Target::Client => b.runtime("spread_props", groups),
        Target::Server => b.runtime("spread_props", [b.array(groups)]),
    }
}
