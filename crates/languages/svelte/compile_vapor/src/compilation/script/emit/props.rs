use super::{
    BindingKind, NodeIdentifier, Resolution, ScriptRewrite, SourceLocation, SyntaxTree, copy, flag,
};

/// `$$props.<key>` for a prop reference and `$$attrs` for rest props.
pub fn prop_member(
    resolution: &Resolution,
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    identifier: NodeIdentifier,
) -> Option<NodeIdentifier> {
    let (binding, info) = resolution.binding(identifier)?;
    if resolution.sem.bindings[binding].node == identifier {
        return None;
    }
    if info.kind == BindingKind::RestProperty {
        return Some(to.ident("$$attrs", from.source_location(identifier)));
    }
    if super::super::prop_cell(resolution, from, binding) {
        return Some(to.ident(from.name(identifier), from.source_location(identifier)));
    }
    if info.kind != BindingKind::Property {
        return None;
    }
    let key = from.name(info.prop_key?);
    let object = to.identifier("$$props");
    let property = to.ident(key, SourceLocation::SYNTHETIC);
    Some(to.member(
        object,
        property,
        false,
        false,
        from.source_location(identifier),
    ))
}

pub(super) fn prop_declarations(
    javascript: &SyntaxTree,
    resolution: &Resolution,
    to: &mut SyntaxTree,
    server: bool,
    body: &mut Vec<NodeIdentifier>,
    rewriter: &mut ScriptRewrite<'_>,
) {
    for (binding, info) in resolution.bindings.iter_enumerated() {
        if !super::super::prop_cell(resolution, javascript, binding) {
            continue;
        }
        let declaration = resolution.sem.bindings[binding].node;
        let fallback = if let Some(argument) = info.initial {
            copy(javascript, to, rewriter, argument)
        } else {
            to.identifier("undefined")
        };
        let fallback = to.arrow(&[], fallback, true, false, SourceLocation::SYNTHETIC);
        let props = to.identifier("$$props");
        let key = to.write_string(javascript.name(info.prop_key.expect("a prop has a key")));
        let server = to.write_boolean(server, SourceLocation::SYNTHETIC);
        let callee = to.identifier("$$prop_cell");
        let bindable = to.write_boolean(
            info.kind == BindingKind::BindableProperty,
            SourceLocation::SYNTHETIC,
        );
        let value = to.call0(callee, &[props, key, fallback, server, bindable]);
        let name = to.identifier(javascript.name(declaration));
        body.push(to.let_(flag::CONST, name, Some(value)));
    }
}
