use oxc_ast::ast::{Program, Statement};
use oxc_semantic::Scoping;

/// Upstream's `Scope.declare` puts every import in the outermost scope, where the module script
/// sees the instance's: the compiled component hoists both to the top of the module.
pub(super) fn hoist(instance: &Program<'_>, scoping: &mut Scoping) {
    let Some(from) = instance.scope_id.get() else {
        return;
    };
    let root = scoping.root_scope_id();
    for statement in &instance.body {
        let Statement::ImportDeclaration(import) = statement else {
            continue;
        };
        for specifier in import.specifiers.iter().flatten() {
            let local = specifier.local();
            let Some(symbol) = local.symbol_id.get() else {
                continue;
            };
            // Upstream rejects a name that both scripts declare.
            if scoping.get_binding(root, local.name).is_some() {
                continue;
            }
            scoping.move_binding_by_symbol_id(from, root, symbol);
            let references: Vec<_> = scoping
                .root_unresolved_references()
                .get(&local.name)
                .map(|references| references.to_vec())
                .unwrap_or_default();
            for reference in references {
                scoping.get_reference_mut(reference).set_symbol_id(symbol);
                scoping.add_resolved_reference(symbol, reference);
                scoping.delete_root_unresolved_reference(local.name, reference);
            }
        }
    }
}
