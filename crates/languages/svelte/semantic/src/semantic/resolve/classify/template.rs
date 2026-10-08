use rsvelte_kernel::source::index::IndexVector;
use rsvelte_svelte_compiler_syntax_tree::compiler_syntax_tree::{
    AttributeValue, CompilerSyntaxTree, NodeKind,
};
use rsvelte_typescript::scope::{BindingIdentifier, Semantic};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::super::{BindingInformation, BindingKind, for_each_pattern_identifier};

/// The kinds upstream's `create_scopes` gives the names the template declares.
pub(super) fn classify_template(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    compiler_syntax_tree: &CompilerSyntaxTree,
    out: &mut IndexVector<BindingIdentifier, BindingInformation>,
) {
    let mut set = |pattern: NodeIdentifier, kind: BindingKind, keep_function: bool| {
        for_each_pattern_identifier(syntax_tree, pattern, &mut |identifier| {
            if let Some(b) = sem.binding_of(identifier) {
                out[b].kind = kind;
                out[b].is_function &= keep_function;
            }
        });
    };
    for n in &compiler_syntax_tree.nodes {
        match &n.kind {
            NodeKind::Each(each) => {
                if let Some(context) = each.context() {
                    set(context, BindingKind::Each, false);
                }
                if let Some(index) = each.index() {
                    let kind = if each.keyed(syntax_tree) {
                        BindingKind::KeyedIndex
                    } else {
                        BindingKind::StaticIndex
                    };
                    set(index, kind, false);
                }
            }
            NodeKind::Await(a) => {
                for pattern in a.value().into_iter().chain(a.error()) {
                    set(pattern, BindingKind::Template, false);
                }
            }
            // The name's initial value is the block, which upstream's `is_function` does not count.
            NodeKind::Snippet(s) => {
                set(s.name, BindingKind::Normal, false);
                for &p in compiler_syntax_tree.javascript_list(s.parameters) {
                    set(p, BindingKind::Snippet, false);
                }
            }
            &NodeKind::Const { declaration } => {
                let Kind::VariableDeclaration { declarations, .. } = syntax_tree.kind(declaration)
                else {
                    unreachable!("a const tag holds a declaration")
                };
                for &d in declarations {
                    if let Kind::Declarator { identifier, .. } = syntax_tree.kind(d) {
                        set(identifier, BindingKind::Template, true);
                    }
                }
            }
            NodeKind::Element(el) => {
                for a in compiler_syntax_tree.attributes(el.attributes) {
                    if let AttributeValue::Let(Some(pattern)) = a.value {
                        set(pattern, BindingKind::Template, false);
                    }
                }
            }
            _ => {}
        }
    }
}
