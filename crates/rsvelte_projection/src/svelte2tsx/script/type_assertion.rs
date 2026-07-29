//! TypeScript syntax rewrites needed to make the script body parse as TSX.

use super::super::magic_string::MagicString;
use super::script_facts::TypeAssertionFacts;

/// Rewrite every TS angle-bracket type assertion `<Type>expr` → `expr as Type`
/// recorded in `assertions`,
/// because TSX cannot parse the `<Type>expr` form. Mirrors the official
/// `handleTypeAssertion` (`nodes/handleTypeAssertion.ts`) surgically — moving the
/// type after the expression and removing the `<` / `>` — so any inner edits on
/// the expression (store wraps, etc.) survive untouched.
pub(super) fn rewrite_type_assertions(assertions: &[TypeAssertionFacts], str: &mut MagicString) {
    for assertion in assertions {
        // ` as ` before the (moved) type, which lands at the expression end.
        str.append_left(assertion.expr_end, " as ");
        // Move `<Type` to the end of the expression…
        str.move_range(
            assertion.assertion_start,
            assertion.type_end,
            assertion.expr_end,
        );
        // …then drop the leading `<` and the trailing `>`.
        str.remove(assertion.assertion_start, assertion.type_start);
        str.remove(assertion.type_end, assertion.expr_start);
    }
}

/// Add a trailing comma to every collected generic arrow type-parameter list
/// that would otherwise be misparsed as JSX in the generated `.tsx` overlay.
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
pub(super) fn disambiguate_arrow_type_params(insert_at: &[u32], str: &mut MagicString) {
    for &pos in insert_at {
        str.append_left(pos, ",");
    }
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

    #[test]
    fn test_nested_function_arrow_assertion_facts_apply_without_store_injection() {
        let source = "<script lang=\"ts\">\n\
            const store = {};\n\
            function outer($store: unknown) {\n\
                const inner = <T>($inner: T) => {\n\
                    const asserted = <Inner>$inner;\n\
                    return asserted;\n\
                };\n\
                return <Outer>inner;\n\
            }\n\
            </script>";
        let result = run_svelte2tsx(source);

        assert!(
            result.code.contains("<T,>($inner: T)"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("$inner as Inner"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("inner as Outer"),
            "got: {}",
            result.code
        );
        assert!(
            !result.code.contains("__sveltets_2_store_get(store)"),
            "got: {}",
            result.code
        );
        assert!(
            !result.code.contains("__sveltets_2_store_get(inner)"),
            "got: {}",
            result.code
        );
    }

    #[test]
    fn test_module_nested_arrow_assertion_uses_collected_facts() {
        let source = "<script context=\"module\" lang=\"ts\">\n\
            export const wrap = <T>(value: T) => <Box<T>>(() => <Inner<T>>value);\n\
            </script>";
        let result = run_svelte2tsx(source);

        assert!(
            result.code.contains("<T,>(value: T)"),
            "got: {}",
            result.code
        );
        assert!(
            result.code.contains("value as Inner<T>"),
            "got: {}",
            result.code
        );
        assert!(result.code.contains("as Box<T>"), "got: {}", result.code);
    }
}
