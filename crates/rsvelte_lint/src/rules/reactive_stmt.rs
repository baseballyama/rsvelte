//! Shared helpers for the `$:` reactive-statement rules.
//!
//! `svelte-eslint-parser` retypes a `LabeledStatement` with label `$` to
//! `SvelteReactiveStatement` **only when its parent is the `Program`**
//! (`parser/script.ts`), so a `$:` label written inside a function body stays a
//! plain labeled statement and none of the `SvelteReactiveStatement` rules see
//! it. Matching the label anywhere in the tree therefore reports on code
//! upstream ignores.
//!
//! The module also carries two facts several of those rules need and that no
//! per-rule name list can answer correctly: which unresolved names are declared
//! globals, and which `Identifier` nodes are not identifiers at all.

use serde_json::Value;

use crate::script::node_type;

/// Whether `node` is a `SvelteReactiveStatement`: a `$:`-labeled statement that
/// is a direct child of the `Program`.
#[must_use]
pub fn is_reactive_statement(node: &Value, ancestors: &[&Value]) -> bool {
    node_type(node) == Some("LabeledStatement")
        && node
            .get("label")
            .and_then(|label| label.get("name"))
            .and_then(Value::as_str)
            == Some("$")
        && ancestors.last().copied().and_then(node_type) == Some("Program")
}

/// The lint environment's globals beyond `GLOBALS_BUILTIN`: the universal
/// Web/Node APIs and the curated browser-only set. Kept equal to `envApis` +
/// `browserOnly` in `scripts/compat-corpus/lint-oracle/browser-globals.json`,
/// which is what the parity oracle declares.
const ENV_GLOBALS: &[&str] = &[
    "console",
    "URL",
    "URLSearchParams",
    "fetch",
    "setTimeout",
    "clearTimeout",
    "setInterval",
    "clearInterval",
    "queueMicrotask",
    "setImmediate",
    "clearImmediate",
    "window",
    "document",
    "location",
    "navigator",
    "history",
    "localStorage",
    "sessionStorage",
    "screen",
    "frames",
    "parent",
    "top",
    "self",
    "globalThis",
    "alert",
    "confirm",
    "prompt",
    "matchMedia",
    "getComputedStyle",
    "requestAnimationFrame",
    "cancelAnimationFrame",
    "customElements",
    "CSS",
    "IntersectionObserver",
    "ResizeObserver",
    "MutationObserver",
];

/// Whether `name` resolves to a declared global rather than being undefined.
/// A rule that has to tell "unknown variable" from "a global" must ask this
/// instead of an enumerated per-rule list, which silently omits intrinsics
/// (`Intl`, `Reflect`, `Proxy`, …) and reads the reference as undeclared.
#[must_use]
pub fn is_declared_global(name: &str) -> bool {
    javascript_globals::GLOBALS_BUILTIN.contains_key(name) || ENV_GLOBALS.contains(&name)
}

/// The rsvelte ESTree serializer has no mapping for a few `oxc` expression
/// kinds (a `BigIntLiteral` among them) and emits `Identifier { name:
/// "unknown" }` in their place, so a rule keying on `type` sees an identifier
/// where the source has a literal. A placeholder is recognised by its name not
/// being what the source says at its own span.
#[must_use]
pub fn is_unmapped_placeholder(source: &str, node: &Value) -> bool {
    if node_type(node) != Some("Identifier")
        || node.get("name").and_then(Value::as_str) != Some("unknown")
    {
        return false;
    }
    node_text(source, node) != Some("unknown")
}

/// Whether an [`is_unmapped_placeholder`] node's source text is a literal —
/// recovered by re-parsing that text, because the placeholder itself carries no
/// evidence of what it replaced.
#[must_use]
pub fn placeholder_is_literal(source: &str, node: &Value) -> bool {
    node_text(source, node).is_some_and(text_is_literal)
}

fn node_text<'a>(source: &'a str, node: &Value) -> Option<&'a str> {
    let start = usize::try_from(node.get("start")?.as_u64()?).ok()?;
    let end = usize::try_from(node.get("end")?.as_u64()?).ok()?;
    source.get(start..end)
}

fn text_is_literal(text: &str) -> bool {
    use oxc_allocator::Allocator;
    use oxc_ast::ast::{Expression, Statement};
    use oxc_parser::Parser;
    use oxc_span::SourceType;

    let allocator = Allocator::default();
    let parsed = Parser::new(&allocator, text, SourceType::mjs()).parse();
    if !parsed.diagnostics.is_empty() {
        return false;
    }
    let [Statement::ExpressionStatement(statement)] = parsed.program.body.as_slice() else {
        return false;
    };
    matches!(
        statement.expression,
        Expression::BigIntLiteral(_)
            | Expression::RegExpLiteral(_)
            | Expression::StringLiteral(_)
            | Expression::NumericLiteral(_)
            | Expression::BooleanLiteral(_)
            | Expression::NullLiteral(_)
    )
}

/// Whether the file's script(s) are TypeScript, for the `oxc` re-parse the
/// scope-resolving rules run. Mirrors how the engine picks a `SourceType`.
#[must_use]
pub fn source_is_ts(source: &str, filename: &str) -> bool {
    crate::rules::store_refs::module_is_ts(filename) || crate::svelte_scan::script_is_ts(source)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn program(body: Value) -> Value {
        json!({ "type": "Program", "body": [body] })
    }

    #[test]
    fn only_a_program_child_label_is_reactive() {
        let label = json!({ "type": "LabeledStatement", "label": { "name": "$" } });
        let program = program(label.clone());
        assert!(is_reactive_statement(&label, &[&program]));
        // Nested one level deeper (a function body) — not a reactive statement.
        let block = json!({ "type": "BlockStatement" });
        assert!(!is_reactive_statement(&label, &[&program, &block]));
        // A different label at the top level is not reactive either.
        let other = json!({ "type": "LabeledStatement", "label": { "name": "loop" } });
        assert!(!is_reactive_statement(&other, &[&program]));
    }

    #[test]
    fn intrinsics_and_env_apis_are_globals() {
        // The name whose absence from a hand-written list produced a missed report.
        assert!(is_declared_global("Intl"));
        assert!(is_declared_global("Reflect"));
        assert!(is_declared_global("console"));
        assert!(is_declared_global("window"));
        assert!(!is_declared_global("myOwnThing"));
    }

    #[test]
    fn bigint_placeholder_is_recognised_as_a_literal() {
        // `10n` at bytes 8..11 of `let a = 10n;`.
        let source = "let a = 10n;";
        let node = json!({ "type": "Identifier", "name": "unknown", "start": 8, "end": 11 });
        assert!(is_unmapped_placeholder(source, &node));
        assert!(placeholder_is_literal(source, &node));
    }

    #[test]
    fn a_variable_actually_named_unknown_is_not_a_placeholder() {
        let source = "let a = unknown;";
        let node = json!({ "type": "Identifier", "name": "unknown", "start": 8, "end": 15 });
        assert!(!is_unmapped_placeholder(source, &node));
    }

    #[test]
    fn a_placeholder_for_a_non_literal_is_not_a_literal() {
        let source = "let a = x ?? y;";
        let node = json!({ "type": "Identifier", "name": "unknown", "start": 8, "end": 14 });
        assert!(is_unmapped_placeholder(source, &node));
        assert!(!placeholder_is_literal(source, &node));
    }
}
