use oxc_ast::ast::{
    Function, ImportDeclaration, ImportPhase, NumericLiteral, PropertyDefinition, StringLiteral,
    VariableDeclarator,
};
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

/// What tsc's scanner rejects first in the scripts that oxc and Svelte's parser read, as
/// typescript-eslint throws it: a legacy octal number or escape, and a source phase import.
pub(super) fn scanner_rejection(component: &Component) -> Option<(String, u32)> {
    let tree = &component.javascript;
    let mut scanner = Scanner { first: None };
    for script in component.module.iter().chain(&component.instance) {
        scanner.visit_program(tree.get_program(script.program));
    }
    scanner.first
}

struct Scanner {
    first: Option<(String, u32)>,
}

impl Scanner {
    fn reject(&mut self, message: String, at: u32) {
        if self.first.as_ref().is_none_or(|(_, first)| at < *first) {
            self.first = Some((message, at));
        }
    }
}

impl<'a> Visit<'a> for Scanner {
    fn visit_numeric_literal(&mut self, it: &NumericLiteral<'a>) {
        let Some(raw) = it.raw else { return };
        let digits = raw.as_bytes();
        if digits.len() < 2 || digits[0] != b'0' || !digits[1].is_ascii_digit() {
            return;
        }
        if digits.iter().all(|digit| (b'0'..=b'7').contains(digit)) {
            let message = format!(
                "Octal literals are not allowed. Use the syntax '0o{}'.",
                &raw[1..]
            );
            self.reject(message, it.span.start);
        } else {
            let message = "Decimals with leading zeros are not allowed.".to_owned();
            self.reject(message, it.span.start);
        }
    }

    fn visit_string_literal(&mut self, it: &StringLiteral<'a>) {
        let Some(raw) = it.raw else { return };
        let bytes = raw.as_bytes();
        let mut index = 0;
        while index < bytes.len() {
            if bytes[index] != b'\\' {
                index += 1;
                continue;
            }
            let at = it.span.start + index as u32;
            let escape = &bytes[index + 1..];
            match escape.first() {
                Some(b'0') if !escape.get(1).is_some_and(u8::is_ascii_digit) => {}
                Some(&first @ b'0'..=b'7') => {
                    // A legacy octal escape takes three digits from `\0`-`\3`, two otherwise.
                    let most = if first <= b'3' { 3 } else { 2 };
                    let len = (escape.iter().take(most))
                        .take_while(|digit| (b'0'..=b'7').contains(*digit))
                        .count();
                    let value = (escape[..len].iter())
                        .fold(0_u32, |value, digit| value * 8 + u32::from(digit - b'0'));
                    let message = format!(
                        "Octal escape sequences are not allowed. Use the syntax '\\x{value:02x}'."
                    );
                    return self.reject(message, at);
                }
                Some(&digit @ (b'8' | b'9')) => {
                    let message =
                        format!("Escape sequence '\\{}' is not allowed.", char::from(digit));
                    return self.reject(message, at);
                }
                _ => {}
            }
            index += 2;
        }
    }

    fn visit_import_declaration(&mut self, it: &ImportDeclaration<'a>) {
        // TypeScript reads `import source x` as an import of `source`, followed by `x`.
        if it.phase == Some(ImportPhase::Source)
            && let Some(local) = (it.specifiers.iter().flatten()).next()
        {
            let at = oxc_span::GetSpan::span(local).start;
            self.reject("'=' expected.".to_owned(), at);
        }
        walk::walk_import_declaration(self, it);
    }
}
