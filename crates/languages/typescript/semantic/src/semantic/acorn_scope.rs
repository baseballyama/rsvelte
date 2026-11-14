//! The names acorn declares twice where oxc follows TypeScript, which lets a type-only import
//! share a name with a value and a function have many declarations.

use oxc_ast::AstKind;
use oxc_semantic::SymbolFlags;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::{Acorn, SyntaxError};

use super::Semantic;

/// How acorn's scope binds a declaration.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Binding {
    Lexical,
    Var,
    /// A type, an overload signature or an ambient declaration, which acorn binds as no value.
    None,
}

impl Semantic {
    /// acorn's error at the first name it declares twice that oxc lets TypeScript declare
    /// again, for a host whose compiler parses with acorn.
    #[must_use]
    pub fn acorn_redeclaration(&self) -> Option<SyntaxError> {
        let scoping = self.scoping();
        let mut first: Option<(u32, &str)> = None;
        for symbol in scoping.symbol_ids() {
            let declarations = scoping.symbol_redeclarations(symbol);
            if declarations.is_empty() {
                continue;
            }
            // Functions are vars at the top of a function body and lexical everywhere else in a
            // module.
            let in_function = scoping
                .scope_flags(scoping.symbol_scope_id(symbol))
                .is_function();
            let (mut lexical, mut var) = (false, false);
            for declaration in declarations {
                let binding = self.binding(declaration.flags, declaration.declaration, in_function);
                let twice = match binding {
                    Binding::Lexical => lexical || var,
                    Binding::Var => lexical,
                    Binding::None => false,
                };
                if twice {
                    let at = declaration.span.start;
                    if first.is_none_or(|(first, _)| at < first) {
                        first = Some((at, scoping.symbol_name(symbol)));
                    }
                    break;
                }
                lexical |= binding == Binding::Lexical;
                var |= binding == Binding::Var;
            }
        }
        first.map(|(at, name)| {
            let message = format!("Identifier '{name}' has already been declared");
            SyntaxError {
                diagnostic: Diagnostic::error("parse_error", message.clone(), Span::new(at, at)),
                acorn: Some(Acorn::Fails {
                    message: message.into(),
                    at,
                }),
                typescript_code: None,
            }
        })
    }

    fn binding(
        &self,
        flags: SymbolFlags,
        declaration: oxc_semantic::NodeId,
        in_function: bool,
    ) -> Binding {
        if flags.contains(SymbolFlags::Ambient) {
            Binding::None
        } else if flags.intersects(
            SymbolFlags::BlockScopedVariable
                | SymbolFlags::Class
                | SymbolFlags::Import
                | SymbolFlags::TypeImport,
        ) {
            Binding::Lexical
        } else if flags.contains(SymbolFlags::FunctionScopedVariable) {
            Binding::Var
        } else if flags.contains(SymbolFlags::Function) {
            match self.nodes().kind(declaration) {
                AstKind::Function(function) if function.body.is_none() => Binding::None,
                _ if in_function => Binding::Var,
                _ => Binding::Lexical,
            }
        } else {
            Binding::None
        }
    }
}

#[cfg(test)]
mod tests;
