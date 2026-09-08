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

#[cfg(test)]
mod tests {
    use super::super::test_support::run_svelte2tsx;

    #[test]
    fn test_generic_arrow_is_copied_verbatim() {
        // Upstream copies a `<T>` arrow into the overlay unchanged. It really is
        // lexed as JSX there — but reproducing that is what byte parity means,
        // and inserting a disambiguating comma changes the program the checker
        // sees: `<string>() => a` becomes a generic arrow whose type parameter
        // is named `string`.
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
