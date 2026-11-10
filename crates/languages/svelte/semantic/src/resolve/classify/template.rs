use rsvelte_typescript_semantic::semantic::Semantic;

use super::super::{BindingInformation, BindingKind, TemplateNames};
use super::for_each_binding;
use crate::compiler_syntax_tree::{CompilerSyntaxTree, NodeKind};

/// The kinds upstream's `create_scopes` gives the names the template declares.
pub(super) fn classify_template(
    semantic: &Semantic,
    compiler_syntax_tree: &CompilerSyntaxTree,
    names: &TemplateNames,
    out: &mut [BindingInformation<'_>],
) {
    let tree = semantic.tree();
    let mut set = |symbol: oxc_semantic::SymbolId, kind: BindingKind, keep_function: bool| {
        let info = &mut out[symbol.index()];
        info.kind = kind;
        info.is_function &= keep_function;
    };
    for (identifier, n) in compiler_syntax_tree.nodes.iter_enumerated() {
        match &n.kind {
            NodeKind::Each(each) => {
                if let Some(context) = each.context {
                    for_each_binding(&tree.get_pattern(context).pattern, &mut |s| {
                        set(s, BindingKind::Each, false);
                    });
                }
                if let Some(index) = each.index {
                    let kind = if each.keyed(tree) {
                        BindingKind::KeyedIndex
                    } else {
                        BindingKind::StaticIndex
                    };
                    for_each_binding(&tree.get_pattern(index).pattern, &mut |s| {
                        set(s, kind, false);
                    });
                }
            }
            NodeKind::Await(a) => {
                for pattern in a.value.into_iter().chain(a.error) {
                    for_each_binding(&tree.get_pattern(pattern).pattern, &mut |s| {
                        set(s, BindingKind::Template, false);
                    });
                }
            }
            // The name's initial value is the block, which upstream's `is_function` does not count.
            NodeKind::Snippet(s) => {
                if let Some(&symbol) = names.snippets.get(&identifier) {
                    set(symbol, BindingKind::Normal, false);
                }
                if let Some(parameters) = s.parameters {
                    let parameters = tree.get_parameters(parameters);
                    for parameter in &parameters.items {
                        for_each_binding(&parameter.pattern, &mut |s| {
                            set(s, BindingKind::Snippet, false);
                        });
                    }
                    if let Some(rest) = &parameters.rest {
                        for_each_binding(&rest.rest.argument, &mut |s| {
                            set(s, BindingKind::Snippet, false);
                        });
                    }
                }
            }
            &NodeKind::Const { declaration } => {
                for declarator in &tree.get_declaration(declaration).declarations {
                    for_each_binding(&declarator.id, &mut |s| {
                        set(s, BindingKind::Template, true);
                    });
                }
            }
            NodeKind::Element(el) => {
                for attribute in el.attributes.iter() {
                    for &symbol in names.lets.get(&attribute).into_iter().flatten() {
                        set(symbol, BindingKind::Template, false);
                    }
                }
            }
            _ => {}
        }
    }
}
