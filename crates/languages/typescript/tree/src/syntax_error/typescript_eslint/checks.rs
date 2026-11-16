//! The grammar errors that typescript-eslint throws from its own check of the tree, which tsc
//! reports from its checker and a host may let pass.

use oxc_ast::ast::{
    Function, PropertyDefinition, VariableDeclaration, VariableDeclarationKind, VariableDeclarator,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::{GetSpan, Span};
use oxc_syntax::scope::ScopeFlags;

use crate::{ProgramIdentifier, SyntaxError, Tree};

/// The codes of these checks, with typescript-eslint's words.
pub(crate) const CHECKS: [(u32, &str); 6] = [
    (1039, "Initializers are not permitted in ambient contexts."),
    (1221, "Generators are not allowed in an ambient context."),
    (
        1222,
        "A function signature cannot be declared as a generator.",
    ),
    (
        1263,
        "Declarations with initializers cannot also have definite assignment assertions.",
    ),
    (
        1264,
        "Declarations with definite assignment assertions must also have type annotations.",
    ),
    (1267, "Abstract property cannot have an initializer."),
];

/// Whether typescript-eslint checks the errors of `code` itself.
pub(crate) fn checks(code: u32) -> bool {
    CHECKS.iter().any(|(number, _)| *number == code)
}

/// What typescript-eslint throws for the first such error of `errors` in `programs` of `tree`, and
/// where: at the node it checks, where oxc points at the `!`, the `*` or the name.
pub fn typescript_eslint_check<'e>(
    tree: &Tree,
    errors: impl IntoIterator<Item = &'e SyntaxError>,
    programs: impl IntoIterator<Item = ProgramIdentifier>,
) -> Option<(&'static str, u32)> {
    let (error, message) = (errors.into_iter())
        .filter_map(|error| {
            let code = error.typescript_code?;
            let (_, message) = CHECKS.iter().find(|(number, _)| *number == code)?;
            Some((error, *message))
        })
        .min_by_key(|(error, _)| error.diagnostic.span.start_offset)?;
    let at = error.diagnostic.span.start_offset;
    let program = (programs
        .into_iter()
        .map(|program| tree.get_program(program)))
    .find(|program| program.span.start <= at && at < program.span.end)?;
    let mut node = Node {
        at,
        kind: match error.typescript_code {
            Some(1221 | 1222) => Kind::Function,
            Some(1267) => Kind::Initializer,
            Some(1039) => Kind::AmbientVariable,
            _ => Kind::Declarator,
        },
        start: None,
    };
    node.visit_program(program);
    Some((message, node.start?))
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Kind {
    /// A variable declarator or a class property.
    Declarator,
    Function,
    /// A class property's initializer.
    Initializer,
    /// A `declare let` or `var`, or one with a type, that has an initializer; not a property's.
    AmbientVariable,
}

/// The start of the innermost node of the kind an error is about that holds `at`.
struct Node {
    at: u32,
    kind: Kind,
    start: Option<u32>,
}

impl Node {
    const fn enter(&mut self, kind: Kind, holder: Span, start: u32) {
        if self.kind as u8 == kind as u8 && holder.start <= self.at && self.at < holder.end {
            self.start = Some(start);
        }
    }
}

impl<'a> Visit<'a> for Node {
    fn visit_variable_declaration(&mut self, it: &VariableDeclaration<'a>) {
        let kind = it.kind;
        for declarator in &it.declarations {
            let thrown = matches!(
                kind,
                VariableDeclarationKind::Let | VariableDeclarationKind::Var
            ) || declarator.type_annotation.is_some();
            if it.declare && thrown {
                self.enter(
                    Kind::AmbientVariable,
                    declarator.span,
                    declarator.span.start,
                );
            }
        }
        walk::walk_variable_declaration(self, it);
    }

    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        self.enter(Kind::Declarator, it.span, it.span.start);
        walk::walk_variable_declarator(self, it);
    }

    fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
        self.enter(Kind::Declarator, it.span, it.span.start);
        if let Some(value) = &it.value {
            self.enter(Kind::Initializer, it.span, value.span().start);
        }
        walk::walk_property_definition(self, it);
    }

    fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
        self.enter(Kind::Function, it.span, it.span.start);
        walk::walk_function(self, it, flags);
    }
}
