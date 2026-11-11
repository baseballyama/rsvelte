//! Upstream's `binding_groups`: the `bind:group`s that write the same target share one group,
//! and the `{#each}` blocks their target reads pass their index to it.

use oxc_ast::ast::{
    ComputedMemberExpression, Expression, IdentifierName, IdentifierReference, NumericLiteral,
    StringLiteral, ThisExpression,
};
use oxc_ast_visit::Visit;
use oxc_semantic::SymbolId;
use rsvelte_svelte_semantic::resolve::Resolution;
use rsvelte_typescript_tree::{ExpressionIdentifier, Tree};

use super::{
    AttributeValue, CompilerNodeIdentifier, CompilerSyntaxTree, FxHashMap, FxHashSet, NodeKind,
    names,
};

#[derive(Default)]
pub(super) struct BindingGroups {
    /// The groups in the order upstream meets them, each declared as `[]` in the component.
    pub names: Vec<String>,
    /// Each `bind:group`, by the start of its attribute: its group, and the `{#each}` blocks
    /// whose index it passes, innermost first.
    pub of: FxHashMap<u32, (usize, Vec<CompilerNodeIdentifier>)>,
    /// The `{#each}` blocks that pass their index to a group.
    pub each: FxHashSet<CompilerNodeIdentifier>,
}

/// Upstream's `BindDirective` analysis of every `bind:group`, in document order.
pub(super) fn binding_groups(
    tree: &CompilerSyntaxTree,
    javascript: &Tree,
    source_text: &str,
    res: &Resolution,
    names: &mut names::Names,
) -> BindingGroups {
    let mut groups = BindingGroups::default();
    // The key upstream matches a group by: the target's key path and the bindings it reads.
    let mut keys: Vec<(String, Vec<Option<SymbolId>>)> = Vec::new();
    for (identifier, node) in tree.nodes.iter_enumerated() {
        let NodeKind::Element(el) = &node.kind else {
            continue;
        };
        for a in tree.attributes(el.attributes) {
            let AttributeValue::Bind(target) = a.value else {
                continue;
            };
            if a.name.text(source_text) != "group" {
                continue;
            }
            let (keypath, ids) = identifiers(javascript, res, target);
            let bindings: Vec<_> = ids.iter().map(|&(_, symbol)| symbol).collect();
            let group =
                if let Some(group) = keys.iter().position(|k| k.0 == keypath && k.1 == bindings) {
                    group
                } else {
                    keys.push((keypath, bindings));
                    groups.names.push(names.unique("binding_group"));
                    keys.len() - 1
                };
            let blocks = each_blocks(tree, javascript, res, identifier, ids);
            groups.each.extend(blocks.iter().copied());
            groups.of.insert(a.span.start_offset, (group, blocks));
        }
    }
    groups
}

/// Walks up from the element: an `{#each}` that declares a name the target reads passes its
/// index, and the names its collection reads are looked for further up.
fn each_blocks<'t>(
    tree: &CompilerSyntaxTree,
    javascript: &'t Tree,
    res: &Resolution,
    element: CompilerNodeIdentifier,
    mut ids: Vec<(&'t str, Option<SymbolId>)>,
) -> Vec<CompilerNodeIdentifier> {
    let mut blocks = Vec::new();
    let mut at = tree.node(element).parent;
    while let Some(identifier) = at {
        if let NodeKind::Each(each) = &tree.node(identifier).kind {
            let declared = [each.context, each.index]
                .into_iter()
                .flatten()
                .filter_map(|p| javascript.get_pattern(p).pattern.get_binding_identifier())
                .map(|b| b.name.as_str())
                .collect::<Vec<_>>();
            let before = ids.len();
            ids.retain(|(name, _)| !declared.contains(name));
            if ids.len() != before {
                blocks.push(identifier);
                ids.extend(identifiers(javascript, res, each.collection).1);
            }
        }
        at = tree.node(identifier).parent;
    }
    blocks
}

/// Upstream `extract_all_identifiers_from_expression`: the key path of every name, member key
/// and literal, and the names that are not a member's static key.
fn identifiers<'t>(
    javascript: &'t Tree,
    res: &Resolution,
    e: ExpressionIdentifier,
) -> (String, Vec<(&'t str, Option<SymbolId>)>) {
    struct Collect<'r, 't> {
        res: &'r Resolution,
        keypath: Vec<String>,
        ids: Vec<(&'t str, Option<SymbolId>)>,
    }
    impl<'t> Visit<'t> for Collect<'_, 't> {
        fn visit_identifier_reference(&mut self, it: &IdentifierReference<'t>) {
            self.keypath.push(it.name.to_string());
            self.ids.push((it.name.as_str(), self.res.symbol(it)));
        }

        fn visit_identifier_name(&mut self, it: &IdentifierName<'t>) {
            self.keypath.push(it.name.to_string());
        }

        fn visit_string_literal(&mut self, it: &StringLiteral<'t>) {
            // A lone surrogate keeps its escape, which still tells it apart.
            let quoted = it
                .value
                .as_str()
                .map_or_else(|| format!("{:?}", it.value), |value| format!("\"{value}\""));
            self.keypath.push(quoted);
        }

        fn visit_numeric_literal(&mut self, it: &NumericLiteral<'t>) {
            self.keypath.push(it.value.to_string());
        }

        fn visit_this_expression(&mut self, _: &ThisExpression) {
            self.keypath.push("this".to_owned());
        }

        // A computed key that is a name or a literal is written in brackets.
        fn visit_computed_member_expression(&mut self, it: &ComputedMemberExpression<'t>) {
            self.visit_expression(&it.object);
            let at = self.keypath.len();
            self.visit_expression(&it.expression);
            if matches!(
                it.expression,
                Expression::Identifier(_)
                    | Expression::StringLiteral(_)
                    | Expression::NumericLiteral(_)
            ) && let Some(key) = self.keypath.get_mut(at)
            {
                *key = format!("[{key}]");
            }
        }
    }
    let mut collect = Collect {
        res,
        keypath: Vec::new(),
        ids: Vec::new(),
    };
    collect.visit_expression(javascript.get_expression(e));
    (collect.keypath.join("."), collect.ids)
}
