use super::{Kind, NodeIdentifier, SyntaxTree, copy, flag, rune_call};

/// One declarator as its own statement: a rune as Vue's reactivity, `$props()` as nothing (its
/// keys are in `defineProps`), anything else copied.
pub(super) fn declarator(
    javascript: &SyntaxTree,
    kind: u8,
    d: NodeIdentifier,
    rewriter: &mut super::emit::ScriptRewrite<'_>,
    to: &mut SyntaxTree,
) -> Option<NodeIdentifier> {
    let Kind::Declarator {
        identifier,
        initializer,
    } = javascript.kind(d)
    else {
        unreachable!("a declarator")
    };
    let rune = initializer
        .and_then(|i| rune_call(javascript, i))
        .filter(|(name, _)| {
            matches!(
                *name,
                "$props" | "$state" | "$state.raw" | "$derived" | "$derived.by"
            )
        });
    let Some((rune, arg)) = rune else {
        let target = copy(javascript, to, rewriter, identifier);
        let value = initializer.map(|i| copy(javascript, to, rewriter, i));
        let declaration = to.declarator(target, value, javascript.source_location(d));
        return Some(to.var_declaration(kind, &[declaration], javascript.source_location(d)));
    };
    let tracking = rewriter.tracking;
    let value = super::emit::rune_value(javascript, to, rewriter, rune, arg, tracking)?;
    if !matches!(javascript.kind(identifier), Kind::Identifier(_)) {
        return Some(super::patterns::declaration(
            javascript, to, rewriter, identifier, value, rune, tracking,
        ));
    }
    let name = if let Some(storage) = rewriter.storage_name(identifier) {
        to.identifier(storage)
    } else {
        to.ident(
            javascript.name(identifier),
            javascript.source_location(identifier),
        )
    };
    Some(to.let_(flag::CONST, name, Some(value)))
}

pub(super) fn statement(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rewrite: &mut super::emit::ScriptRewrite<'_>,
    identifier: NodeIdentifier,
) -> NodeIdentifier {
    let Kind::VariableDeclaration { kind, declarations } = from.kind(identifier) else {
        unreachable!("a declaration statement")
    };
    let mut output = Vec::new();
    for &declaration in declarations {
        let Some(statement) = declarator(from, kind, declaration, rewrite, to) else {
            continue;
        };
        let Kind::VariableDeclaration { declarations, .. } = to.kind(statement) else {
            unreachable!("a translated declaration")
        };
        output.extend_from_slice(declarations);
    }
    to.var_declaration(kind, &output, from.source_location(identifier))
}
