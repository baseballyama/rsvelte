use super::{
    BindingIdentifier, FxHashMap, Kind, NodeIdentifier, R, Resolution, SyntaxTree, copy, rune_call,
    runes, span, unsupported,
};

pub(super) fn check(
    tree: &SyntaxTree,
    program: NodeIdentifier,
    resolution: &Resolution,
    source_text: &str,
    exports: &mut FxHashMap<BindingIdentifier, String>,
) -> R<()> {
    let Kind::Program(statements) = tree.kind(program) else {
        unreachable!("a module program")
    };
    for &statement in statements {
        match tree.kind(statement) {
            Kind::Import { source, .. }
                if matches!(
                    tree.str_value(source, source_text),
                    "svelte" | "svelte/attachments"
                ) =>
            {
                return Err(unsupported(
                    "a Svelte runtime import in a module script",
                    span(tree, statement),
                ));
            }
            Kind::ExportNamed(declaration) => {
                if let Kind::VariableDeclaration { declarations, .. } = tree.kind(declaration) {
                    for &declaration in declarations {
                        if let Kind::Declarator {
                            identifier,
                            initializer: Some(value),
                            ..
                        } = tree.kind(declaration)
                            && rune_call(tree, value).is_some_and(|(name, _)| runes::value(name))
                        {
                            let (rune, _) = rune_call(tree, value).expect("a rune initializer");
                            if matches!(rune, "$derived" | "$derived.by") {
                                return Err(
                                    rsvelte_kernel::diagnostics::diagnostic::Diagnostic::error(
                                        "derived_invalid_export",
                                        "Derived state cannot be exported.",
                                        span(tree, declaration),
                                    ),
                                );
                            }
                            if !matches!(tree.kind(identifier), Kind::Identifier(_)) {
                                return Err(unsupported(
                                    "this exported state pattern",
                                    span(tree, declaration),
                                ));
                            }
                            let binding = resolution
                                .sem
                                .binding_of(identifier)
                                .expect("an exported declaration has a binding");
                            if resolution.sem.bindings[binding].writes > 0 {
                                return Err(
                                    rsvelte_kernel::diagnostics::diagnostic::Diagnostic::error(
                                        "state_invalid_export",
                                        "Exported state cannot be reassigned. \
                                         Export a function to read it instead.",
                                        span(tree, declaration),
                                    ),
                                );
                            }
                            exports.insert(binding, format!("$$module_export_{}", exports.len()));
                        }
                    }
                }
            }
            _ => {}
        }
    }
    Ok(())
}

pub(super) fn emit(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rewrite: &mut super::emit::ScriptRewrite<'_>,
    program: NodeIdentifier,
) -> NodeIdentifier {
    let Kind::Program(statements) = from.kind(program) else {
        unreachable!("a module script is a program");
    };
    let mut output = Vec::new();
    for &statement in statements {
        if let Kind::ExportNamed(declaration) = from.kind(statement)
            && let Kind::VariableDeclaration { kind, declarations } = from.kind(declaration)
        {
            for &declaration in declarations {
                let lowered = super::declarations::declarator(from, kind, declaration, rewrite, to)
                    .expect("a module export has a declaration");
                let Kind::Declarator { identifier, .. } = from.kind(declaration) else {
                    unreachable!("a declarator");
                };
                if let Some(storage) = rewrite.storage_name(identifier) {
                    output.push(lowered);
                    let storage = to.identifier(storage);
                    let value = to.dot(storage, "value");
                    let name = to.ident(from.name(identifier), from.source_location(identifier));
                    let declaration =
                        to.declarator(name, Some(value), from.source_location(declaration));
                    let declaration =
                        to.var_declaration(kind, &[declaration], from.source_location(statement));
                    output.push(to.export_named(declaration, from.source_location(statement)));
                } else {
                    output.push(to.export_named(lowered, from.source_location(statement)));
                }
            }
        } else {
            output.push(copy(from, to, rewrite, statement));
        }
    }
    to.program(&output, from.source_location(program))
}
