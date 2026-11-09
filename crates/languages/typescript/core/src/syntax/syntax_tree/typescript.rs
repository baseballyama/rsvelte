use super::{Atom, Kind, NodeIdentifier, SourceLocation, Span, SyntaxTree, Tag};

#[cfg(test)]
mod tests;

/// What a [`Kind::TypeScriptDeclaration`] declares, as the parser recorded it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TypeScriptDeclared {
    /// `type X = …` or `declare type X = …`, with the name `X`.
    TypeAlias(NodeIdentifier),
    /// `interface X …` that is not a [`Kind::TypeScriptInterface`], with the name `X`.
    Interface(NodeIdentifier),
    /// `export type { … }` or `export type * from …`, with the export that erasing types drops.
    TypeExport(NodeIdentifier),
    /// Anything else: `enum`, `namespace`, `declare const`, an overload signature, ….
    Other,
}

impl TypeScriptDeclared {
    const fn encode(self) -> (u8, u32) {
        match self {
            Self::TypeAlias(n) => (1, n.0),
            Self::Interface(n) => (2, n.0),
            Self::TypeExport(n) => (3, n.0),
            Self::Other => (0, 0),
        }
    }
}

impl SyntaxTree {
    pub fn typescript_declaration_of(
        &mut self,
        declared: TypeScriptDeclared,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let (flags, node) = declared.encode();
        self.push(
            Tag::TypeScriptDeclaration,
            flags,
            [node, 0],
            source_location,
        )
    }

    /// What `declaration` declares; `None` when it is not a [`Kind::TypeScriptDeclaration`].
    #[must_use]
    pub fn typescript_declared(&self, declaration: NodeIdentifier) -> Option<TypeScriptDeclared> {
        let i = declaration.index();
        if self.tags[i] != Tag::TypeScriptDeclaration {
            return None;
        }
        let node = NodeIdentifier(self.data[i][0]);
        Some(match self.flags[i] {
            1 => TypeScriptDeclared::TypeAlias(node),
            2 => TypeScriptDeclared::Interface(node),
            3 => TypeScriptDeclared::TypeExport(node),
            _ => TypeScriptDeclared::Other,
        })
    }

    /// The name a `type` alias or an `interface` declares (`X` in `type X = …` or `declare
    /// interface X {…}`); `None` for any other node, enums and namespaces among them.
    #[must_use]
    pub fn declared_type_name(&self, declaration: NodeIdentifier) -> Option<&str> {
        match self.kind(declaration) {
            Kind::TypeScriptInterface { name, .. } => Some(self.name(name)),
            Kind::TypeScriptDeclaration => match self.typescript_declared(declaration)? {
                TypeScriptDeclared::TypeAlias(name) | TypeScriptDeclared::Interface(name) => {
                    Some(self.name(name))
                }
                TypeScriptDeclared::TypeExport(_) | TypeScriptDeclared::Other => None,
            },
            _ => None,
        }
    }
}

/// One piece of erased TypeScript syntax, attached to the node it belongs to.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeScriptSyntax {
    pub node: NodeIdentifier,
    pub kind: TypeScriptKind,
    /// The type (after `:` / `as` / `satisfies`), the `<…>` list, or the `!` / `?` token.
    pub span: Span,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TypeScriptKind {
    /// `x: T` on a binding or parameter.
    Annotation,
    /// `(…): T` on a function or arrow.
    ReturnType,
    /// `<T>` on a function or arrow.
    TypeParameters,
    /// `e as T`, on `e`.
    As,
    /// `<T>e`, on `e`, including the angle brackets.
    Assertion,
    /// `e satisfies T`, on `e`.
    Satisfies,
    /// `e!`, on `e`.
    NonNull,
    /// `p?` on a parameter.
    Optional,
    /// `<T>` after a callee (`f<T>(…)`, `new C<T>(…)`), on the callee.
    TypeArgs,
}

/// An identifier in type syntax: a candidate reference whose binding scope analysis looks up.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeRef {
    pub name: Atom,
    pub span: Span,
}

/// A TypeScript construct that has a runtime value, so it is not type syntax to erase.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeScriptRuntime {
    pub feature: TypeScriptFeature,
    pub span: Span,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TypeScriptFeature {
    /// `enum`, `declare enum`: an enum declares an object even under `declare`'s spelling.
    Enum,
    /// `namespace N { … }` whose body holds a statement other than type declarations.
    NamespaceWithValues,
}
