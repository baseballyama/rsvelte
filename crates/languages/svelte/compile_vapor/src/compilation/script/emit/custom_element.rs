use super::{BindingKind, NodeIdentifier, Resolution, SourceLocation, SyntaxTree};

pub(super) fn bindings(
    from: &SyntaxTree,
    resolution: &Resolution,
    to: &mut SyntaxTree,
    rewrite: &super::ScriptRewrite<'_>,
) -> NodeIdentifier {
    let mut properties = Vec::new();
    for (binding, info) in resolution.bindings.iter_enumerated() {
        if !matches!(
            info.kind,
            BindingKind::Property | BindingKind::BindableProperty
        ) {
            continue;
        }
        let declaration = resolution.sem.bindings[binding].node;
        let value = rewrite
            .binding_value(from, to, binding, declaration)
            .expect("a prop has a value");
        let get = to.arrow(&[], value, true, false, SourceLocation::SYNTHETIC);
        let key = to.identifier("get");
        let mut fields = vec![to.property(key, get, 0, SourceLocation::SYNTHETIC)];
        if super::super::prop_cell(resolution, from, binding) {
            let parameter = to.identifier("$$prop_value");
            let assignment = to.assign(
                rsvelte_typescript::operators::AssignmentOperator::Assign,
                value,
                parameter,
                SourceLocation::SYNTHETIC,
            );
            let set = to.arrow(
                &[parameter],
                assignment,
                true,
                false,
                SourceLocation::SYNTHETIC,
            );
            let key = to.identifier("set");
            fields.push(to.property(key, set, 0, SourceLocation::SYNTHETIC));
        }
        let descriptor = to.object(&fields, SourceLocation::SYNTHETIC);
        let key = to.write_string(from.name(info.prop_key.expect("a prop has a key")));
        properties.push(to.property(key, descriptor, 0, SourceLocation::SYNTHETIC));
    }
    let descriptors = to.object(&properties, SourceLocation::SYNTHETIC);
    let helper = to.identifier("$$custom_element_bind");
    let call = to.call0(helper, &[descriptors]);
    to.expression_statement(call)
}
