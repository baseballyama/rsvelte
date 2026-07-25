//! TypeScript syntax rewrites needed to make the script body parse as TSX:
//! angle-bracket type assertions and single-parameter generic arrows.

use oxc_ast::ast as oxc;
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

use super::super::magic_string::MagicString;

/// Reuses an already-parsed module program (callers parse the module
/// script once and pass the result here, avoiding a second OXC parse).
/// Rewrite every TS angle-bracket type assertion `<Type>expr` → `expr as Type`
/// in `program`, anywhere it appears (function bodies, return statements, etc.),
/// because TSX cannot parse the `<Type>expr` form. Mirrors the official
/// `handleTypeAssertion` (`nodes/handleTypeAssertion.ts`) surgically — moving the
/// type after the expression and removing the `<` / `>` — so any inner edits on
/// the expression (store wraps, etc.) survive untouched.
pub(super) fn rewrite_type_assertions_with_program(
    program: &oxc::Program,
    content_offset: usize,
    str: &mut MagicString,
) {
    let mut collector = TypeAssertionCollector { out: Vec::new() };
    collector.visit_program(program);
    let off = content_offset as u32;
    for a in &collector.out {
        // assertionStart = `<`, typeStart/typeEnd = the `Type`, exprStart/exprEnd.
        let assertion_start = a.assertion_start + off;
        let type_start = a.type_start + off;
        let type_end = a.type_end + off;
        let expr_start = a.expr_start + off;
        let expr_end = a.expr_end + off;
        // ` as ` before the (moved) type, which lands at the expression end.
        str.append_left(expr_end, " as ");
        // Move `<Type` to the end of the expression…
        str.move_range(assertion_start, type_end, expr_end);
        // …then drop the leading `<` and the trailing `>`.
        str.remove(assertion_start, type_start);
        str.remove(type_end, expr_start);
    }
}

/// One collected `<Type>expr` assertion, spans relative to script content.
struct CollectedTypeAssertion {
    assertion_start: u32,
    type_start: u32,
    type_end: u32,
    expr_start: u32,
    expr_end: u32,
}

/// Recursively collects every `TSTypeAssertion` in a parsed script.
struct TypeAssertionCollector {
    out: Vec<CollectedTypeAssertion>,
}

impl<'a> Visit<'a> for TypeAssertionCollector {
    fn visit_ts_type_assertion(&mut self, it: &oxc::TSTypeAssertion<'a>) {
        let (type_start, type_end) = oxc_ast_span(&it.type_annotation);
        let expr_span = it.expression.span();
        self.out.push(CollectedTypeAssertion {
            assertion_start: it.span.start,
            type_start,
            type_end,
            expr_start: expr_span.start,
            expr_end: expr_span.end,
        });
        // Recurse so nested assertions (and assertions inside the expression)
        // are collected too.
        oxc_ast_visit::walk::walk_ts_type_assertion(self, it);
    }
}

/// Walk a parsed script `program` and add a trailing comma to every generic
/// **arrow function** type-parameter list that would otherwise be misparsed as
/// JSX in the generated `.tsx` overlay.
///
/// In a `.tsx` file `const f = <T>(x: T) => x` is lexed as a JSX element
/// (`<T>…`), producing a cascade of bogus "JSX element 'T' has no corresponding
/// closing tag" errors. TypeScript itself disambiguates by requiring either a
/// trailing comma (`<T,>`), a constraint (`<T extends X>`), a default
/// (`<T = Y>`), or more than one parameter (`<T, U>`). Only the bare
/// single-parameter form `<T>` is ambiguous, so that is the only shape we
/// rewrite — to `<T,>`.
///
/// Note: this targets arrow functions only. `function foo<T>()`, call type
/// arguments `f<T>()`, and class / interface generics are all unambiguous in
/// TSX and are left untouched.
pub(super) fn disambiguate_arrow_type_params(
    program: &oxc::Program,
    offset: u32,
    raw_content: &str,
    str: &mut MagicString,
) {
    let mut collector = ArrowGenericCommaCollector {
        raw_content,
        insert_at: Vec::new(),
    };
    collector.visit_program(program);
    for pos in collector.insert_at {
        str.append_left(pos + offset, ",");
    }
}

/// Collects byte offsets (relative to the script content) where a trailing
/// comma must be inserted into a single-parameter generic arrow function.
struct ArrowGenericCommaCollector<'s> {
    raw_content: &'s str,
    insert_at: Vec<u32>,
}

impl<'a> Visit<'a> for ArrowGenericCommaCollector<'_> {
    fn visit_arrow_function_expression(&mut self, it: &oxc::ArrowFunctionExpression<'a>) {
        if let Some(tp) = it.type_parameters.as_deref() {
            // Only the single-parameter form is ambiguous. `<T, U>` already
            // carries a disambiguating comma.
            if tp.params.len() == 1 {
                let param = &tp.params[0];
                // A constraint (`extends`) or default (`=`) already makes the
                // list unambiguous in TSX, so leave those alone.
                if param.constraint.is_none() && param.default.is_none() {
                    let bytes = self.raw_content.as_bytes();
                    let mut i = param.span.end as usize;
                    // Skip whitespace up to the closing `>` (or an existing
                    // trailing comma).
                    while i < bytes.len() && bytes[i].is_ascii_whitespace() {
                        i += 1;
                    }
                    let already_has_comma = i < bytes.len() && bytes[i] == b',';
                    if !already_has_comma {
                        self.insert_at.push(param.span.end);
                    }
                }
            }
        }
        // Recurse so nested arrow functions are handled too.
        oxc_ast_visit::walk::walk_arrow_function_expression(self, it);
    }
}

fn oxc_ast_span(ty: &oxc::TSType) -> (u32, u32) {
    use oxc::TSType::*;
    let span = match ty {
        TSAnyKeyword(t) => t.span,
        TSBigIntKeyword(t) => t.span,
        TSBooleanKeyword(t) => t.span,
        TSIntrinsicKeyword(t) => t.span,
        TSNeverKeyword(t) => t.span,
        TSNullKeyword(t) => t.span,
        TSNumberKeyword(t) => t.span,
        TSObjectKeyword(t) => t.span,
        TSStringKeyword(t) => t.span,
        TSSymbolKeyword(t) => t.span,
        TSUndefinedKeyword(t) => t.span,
        TSUnknownKeyword(t) => t.span,
        TSVoidKeyword(t) => t.span,
        TSThisType(t) => t.span,
        TSTypeReference(t) => t.span,
        TSArrayType(t) => t.span,
        TSConditionalType(t) => t.span,
        TSConstructorType(t) => t.span,
        TSFunctionType(t) => t.span,
        TSImportType(t) => t.span,
        TSIndexedAccessType(t) => t.span,
        TSInferType(t) => t.span,
        TSIntersectionType(t) => t.span,
        TSLiteralType(t) => t.span,
        TSMappedType(t) => t.span,
        TSNamedTupleMember(t) => t.span,
        TSTemplateLiteralType(t) => t.span,
        TSTupleType(t) => t.span,
        TSTypeLiteral(t) => t.span,
        TSTypeOperatorType(t) => t.span,
        TSTypePredicate(t) => t.span,
        TSTypeQuery(t) => t.span,
        TSUnionType(t) => t.span,
        _ => return (0, 0),
    };
    (span.start, span.end)
}

#[cfg(test)]
mod tests {
    use super::super::test_support::run_svelte2tsx;

    #[test]
    fn test_generic_arrow_gets_trailing_comma() {
        // A bare single-parameter generic arrow `<T>` would be lexed as a JSX
        // element in the `.tsx` overlay; svelte2tsx must rewrite it to `<T,>`.
        let source =
            "<script lang=\"ts\">\nconst id = <T>(x: T): T => x;\n</script>\n<p>{id(1)}</p>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("<T,>(x: T)"),
            "Generic arrow should be disambiguated to `<T,>`.\nGot: {}",
            result.code
        );
        assert!(
            !result.code.contains("<T>(x: T)"),
            "The ambiguous `<T>` form must not survive into the overlay.\nGot: {}",
            result.code
        );
    }

    #[test]
    fn test_generic_arrow_already_safe_forms_untouched() {
        let source = "<script lang=\"ts\">\n\
            const multi = <T, U>(x: T, y: U): T => x;\n\
            const constrained = <T extends number>(x: T): T => x;\n\
            const defaulted = <T = string>(x: T): T => x;\n\
            const already = <T,>(x: T): T => x;\n\
            function fn<T>(x: T): T { return x; }\n\
            const call = fn<number>(1);\n\
            </script>";
        let result = run_svelte2tsx(source);
        // None of these forms are ambiguous in TSX, so they must be emitted
        // verbatim — in particular no double comma on the already-safe arrow.
        assert!(
            result.code.contains("<T, U>(x: T, y: U)"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("<T extends number>(x: T)"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("<T = string>(x: T)"),
            "got: {}",
            result.code
        );
        assert!(result.code.contains("<T,>(x: T)"), "got: {}", result.code);
        assert!(
            !result.code.contains("<T,,>"),
            "no double comma; got: {}",
            result.code
        );
        assert!(
            result.code.contains("function fn<T>(x: T)"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("fn<number>(1)"),
            "got: {}",
            result.code
        );
    }
}
