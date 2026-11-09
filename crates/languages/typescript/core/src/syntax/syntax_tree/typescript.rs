use super::{Atom, NodeIdentifier, SourceLocation, Span, SyntaxTree, Tag};

#[cfg(test)]
mod tests;

impl SyntaxTree {
    /// `export type { … }` or `export type * from …`: erased, but keeping the export it drops.
    pub fn type_only_export(
        &mut self,
        export: NodeIdentifier,
        source_location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        self.push(
            Tag::TypeScriptDeclaration,
            TYPE_ONLY_EXPORT,
            [export.0, 0],
            source_location,
        )
    }

    /// What a [`Tag::TypeScriptDeclaration`] declares: a [`super::Type`] declaration, or the
    /// value node (a variable declaration, a class, a function without a body) that `declare` or
    /// an overload erases. `None` for any other node, and in a tree built by compilation.
    #[must_use]
    pub fn declaration(&self, statement: NodeIdentifier) -> Option<NodeIdentifier> {
        let i = statement.index();
        (self.tags[i] == Tag::TypeScriptDeclaration && self.flags[i] != TYPE_ONLY_EXPORT)
            .then(|| NodeIdentifier(self.data[i][0]).opt())
            .flatten()
    }

    /// The export a [`Self::type_only_export`] declaration drops.
    #[must_use]
    pub fn exported_types(&self, declaration: NodeIdentifier) -> Option<NodeIdentifier> {
        let i = declaration.index();
        (self.tags[i] == Tag::TypeScriptDeclaration && self.flags[i] == TYPE_ONLY_EXPORT)
            .then(|| NodeIdentifier(self.data[i][0]))
    }
}

/// The flag of a [`Tag::TypeScriptDeclaration`] that holds a type-only export.
const TYPE_ONLY_EXPORT: u8 = 1;

/// One piece of erased TypeScript syntax, attached to the node it belongs to.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeScriptSyntax {
    pub node: NodeIdentifier,
    pub kind: TypeScriptKind,
    /// The type (after `:` / `as` / `satisfies`), the `<…>` list, or the `!` / `?` token.
    pub span: Span,
    /// The node that holds the syntax: the [`super::Type`], or for a
    /// [`TypeScriptKind::Decorator`] its expression; `NONE` for a token.
    pub syntax: NodeIdentifier,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TypeScriptKind {
    /// `x: T` on a binding or parameter.
    Annotation,
    /// `(…): T` on a function or arrow.
    ReturnType,
    /// `<T>` on a function, an arrow or a class.
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
    /// `<T>` after an expression (`f<T>(…)`, `new C<T>(…)`, `f<T>`, `extends C<T>`), on it.
    TypeArgs,
    /// `x!: T` on a binding or a class field.
    Definite,
    /// `implements A, B` on a class.
    Implements,
    /// A class member that erasing types removes (a member without a body, an `abstract` or
    /// `declare` field, an index signature), on its class: the member's own node.
    Member,
    /// `@expression` before a class, a member or a parameter, on it.
    Decorator,
    /// `public`, `private`, `protected`, `readonly` or `override` before a constructor
    /// parameter, on it.
    ParameterProperty,
}

/// An identifier in type syntax: a candidate reference whose binding scope analysis looks up.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeRef {
    pub name: Atom,
    pub span: Span,
}

/// The name a TypeScript declaration statement declares (`h` in `type h = …`).
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct TypeDeclaration {
    pub name: Atom,
    pub kind: TypeDeclarationKind,
    /// Where the statement starts: the start of its [`super::Tag::TypeScriptDeclaration`] node.
    pub start_offset: u32,
    /// Declared in the body of a namespace, `declare module` or `declare global`, which keeps
    /// it in a scope of its own.
    pub nested: bool,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TypeDeclarationKind {
    /// `type X = …`.
    Alias,
    Interface,
    Enum,
    /// `namespace N { … }` or `module N { … }`.
    Namespace,
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
    /// `@decorator`.
    Decorator,
    /// `accessor field`.
    Accessor,
    /// `constructor(private a)`: a parameter that also declares a field.
    ParameterProperty,
    /// `import a = require("m")` or `import a = N.b`.
    ImportEquals,
    /// `export = value`.
    ExportAssignment,
}
