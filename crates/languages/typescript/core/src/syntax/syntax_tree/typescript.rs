use super::{Atom, NodeIdentifier, Span};

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
