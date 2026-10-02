//! JavaScript compared as a syntax tree, with the meaning of `tools/fixtures/src/canonical.ts`:
//! positions, comments and the spelling of literals are ignored; `@__PURE__` marks on calls are
//! not.

use oxc_allocator::Allocator;
use oxc_ast::ast::{ArrowFunctionExpression, Function, Program};
use oxc_ast_visit::{VisitMut, walk_mut};
use oxc_parser::{ParseOptions, Parser};
use oxc_span::{ContentEq, SourceType};
use oxc_syntax::scope::ScopeFlags;

/// Whether the two texts parse to the same tree. `Err` names the side that does not parse.
pub(crate) fn same_tree(expected: &str, actual: &str) -> Result<bool, String> {
    let allocator = Allocator::default();
    let mut expected = parse(&allocator, expected).map_err(|e| format!("expected: {e}"))?;
    let mut actual = parse(&allocator, actual).map_err(|e| format!("actual: {e}"))?;
    Canonical.visit_program(&mut expected);
    Canonical.visit_program(&mut actual);
    Ok(expected.content_eq(&actual))
}

/// Clears what `ContentEq` compares but the canonical tree (`ESTree`) does not have.
struct Canonical;

impl<'a> VisitMut<'a> for Canonical {
    fn visit_function(&mut self, it: &mut Function<'a>, flags: ScopeFlags) {
        it.pure = false;
        it.pife = false;
        walk_mut::walk_function(self, it, flags);
    }

    fn visit_arrow_function_expression(&mut self, it: &mut ArrowFunctionExpression<'a>) {
        it.pure = false;
        it.pife = false;
        walk_mut::walk_arrow_function_expression(self, it);
    }
}

fn parse<'a>(allocator: &'a Allocator, text: &'a str) -> Result<Program<'a>, String> {
    let options = ParseOptions {
        // acorn, which made the canonical tree, has no node for parentheses.
        preserve_parens: false,
        ..ParseOptions::default()
    };
    let parsed = Parser::new(allocator, text, SourceType::mjs())
        .with_options(options)
        .parse();
    match parsed.diagnostics.first() {
        Some(d) => Err(d.to_string()),
        None if parsed.fatal_error => Err("the parser stopped".to_owned()),
        None => Ok(parsed.program),
    }
}

#[cfg(test)]
mod tests {
    use super::same_tree;

    #[test]
    fn layout_comments_and_literal_spelling_are_ignored() {
        let expected = "import 'a';\nexport default function f() {\n\tg(\"x\", 0x10);\n}";
        let actual = "import 'a';\n\nexport default function f() {\n  // note\n  g('x', 16);\n}\n";
        assert_eq!(same_tree(expected, actual), Ok(true));
    }

    #[test]
    fn meaning_is_compared() {
        assert_eq!(same_tree("f(a, b);", "f(b, a);"), Ok(false));
        assert_eq!(same_tree("`a\\n`;", "`a\n`;"), Ok(false));
    }

    #[test]
    fn pure_marks_are_compared() {
        assert_eq!(same_tree("/* @__PURE__ */ f();", "f();"), Ok(false));
        assert_eq!(
            same_tree("/* @__PURE__ */ f();", "/*#__PURE__*/f();"),
            Ok(true)
        );
    }

    #[test]
    fn parentheses_are_not_nodes() {
        assert_eq!(same_tree("(a + b) * c;", "((a + b)) * c;"), Ok(true));
        assert_eq!(
            same_tree("(function () {})();", "(function () {}());"),
            Ok(true)
        );
        assert_eq!(same_tree("f((() => 1));", "f(() => 1);"), Ok(true));
    }

    #[test]
    fn marks_on_functions_are_ignored() {
        assert_eq!(
            same_tree(
                "/* @__NO_SIDE_EFFECTS__ */ function f() {}",
                "function f() {}"
            ),
            Ok(true)
        );
    }

    #[test]
    fn a_side_that_does_not_parse_is_named() {
        assert!(same_tree("f(", "f();").is_err_and(|e| e.starts_with("expected:")));
        assert!(same_tree("f();", "f(").is_err_and(|e| e.starts_with("actual:")));
    }
}
