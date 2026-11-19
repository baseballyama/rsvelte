//! What `@typescript-eslint/no-unused-vars` adds to the core rule.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingIdentifier, BindingPattern, ExportDefaultDeclarationKind, FunctionType,
    ImportOrExportKind, Statement,
};
use oxc_semantic::{NodeId, SymbolId};
use rustc_hash::FxHashSet;

use super::{
    Facts, Use, function_definition, is_for_in_of_reference, is_read_for_itself, is_self_reference,
    rhs_node,
};

/// The names typescript-eslint marks as used before it looks at references: what TypeScript makes
/// a program declare (signature parameters, parameter properties, enum members, a mapped type's
/// key) and what an ambient context exports without an `export`.
pub(super) fn marked_used(f: &Facts<'_>) -> FxHashSet<SymbolId> {
    let mut marked: FxHashSet<SymbolId> = f
        .scoping
        .symbol_ids()
        .filter(|&s| matches!(f.kind(f.declaration(s)), AstKind::TSEnumMember(_)))
        .collect();
    let definition = is_definition_file(f);
    let mut mark = |identifier: &BindingIdentifier<'_>| {
        marked.extend(identifier.symbol_id.get());
        true
    };
    for node in f.nodes.iter() {
        match node.kind() {
            AstKind::FormalParameters(parameters)
                if f.parent(node.id())
                    .is_some_and(|owner| is_signature(f.kind(owner))) =>
            {
                for item in &parameters.items {
                    item.pattern.all_binding_identifiers(&mut mark);
                }
                if let Some(rest) = &parameters.rest {
                    rest.rest.argument.all_binding_identifiers(&mut mark);
                }
            }
            AstKind::FormalParameter(parameter) if parameter.has_modifier() => {
                if let BindingPattern::BindingIdentifier(identifier) = &parameter.pattern {
                    mark(identifier);
                }
            }
            AstKind::TSMappedType(mapped) => {
                mark(&mapped.key);
            }
            AstKind::Program(program) if definition && !has_overriding_export(&program.body) => {
                mark_ambient(&program.body, &mut mark);
            }
            AstKind::TSModuleBlock(block)
                if !has_overriding_export(&block.body)
                    && (definition || is_in_declared_module(f, node.id())) =>
            {
                mark_ambient(&block.body, &mut mark);
            }
            _ => {}
        }
    }
    marked
}

/// A node whose parameters only name a signature's inputs: typescript-eslint's
/// `visitFunctionTypeSignature`.
const fn is_signature(kind: AstKind<'_>) -> bool {
    match kind {
        AstKind::TSFunctionType(_)
        | AstKind::TSMethodSignature(_)
        | AstKind::TSCallSignatureDeclaration(_)
        | AstKind::TSConstructSignatureDeclaration(_)
        | AstKind::TSConstructorType(_) => true,
        AstKind::Function(function) => matches!(
            function.r#type,
            FunctionType::TSDeclareFunction | FunctionType::TSEmptyBodyFunctionExpression
        ),
        _ => false,
    }
}

fn is_definition_file(f: &Facts<'_>) -> bool {
    f.nodes.iter().next().is_some_and(|root| match root.kind() {
        AstKind::Program(program) => program.source_type.is_typescript_definition(),
        _ => false,
    })
}

/// Whether a module block is inside a module declared with `declare`, directly or through outer
/// modules.
fn is_in_declared_module(f: &Facts<'_>, block: NodeId) -> bool {
    f.nodes.ancestor_ids(block).any(|a| match f.kind(a) {
        AstKind::TSNamespaceDeclaration(module) => module.declare,
        AstKind::TSExternalModuleDeclaration(module) => module.declare,
        AstKind::TSGlobalDeclaration(module) => module.declare,
        _ => false,
    })
}

/// `hasOverridingExportStatement`: an export that lists names makes the other declarations of
/// an ambient context private.
fn has_overriding_export(body: &[Statement<'_>]) -> bool {
    body.iter().any(|statement| match statement {
        // `export { a }` and `export { a } from 'm'`: an `ExportNamedDeclaration` with no
        // declaration in ESTree.
        Statement::ExportNamedDeclaration(_)
        | Statement::ExportFromDeclaration(_)
        | Statement::ExportAllDeclaration(_)
        | Statement::TSExportAssignment(_) => true,
        Statement::ExportDefaultDeclaration(export) => {
            matches!(
                export.declaration,
                ExportDefaultDeclarationKind::Identifier(_)
            )
        }
        _ => false,
    })
}

/// `markDeclarationChildAsUsed` over the statements `ambientDeclarationSelector` matches.
fn mark_ambient<'a>(body: &[Statement<'a>], mark: &mut impl FnMut(&BindingIdentifier<'a>) -> bool) {
    for statement in body {
        match statement {
            Statement::TSInterfaceDeclaration(it) => {
                mark(&it.id);
            }
            Statement::TSTypeAliasDeclaration(it) => {
                mark(&it.id);
            }
            Statement::ClassDeclaration(it) => {
                if let Some(id) = &it.id {
                    mark(id);
                }
            }
            Statement::FunctionDeclaration(it) if it.r#type == FunctionType::TSDeclareFunction => {
                if let Some(id) = &it.id {
                    mark(id);
                }
            }
            Statement::TSEnumDeclaration(it) => {
                mark(&it.id);
            }
            Statement::TSNamespaceDeclaration(it) => {
                mark(&it.id);
            }
            Statement::VariableDeclaration(it) => {
                for declarator in &it.declarations {
                    declarator.id.all_binding_identifiers(&mut *mark);
                }
            }
            _ => {}
        }
    }
}

/// Every node that declares `symbol`, its redeclarations included, as typescript-eslint's
/// `variable.defs`.
pub(super) fn declarations(f: &Facts<'_>, symbol: SymbolId) -> Vec<NodeId> {
    let later = f.redeclared.get(&symbol).map_or(&[][..], Vec::as_slice);
    let mut nodes = vec![f.declaration(symbol)];
    nodes.extend(later.iter().filter_map(|&identifier| {
        let mut at = f.parent(identifier)?;
        while matches!(
            f.kind(at),
            AstKind::ArrayPattern(_)
                | AstKind::ObjectPattern(_)
                | AstKind::BindingProperty(_)
                | AstKind::BindingRestElement(_)
                | AstKind::AssignmentPattern(_)
        ) {
            at = f.parent(at)?;
        }
        Some(at)
    }));
    nodes
}

pub(super) const fn is_import(kind: AstKind<'_>) -> bool {
    matches!(
        kind,
        AstKind::ImportSpecifier(_)
            | AstKind::ImportDefaultSpecifier(_)
            | AstKind::ImportNamespaceSpecifier(_)
            | AstKind::TSImportEqualsDeclaration(_)
    )
}

/// `isTypeImport`: `import type { A }` or `import { type A }`.
fn is_type_import(f: &Facts<'_>, declaration: NodeId) -> bool {
    let declaration_kind = |node: NodeId| match f.kind(node) {
        AstKind::ImportDeclaration(import) => import.import_kind,
        AstKind::TSImportEqualsDeclaration(import) => import.import_kind,
        _ => ImportOrExportKind::Value,
    };
    match f.kind(declaration) {
        AstKind::ImportSpecifier(specifier) => {
            specifier.import_kind.is_type()
                || f.parent(declaration)
                    .is_some_and(|d| declaration_kind(d).is_type())
        }
        AstKind::ImportDefaultSpecifier(_) | AstKind::ImportNamespaceSpecifier(_) => f
            .parent(declaration)
            .is_some_and(|d| declaration_kind(d).is_type()),
        AstKind::TSImportEqualsDeclaration(_) => declaration_kind(declaration).is_type(),
        _ => false,
    }
}

/// `referenceContainsTypeQuery || referenceContainsTypePredicate`: the reference is the name, or
/// the left of a qualified name, that a `typeof` type or a type predicate reads.
pub(super) fn is_type_query_or_predicate(f: &Facts<'_>, reference: NodeId) -> bool {
    let mut at = reference;
    loop {
        match f.kind(at) {
            AstKind::TSTypeQuery(_) | AstKind::TSTypePredicate(_) => return true,
            AstKind::IdentifierReference(_) | AstKind::TSQualifiedName(_) => {
                let Some(parent) = f.parent(at) else {
                    return false;
                };
                at = parent;
            }
            _ => return false,
        }
    }
}

/// typescript-eslint's `isUsedVariable`: the core rule's, where a type reference reads its
/// symbol, a `typeof` or a type predicate does not (unless the name is a type import), and a
/// reference from inside the symbol's own type, namespace or enum declaration does not either.
pub(super) fn is_used_as_typescript_eslint(
    f: &Facts<'_>,
    symbol: SymbolId,
    declarations: &[NodeId],
    uses: &[Use],
) -> bool {
    if f.qualified.contains(&symbol) {
        return true;
    }
    let declaration = declarations[0];
    let own_class = matches!(f.kind(declaration), AstKind::Class(_)).then_some(declaration);
    let inside_class = |node: NodeId| {
        own_class.is_some_and(|class| f.nodes.ancestor_ids(node).any(|a| a == class))
    };
    let type_import = declarations.iter().all(|&d| is_type_import(f, d));
    let functions: Vec<NodeId> = declarations
        .iter()
        .filter_map(|&d| function_definition(f, d))
        .collect();
    let containers: Vec<NodeId> = declarations
        .iter()
        .copied()
        .filter(|&d| {
            matches!(
                f.kind(d),
                AstKind::TSInterfaceDeclaration(_)
                    | AstKind::TSTypeAliasDeclaration(_)
                    | AstKind::TSNamespaceDeclaration(_)
                    | AstKind::TSEnumDeclaration(_)
            )
        })
        .collect();
    let declaration_scope = f.scoping.symbol_scope_id(symbol);
    let mut rhs = None;
    uses.iter().filter(|u| !inside_class(u.node)).any(|u| {
        let for_itself = is_read_for_itself(f, u, rhs);
        rhs = rhs_node(f, u, rhs, declaration_scope);
        is_for_in_of_reference(f, u)
            || ((u.read || u.typed)
                && !for_itself
                && (type_import || !is_type_query_or_predicate(f, u.node))
                && !functions.iter().any(|&func| is_self_reference(f, u, func))
                && !containers.iter().any(|&c| f.inside(u.span, c)))
    })
}
