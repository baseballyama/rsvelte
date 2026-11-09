use rsvelte_kernel::index::TypedIndex;

use super::{Atom, Kind, NodeIdentifier, Span, SyntaxTree};
use crate::lexer::T;

#[cfg(test)]
mod tests;

impl SyntaxTree {
    /// The name a `type` alias or an `interface` declares (`X` in `type X = …` or `declare
    /// interface X {…}`); `None` for any other node, enums and namespaces among them.
    #[must_use]
    pub fn declared_type_name<'s>(
        &self,
        declaration: NodeIdentifier,
        source_text: &'s str,
    ) -> Option<&'s str> {
        let span = match self.kind(declaration) {
            Kind::TypeScriptInterface { name, .. } => {
                return Some(self.source_location(name).span()?.text(source_text));
            }
            Kind::TypeScriptDeclaration => self.source_location(declaration).span()?,
            _ => return None,
        };
        let first = self.tokens.after(span.start_offset)?;
        let mut tokens = self
            .tokens
            .since(first.index())
            .iter()
            .take_while(|t| t.span.end_offset <= span.end_offset);
        let mut keyword = tokens.next()?.span.text(source_text);
        if keyword == "declare" {
            keyword = tokens.next()?.span.text(source_text);
        }
        let name = tokens.next()?;
        (matches!(keyword, "type" | "interface") && name.kind == T::Identifier)
            .then(|| name.span.text(source_text))
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
