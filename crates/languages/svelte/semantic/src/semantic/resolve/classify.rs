use rsvelte_kernel::source::index::IndexVector;
use rsvelte_svelte_compiler_syntax_tree::compiler_syntax_tree::{CompilerSyntaxTree, NodeKind};
use rsvelte_typescript::scope::{BindingIdentifier, DeclarationKind, Semantic};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use super::{BindingInformation, BindingKind, rune_call};

mod props;
mod template;

pub(super) fn classify(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    program: NodeIdentifier,
    module: Option<NodeIdentifier>,
    compiler_syntax_tree: &CompilerSyntaxTree,
) -> IndexVector<BindingIdentifier, BindingInformation> {
    let mut out: IndexVector<BindingIdentifier, BindingInformation> = sem
        .bindings
        .iter()
        .map(|b| BindingInformation {
            kind: BindingKind::Normal,
            // Upstream `Binding.is_function`: never updated, and initialised with a function.
            is_function: b.writes == 0
                && b.mutations == 0
                && (b.kind == DeclarationKind::Function
                    || b.initializer(syntax_tree).is_some_and(|i| {
                        matches!(
                            syntax_tree.kind(i),
                            Kind::Function { .. } | Kind::Arrow { .. }
                        )
                    })),
            initial: None,
            prop_key: None,
        })
        .collect();
    let mut pending = vec![program];
    pending.extend(module);
    pending.extend(compiler_syntax_tree.nodes.iter().filter_map(|node| {
        if let NodeKind::Declaration { declaration } = node.kind {
            Some(declaration)
        } else {
            None
        }
    }));
    while let Some(node) = pending.pop() {
        if matches!(syntax_tree.kind(node), Kind::VariableDeclaration { .. }) {
            classify_declaration(syntax_tree, sem, node, &mut out);
        }
        syntax_tree.for_each_child(node, |child| pending.push(child));
    }
    template::classify_template(syntax_tree, sem, compiler_syntax_tree, &mut out);
    out
}

fn classify_declaration(
    syntax_tree: &SyntaxTree,
    sem: &Semantic,
    statement: NodeIdentifier,
    out: &mut IndexVector<BindingIdentifier, BindingInformation>,
) {
    let statement = match syntax_tree.kind(statement) {
        Kind::ExportNamed(declaration) => declaration,
        _ => statement,
    };
    let Kind::VariableDeclaration { declarations, .. } = syntax_tree.kind(statement) else {
        return;
    };
    for &d in declarations {
        let Kind::Declarator {
            identifier,
            initializer: Some(initializer),
        } = syntax_tree.kind(d)
        else {
            continue;
        };
        let Some((rune, arg)) = rune_call(syntax_tree, initializer) else {
            continue;
        };
        match rune {
            "$state" | "$state.raw" | "$derived" | "$derived.by" => {
                let kind = match rune {
                    "$state" => BindingKind::State,
                    "$state.raw" => BindingKind::RawState,
                    "$derived" => BindingKind::Derived,
                    _ => BindingKind::DerivedBy,
                };
                super::for_each_pattern_identifier(syntax_tree, identifier, &mut |identifier| {
                    if let Some(b) = sem.binding_of(identifier) {
                        out[b].kind = kind;
                        out[b].initial = arg;
                        out[b].is_function = false;
                    }
                });
            }
            "$props" => props::classify_props(syntax_tree, sem, identifier, out),
            _ => {}
        }
    }
}
