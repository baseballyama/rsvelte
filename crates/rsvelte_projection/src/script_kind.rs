//! The `.svelte` scriptKind decision, shared by the checker overlay and the
//! language server.

use crate::ast::template::{AttributeValue, AttributeValuePart, Script};
use crate::compiler::phases::phase1_parse::{self, ParseOptions};

/// `getScriptKindFromAttributes`: `attrs.lang || attrs.type`, matched
/// case-sensitively against the four TypeScript spellings.
fn script_is_typescript(script: &Script<'_>) -> bool {
    let attribute = |wanted: &str| {
        script.attributes.iter().find_map(|attribute| {
            if attribute.name != wanted {
                return None;
            }
            match &attribute.value {
                AttributeValue::Sequence(parts) => match parts.as_slice() {
                    [AttributeValuePart::Text(text)] => Some(text.data.as_ref()),
                    _ => None,
                },
                _ => None,
            }
        })
    };
    matches!(
        attribute("lang").or_else(|| attribute("type")),
        Some("ts" | "typescript" | "text/ts" | "text/typescript")
    )
}

/// The lexical sniff this decision used before it was parsed. Kept only for
/// sources the parser rejects, which never reach an overlay anyway.
fn looks_like_typescript(source: &str) -> bool {
    let lower = source.to_ascii_lowercase();
    lower.contains("lang=\"ts\"") || lower.contains("lang='ts'") || lower.contains("lang=ts")
}

/// Whether a component's scripts are TypeScript, deciding it the way upstream's
/// `DocumentSnapshot` does: `getScriptKindFromAttributes` over the first module
/// and first instance script that `extractScriptTags` keeps.
///
/// A substring scan cannot express that selection — it answers yes to
/// `lang="ts"` written in a string, a comment, a `<style>`, a nested element or
/// a `{#if}` branch, none of which upstream reads.
#[must_use]
pub fn is_typescript_component(source: &str) -> bool {
    let allocator = oxc_allocator::Allocator::default();
    let options = ParseOptions {
        modern: true,
        defer_script_parse: true,
        skip_expression_loc: true,
        ..ParseOptions::default()
    };
    match phase1_parse::parse(source, &allocator, options) {
        Ok(root) => {
            root.instance.as_deref().is_some_and(script_is_typescript)
                || root.module.as_deref().is_some_and(script_is_typescript)
        }
        Err(_) => looks_like_typescript(source),
    }
}

#[cfg(test)]
mod tests {
    use super::is_typescript_component;

    /// Shapes where the substring scan and upstream disagree. Each answer is
    /// upstream's, measured by running `extractScriptTags` +
    /// `getScriptKindFromAttributes`, not transcribed from its source.
    #[test]
    fn matches_upstream_where_the_substring_scan_did_not() {
        for (name, source, expected) in [
            ("plain", "<script>let a = 1</script>", false),
            ("lang=ts", "<script lang=\"ts\">let a = 1</script>", true),
            (
                "lang=typescript",
                "<script lang=\"typescript\">let a = 1</script>",
                true,
            ),
            (
                "type=text/typescript",
                "<script type=\"text/typescript\">let a = 1</script>",
                true,
            ),
            ("type=ts", "<script type=\"ts\">let a = 1</script>", true),
            (
                "lang=text/ts",
                "<script lang=\"text/ts\">let a = 1</script>",
                true,
            ),
            (
                "spaced lang = \"ts\"",
                "<script lang = \"ts\">let a = 1</script>",
                true,
            ),
            ("unquoted", "<script lang=ts>let a = 1</script>", true),
            (
                "uppercase TS",
                "<script lang=\"TS\">let a = 1</script>",
                false,
            ),
            (
                "markup div",
                "<script>let a = 1</script>\n<div lang=\"ts\">x</div>",
                false,
            ),
            (
                "string literal",
                "<script>const s = 'lang=ts'</script>",
                false,
            ),
            (
                "style lang=ts",
                "<script>let a = 1</script>\n<style lang=\"ts\"></style>",
                false,
            ),
            (
                "module only",
                "<script module lang=\"ts\">let a = 1</script><script>let b = 1</script>",
                true,
            ),
            (
                "context=module",
                "<script context=\"module\" lang=\"ts\">let a = 1</script><script>let b = 1</script>",
                true,
            ),
            (
                "nested in a div",
                "<div><script lang=\"ts\">let a = 1</script></div>",
                false,
            ),
            (
                "inside an if block",
                "{#if x}<script lang=\"ts\">let a = 1</script>{/if}",
                false,
            ),
            (
                "after a closed if block",
                "{#if x}<p></p>{/if}<script lang=\"ts\">let a = 1</script>",
                true,
            ),
            (
                "in an HTML comment",
                "<!-- <script lang=\"ts\"></script> --><script>let a = 1</script>",
                false,
            ),
        ] {
            assert_eq!(is_typescript_component(source), expected, "{name}");
        }
    }

    /// A source the parser rejects keeps the old lexical answer rather than
    /// defaulting, so this path is no worse than it was.
    #[test]
    fn falls_back_to_the_lexical_scan_when_the_source_does_not_parse() {
        let unparseable = "<script lang=\"ts\">let a = 1</script><script>let b = 1</script><script>let c = 1</script>";
        assert!(is_typescript_component(unparseable));
        assert!(!is_typescript_component("{#if}<p>"));
    }
}
