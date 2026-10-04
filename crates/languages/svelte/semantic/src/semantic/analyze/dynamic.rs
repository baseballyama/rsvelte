use rsvelte_kernel::source::index::IndexVector;
use rsvelte_svelte_hir::compiler_syntax_tree::{
    self, AttributeValue, CompilerNodeIdentifier, NodeKind, Part,
};
use rsvelte_typescript::NodeIdentifier;
use rustc_hash::FxHashMap;

use super::ExpressionMetadata;
use crate::semantic::input::ComponentInput;

/// Upstream `mark_subtree_dynamic` callers: returns whether `list` makes its fragment dynamic, and
/// records the answer for each element's own children. Upstream marks a fragment for any reference
/// in it, and every block and tag reads or declares one.
pub(super) fn mark_dynamic(
    input: &ComponentInput<'_>,
    expressions: &FxHashMap<NodeIdentifier, ExpressionMetadata>,
    list: &[CompilerNodeIdentifier],
    out: &mut IndexVector<CompilerNodeIdentifier, bool>,
) -> bool {
    let (compiler_syntax_tree, source_text) = (input.compiler_syntax_tree, input.source_text);
    let body = |c, out: &mut IndexVector<CompilerNodeIdentifier, bool>| {
        mark_dynamic(input, expressions, compiler_syntax_tree.children(c), out)
    };
    let mut any = false;
    for &identifier in list {
        match &compiler_syntax_tree.node(identifier).kind {
            NodeKind::Text { .. } | NodeKind::Comment { .. } => {}
            NodeKind::Expression { .. }
            | NodeKind::Render { .. }
            | NodeKind::Html { .. }
            | NodeKind::Const { .. }
            | NodeKind::Debug { .. }
            | NodeKind::Declaration { .. } => any = true,
            NodeKind::If {
                branches,
                otherwise,
            } => {
                any = true;
                for b in compiler_syntax_tree.branches(*branches) {
                    body(b.body, out);
                }
                if let Some(o) = otherwise {
                    body(*o, out);
                }
            }
            NodeKind::Each(each) => {
                any = true;
                body(each.body, out);
                if let Some(f) = each.fallback {
                    body(f, out);
                }
            }
            NodeKind::Key { body: b, .. } => {
                any = true;
                body(*b, out);
            }
            NodeKind::Await(a) => {
                any = true;
                for b in [a.pending(), a.then(), a.catch()].into_iter().flatten() {
                    body(b, out);
                }
            }
            NodeKind::Snippet(s) => {
                any = true;
                body(s.body, out);
            }
            NodeKind::Element(el) => {
                let own = body(el.children, out);
                any |= el.kind != compiler_syntax_tree::ElementKind::Regular;
                out[identifier] = own;
                any |= own;
                for a in compiler_syntax_tree.attributes(el.attributes) {
                    any |= attribute_is_dynamic(expressions, el, a, source_text);
                }
            }
        }
    }
    any
}

fn attribute_is_dynamic(
    expressions: &FxHashMap<NodeIdentifier, ExpressionMetadata>,
    el: &compiler_syntax_tree::Element,
    a: &compiler_syntax_tree::Attribute,
    source_text: &str,
) -> bool {
    let attribute = a.name.text(source_text);
    match &a.value {
        AttributeValue::Boolean => crate::semantic::template::cannot_be_set_statically(attribute),
        AttributeValue::Static(_) => {
            attribute == "value" && el.name.text(source_text) == "option"
                || crate::semantic::template::cannot_be_set_statically(attribute)
        }
        AttributeValue::Interpolated(parts) => {
            parts
                .iter()
                .any(|part| matches!(part, Part::Expression { .. }))
                || attribute == "value" && el.name.text(source_text) == "option"
                || crate::semantic::template::cannot_be_set_statically(attribute)
        }
        AttributeValue::Expression { .. }
        | AttributeValue::Shorthand(_)
        | AttributeValue::Bind(_)
        | AttributeValue::Attach(_)
        | AttributeValue::Class(_)
        | AttributeValue::Spread(_)
        | AttributeValue::On { .. }
        | AttributeValue::Use { .. }
        | AttributeValue::Transition { .. }
        | AttributeValue::Style { .. } => true,
        &AttributeValue::Animate { argument, .. } => argument.is_some_and(|expression| {
            expressions
                .get(&expression)
                .is_none_or(|metadata| metadata.has_reference)
        }),
        AttributeValue::Let(_) => false,
    }
}
