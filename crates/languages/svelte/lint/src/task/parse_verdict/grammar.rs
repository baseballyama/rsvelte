use oxc_ast::ast::{
    Expression, ImportDeclaration, ImportPhase, NumericLiteral, PrivateFieldExpression,
    StringLiteral,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_tree::ProgramIdentifier;

/// The programs of `component`: `<script module>`, then `<script>`.
pub(super) fn programs(component: &Component) -> impl Iterator<Item = ProgramIdentifier> {
    component.scripts().map(|script| script.program)
}

/// What tsc's scanner rejects first in the scripts that oxc and Svelte's parser read, as
/// typescript-eslint throws it: a legacy octal number or escape, and a source phase import.
pub(super) fn scanner_rejection(component: &Component) -> Option<(String, u32)> {
    let tree = &component.javascript;
    let mut scanner = Scanner { first: None };
    for program in programs(component) {
        scanner.visit_program(tree.get_program(program));
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
            let at = local.span().start;
            self.reject("'=' expected.".to_owned(), at);
        }
        walk::walk_import_declaration(self, it);
    }
}

/// Where tsc's parser rejects a private name in an optional chain, which acorn and oxc accept.
pub(super) fn optional_private_name(component: &Component) -> Option<u32> {
    let tree = &component.javascript;
    let mut found = OptionalPrivateName { first: None };
    for program in programs(component) {
        let program = tree.get_program(program);
        let text = program.span.source_text(program.source_text);
        if text.contains("?.") && text.contains('#') {
            found.visit_program(program);
        }
    }
    found.first
}

struct OptionalPrivateName {
    first: Option<u32>,
}

impl<'a> Visit<'a> for OptionalPrivateName {
    fn visit_private_field_expression(&mut self, it: &PrivateFieldExpression<'a>) {
        if (it.optional || optional_chain(&it.object)) && self.first.is_none() {
            self.first = Some(it.field.span.start);
        }
        walk::walk_private_field_expression(self, it);
    }
}

/// Whether `expression` is a link of an optional chain after its `?.`.
fn optional_chain(expression: &Expression<'_>) -> bool {
    match expression {
        Expression::StaticMemberExpression(it) => it.optional || optional_chain(&it.object),
        Expression::ComputedMemberExpression(it) => it.optional || optional_chain(&it.object),
        Expression::PrivateFieldExpression(it) => it.optional || optional_chain(&it.object),
        Expression::CallExpression(it) => it.optional || optional_chain(&it.callee),
        Expression::TSNonNullExpression(it) => optional_chain(&it.expression),
        _ => false,
    }
}
