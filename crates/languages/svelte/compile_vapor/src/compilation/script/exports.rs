use super::{
    BindingKind, Kind, NodeIdentifier, R, Resolution, SourceLocation, SyntaxTree, flag, span,
    unsupported,
};

pub(super) fn collect(
    tree: &SyntaxTree,
    declaration: NodeIdentifier,
    names: &mut Vec<NodeIdentifier>,
) -> R<()> {
    match tree.kind(declaration) {
        Kind::VariableDeclaration {
            kind: flag::CONST,
            declarations,
        } => {
            for &declaration in declarations {
                let Kind::Declarator { identifier, .. } = tree.kind(declaration) else {
                    unreachable!("a declarator")
                };
                rsvelte_svelte::semantic::resolve::for_each_pattern_identifier(
                    tree,
                    identifier,
                    &mut |name| names.push(name),
                );
            }
        }
        Kind::Function {
            name: Some(name),
            declaration: true,
            ..
        }
        | Kind::Class(rsvelte_typescript::syntax_tree::Class::Definition {
            name: Some(name),
            declaration: true,
            ..
        }) => names.push(name),
        _ => {
            return Err(unsupported(
                "this component export",
                span(tree, declaration),
            ));
        }
    }
    Ok(())
}

pub(super) fn expose(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    resolution: &Resolution,
    names: &[NodeIdentifier],
) -> NodeIdentifier {
    let mut fields = Vec::with_capacity(names.len());
    for &name in names {
        let key = to.ident(from.name(name), from.source_location(name));
        let mut value = key;
        if resolution.binding(name).is_some_and(|(_, binding)| {
            matches!(
                binding.kind,
                BindingKind::State
                    | BindingKind::RawState
                    | BindingKind::Derived
                    | BindingKind::DerivedBy
            )
        }) {
            value = to.dot(value, "value");
        }
        let result = to.return_(Some(value), SourceLocation::SYNTHETIC);
        let block = to.block(&[result], SourceLocation::SYNTHETIC);
        let getter = to.function(false, None, &[], block, false, SourceLocation::SYNTHETIC);
        fields.push(to.property(key, getter, flag::GETTER, SourceLocation::SYNTHETIC));
        let binding = resolution
            .sem
            .binding_of(name)
            .expect("an exported binding");
        if matches!(
            resolution.sem.bindings[binding].kind,
            rsvelte_typescript::scope::DeclarationKind::Function
                | rsvelte_typescript::scope::DeclarationKind::Let
        ) {
            let parameter = to.identifier("$$export_value");
            let assignment = to.assign(
                rsvelte_typescript::operators::AssignmentOperator::Assign,
                key,
                parameter,
                SourceLocation::SYNTHETIC,
            );
            let statement = to.expression_statement(assignment);
            let body = to.block(&[statement], SourceLocation::SYNTHETIC);
            let setter = to.function(
                false,
                None,
                &[parameter],
                body,
                false,
                SourceLocation::SYNTHETIC,
            );
            fields.push(to.property(key, setter, flag::SETTER, SourceLocation::SYNTHETIC));
        }
    }
    let value = to.object(&fields, SourceLocation::SYNTHETIC);
    let helper = to.identifier("defineExpose");
    let call = to.call0(helper, &[value]);
    to.expression_statement(call)
}
