//! The names acorn declares twice where oxc follows TypeScript, which lets a type-only import
//! share a name with a value and a function have many declarations.

use oxc_ast::AstKind;
use oxc_semantic::SymbolFlags;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_tree::SyntaxError;

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
            let (mut lexical, mut var) = (false, false);
            for declaration in declarations {
                let binding = self.binding(declaration.flags, declaration.declaration);
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
                diagnostic: Diagnostic::error("parse_error", message, Span::new(at, at)),
                acorn_stops_at: None,
                typescript_code: None,
                redeclared_at: Some(at),
                typescript_eslint_at: None,
            }
        })
    }

    /// Whether the name declared again at `at` is in a scope a host opened, such as the scope of a
    /// template block, rather than one its JavaScript opens: acorn reads the parts apart, so it
    /// sees no name declared twice there.
    #[must_use]
    pub fn redeclares_in_host_scope(&self, at: u32) -> bool {
        let scoping = self.scoping();
        scoping.symbol_ids().any(|symbol| {
            scoping
                .symbol_redeclarations(symbol)
                .iter()
                .any(|declaration| declaration.span.start == at)
                && matches!(
                    self.nodes()
                        .kind(scoping.get_node_id(scoping.symbol_scope_id(symbol))),
                    AstKind::Program(_)
                )
        })
    }

    fn binding(&self, flags: SymbolFlags, declaration: oxc_semantic::NodeId) -> Binding {
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
            // Functions are vars at the top of a function body and lexical everywhere else in a
            // module, by where each is declared: a `var` hoists the symbol out of a block.
            let declared_in = self.nodes().get_node(declaration).scope_id();
            match self.nodes().kind(declaration) {
                AstKind::Function(function) if function.body.is_none() => Binding::None,
                _ if self.scoping().scope_flags(declared_in).is_function() => Binding::Var,
                _ => Binding::Lexical,
            }
        } else {
            Binding::None
        }
    }
}

#[cfg(test)]
mod tests;
