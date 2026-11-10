use std::borrow::Cow;

use oxc_ast::AstKind;
use oxc_ast::ast::BindingPattern;
use oxc_semantic::ReferenceId;
use rustc_hash::FxHashSet;

use super::javascript::prop_alias;
use super::{BindingKind, Resolution};

/// The reads `rest.name` of a rest prop that upstream turns into `$$props.name`: a name the
/// pattern does not take out of the rest, read and not written.
pub(super) fn build(res: &Resolution, custom_element: bool) -> FxHashSet<ReferenceId> {
    let mut reads = FxHashSet::default();
    let scoping = res.scoping();
    let nodes = res.semantic().nodes();
    for symbol in scoping.symbol_ids() {
        if res.binding(symbol).kind != BindingKind::RestProperty {
            continue;
        }
        let mut keys: FxHashSet<Cow<'_, str>> =
            FxHashSet::from_iter(["$$slots", "$$events", "$$legacy"].map(Cow::Borrowed));
        if custom_element {
            keys.insert(Cow::Borrowed("$$host"));
        }
        if let AstKind::VariableDeclarator(declarator) = res.declaration(symbol)
            && let BindingPattern::ObjectPattern(pattern) = &declarator.id
        {
            keys.extend(pattern.properties.iter().map(|p| prop_alias(&p.key)));
        }
        for &reference in scoping.get_resolved_reference_ids(symbol) {
            let node = scoping.get_reference(reference).node_id();
            let member = nodes.parent_id(node);
            let AstKind::StaticMemberExpression(read) = nodes.kind(member) else {
                continue;
            };
            if keys.contains(read.property.name.as_str()) {
                continue;
            }
            if matches!(
                nodes.parent_kind(member),
                AstKind::AssignmentExpression(_) | AstKind::UpdateExpression(_)
            ) {
                continue;
            }
            reads.insert(reference);
        }
    }
    reads
}
