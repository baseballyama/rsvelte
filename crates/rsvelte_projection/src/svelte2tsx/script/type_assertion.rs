//! TypeScript syntax rewrites needed to make the script body parse as TSX.

use super::super::magic_string::MagicString;
use super::script_facts::TypeAssertionFacts;

/// Rewrite every TS angle-bracket type assertion `<Type>expr` → `expr as Type`
/// recorded in `assertions`,
/// because TSX cannot parse the `<Type>expr` form. Mirrors the official
/// `handleTypeAssertion` (`nodes/handleTypeAssertion.ts`) surgically — moving the
/// type after the expression and removing the `<` / `>` — so any inner edits on
/// the expression (store wraps, etc.) survive untouched.
pub(super) fn rewrite_type_assertions(
    assertions: &[TypeAssertionFacts],
    str: &mut MagicString<'_>,
) {
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

/// Append `,` after each collected lone type parameter (`<T>` → `<T,>`).
pub(super) fn disambiguate_arrow_type_params(insert_at: &[u32], str: &mut MagicString<'_>) {
    for &pos in insert_at {
        str.append_left(pos, ",");
    }
}

#[cfg(test)]
mod tests {
    use super::super::test_support::run_svelte2tsx;

    #[test]
    fn test_generic_arrow_is_copied_verbatim() {
        // Upstream copies a `<T>` arrow unchanged; its svelte-check reads the
        // output as a `.ts` file, where that is a generic arrow, not JSX.
        let source =
            "<script lang=\"ts\">\nconst id = <T>(x: T): T => x;\n</script>\n<p>{id(1)}</p>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("<T>(x: T)"),
            "Generic arrow must be copied verbatim.\nGot: {}",
            result.code
        );
        assert!(
            !result.code.contains("<T,>(x: T)"),
            "No disambiguating comma is inserted.\nGot: {}",
            result.code
        );
    }

    #[test]
    fn test_generic_arrow_gets_a_trailing_comma_for_a_tsx_consumer() {
        let source = "<script module lang=\"ts\">\nexport const m = <K>(k: K) => k;\n</script>\n\
            <script lang=\"ts\">\n\
            const id = <T>(x: T): T => x;\n\
            const pair = <T, U>(a: T, b: U) => [a, b];\n\
            const bounded = <T extends string>(x: T) => x;\n\
            const safe = <T,>(x: T) => x;\n\
            </script>\n<p>{id(1)}{pair(1, 2)}{bounded('a')}{safe(1)}{m(1)}</p>";
        let result = super::super::test_support::run_svelte2tsx_for_tsx(source);
        for expected in [
            "<K,>(k: K)",
            "<T,>(x: T): T",
            "<T, U>(a: T, b: U)",
            "<T extends string>(x: T)",
            "<T,>(x: T) => x",
        ] {
            assert!(
                result.code.contains(expected),
                "missing {expected}:\n{}",
                result.code
            );
        }
        assert_eq!(result.code.matches(",>").count(), 3, "{}", result.code);
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
        // Every type-parameter list is copied verbatim — in particular the
        // already-comma'd arrow does not gain a second one.
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
            result.code.contains("<T>($inner: T)"),
            "got: {}",
            result.code
        );
        // `ts` mode leaves instance-script assertions in the angle-bracket form
        // — the body lands inside `function $$render()`, where it still parses.
        assert!(
            result.code.contains("<Inner>$inner"),
            "got: {}",
            result.code
        );
        assert!(result.code.contains("<Outer>inner"), "got: {}", result.code);
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
            result.code.contains("<T>(value: T)"),
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
