use oxc_ast::ast::{Function, PropertyDefinition, VariableDeclarator};
use oxc_ast_visit::{Visit, walk};
use oxc_span::Span;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_svelte_syntax::syntax_tree::Component;

/// The grammar errors Svelte's parser lets pass that typescript-eslint throws, with its words.
const THROWN: [(u32, &str); 4] = [
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
];

/// What typescript-eslint throws for the first such error in a script, and where: at the
/// declaration it checks, where oxc points at the `!` or the `*`.
pub(super) fn rejection(component: &Component) -> Option<(&'static str, u32)> {
    let tree = &component.javascript;
    let (error, message) = (tree.unchecked_errors().iter())
        .filter_map(|error| {
            let code = error.typescript_code?;
            let (_, message) = THROWN.iter().find(|(number, _)| *number == code)?;
            Some((error, *message))
        })
        .min_by_key(|(error, _)| error.diagnostic.span.start_offset)?;
    let at = error.diagnostic.span.start_offset;
    let script = (component.module.iter().chain(&component.instance))
        .find(|script| script.content.start_offset <= at && at < script.content.end_offset)?;
    let mut declaration = Declaration {
        at,
        function: matches!(error.typescript_code, Some(1221 | 1222)),
        start: None,
    };
    declaration.visit_program(tree.get_program(script.program));
    Some((message, declaration.start?))
}

/// The start of the innermost declaration of the kind an error is about that holds `at`.
struct Declaration {
    at: u32,
    function: bool,
    start: Option<u32>,
}

impl Declaration {
    const fn enter(&mut self, span: Span) {
        if span.start <= self.at && self.at < span.end {
            self.start = Some(span.start);
        }
    }
}

impl<'a> Visit<'a> for Declaration {
    fn visit_variable_declarator(&mut self, it: &VariableDeclarator<'a>) {
        if !self.function {
            self.enter(it.span);
        }
        walk::walk_variable_declarator(self, it);
    }

    fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
        if !self.function {
            self.enter(it.span);
        }
        walk::walk_property_definition(self, it);
    }

    fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
        if self.function {
            self.enter(it.span);
        }
        walk::walk_function(self, it, flags);
    }
}
