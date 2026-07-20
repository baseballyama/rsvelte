//! Scope helpers for the native linter (`rsvelte_lint`).
//!
//! `rsvelte_lint` depends only on `rsvelte_core`, so the oxc-backed scope
//! resolution the lint rules need lives here, where oxc is already a
//! dependency. It answers two questions ESLint's `ReferenceTracker` /
//! svelte-eslint-parser scopes answer natively, so a name-based rule can tell a
//! real browser global (`window`, `document`) from a local binding — a prop,
//! import, or `let` named `open` / `top` / `name` / `status` — that merely
//! shares a global's name:
//!
//! 1. **Which script identifiers are not global** ([`ScriptScope::non_global_spans`]):
//!    declarations + references that resolve to a local. A script rule
//!    (`check_program`) skips any browser-global-named identifier at one of
//!    these spans.
//! 2. **Which names are declared at the component's top level**
//!    ([`ScriptScope::root_binding_names`]): props / imports / top-level `let` /
//!    `const` / `function`. A template rule (`check_root`) skips a
//!    browser-global name in `{expr}` when it is one of these — the `{open}`
//!    read resolves to the `open` prop, not `window.open`.
//!
//! Without this, `no-top-level-browser-globals` flags every such local as a
//! global (the largest lint-corpus false-positive cluster).

use oxc_allocator::Allocator;
use oxc_ast::AstKind;
use oxc_parser::{ParseOptions, Parser};
use oxc_semantic::{IsGlobalReference, SemanticBuilder};
use oxc_span::{GetSpan, SourceType};

/// The scope facts a lint rule needs about one `<script>` body. See the module
/// docs for how each field is used.
#[derive(Debug, Default)]
pub struct ScriptScope {
    /// Byte spans (relative to the analyzed script) of every identifier that is
    /// **not a global value reference** — every binding-declaration site (a
    /// `let` / `const` / `var` name, function / class name, parameter,
    /// catch-clause binding, import binding, and a `$props()` destructuring name
    /// such as `let { open = $bindable() }`) plus every reference that resolves
    /// to a local binding. Unresolved ("global") references are omitted, so a
    /// rule can treat this as a deny-list of locals.
    pub non_global_spans: Vec<(u32, u32)>,
    /// Names declared in the script's **root** (module / instance top-level)
    /// scope — the bindings visible to the component's template.
    pub root_binding_names: Vec<String>,
}

/// Resolve the scope facts for one `<script>` body via a single oxc semantic
/// build.
///
/// Returning non-globals (rather than globals) makes the query fail-safe: if the
/// script somehow can't be resolved the sets are empty, nothing is treated as a
/// local, and the rule degrades to its old name-based behaviour rather than
/// silently dropping real findings.
///
/// Parsing / semantic errors do not abort the query: a partially-resolved
/// semantic still answers the shadowing question for the parts that did resolve,
/// and a script ESLint accepts parses cleanly here anyway (both this and
/// `svelte-eslint-parser` sit on a standard JS/TS grammar).
pub fn resolve_script_scope(script_src: &str, is_ts: bool) -> ScriptScope {
    let allocator = Allocator::default();
    let source_type = if is_ts {
        SourceType::ts().with_module(true)
    } else {
        SourceType::mjs()
    };
    let parser_ret = Parser::new(&allocator, script_src, source_type)
        .with_options(ParseOptions {
            // Script fragments can contain a stray `return` (e.g. a `<script>`
            // body lifted from a function-shaped snippet). Matches the other
            // in-crate oxc scope helpers.
            allow_return_outside_function: true,
            ..ParseOptions::default()
        })
        .parse();
    // `alloc` the program so both it and the `Semantic` that borrows it live for
    // the length of this function (mirrors `scope_analysis::with_semantic`).
    let program = allocator.alloc(parser_ret.program);
    let semantic = SemanticBuilder::new()
        .with_build_nodes(true)
        .build(program)
        .semantic;
    let scoping = semantic.scoping();

    let mut non_global_spans = Vec::new();
    for node in semantic.nodes().iter() {
        match node.kind() {
            // A read that resolves to a local binding (not a global).
            AstKind::IdentifierReference(ident) if !ident.is_global_reference(scoping) => {
                let span = ident.span();
                non_global_spans.push((span.start, span.end));
            }
            // Every declaration site — never a global reference.
            AstKind::BindingIdentifier(ident) => {
                let span = ident.span();
                non_global_spans.push((span.start, span.end));
            }
            _ => {}
        }
    }

    // Root-scope declarations are the names a component's template can read.
    let root_scope = scoping.root_scope_id();
    let root_binding_names = scoping
        .symbol_ids()
        .filter(|&id| scoping.symbol_scope_id(id) == root_scope)
        .map(|id| scoping.symbol_name(id).to_string())
        .collect();

    ScriptScope {
        non_global_spans,
        root_binding_names,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn local_spans(src: &str, is_ts: bool) -> Vec<(u32, u32)> {
        let mut s = resolve_script_scope(src, is_ts).non_global_spans;
        s.sort_unstable();
        s
    }

    fn local_names(src: &str, is_ts: bool) -> Vec<&str> {
        local_spans(src, is_ts)
            .into_iter()
            .map(|(s, e)| &src[s as usize..e as usize])
            .collect()
    }

    fn root_names(src: &str, is_ts: bool) -> Vec<String> {
        let mut n = resolve_script_scope(src, is_ts).root_binding_names;
        n.sort();
        n
    }

    #[test]
    fn bare_global_is_not_local() {
        // `window` is undeclared → a global reference → NOT in the set.
        let src = "window.location.href;";
        assert!(local_spans(src, false).is_empty());
    }

    #[test]
    fn local_binding_shadows_global_name() {
        // `open` is declared (binding) and read twice (both resolve local).
        let src = "let open = 1;\nopen;\nopen();";
        let names = local_names(src, false);
        assert_eq!(
            names,
            vec!["open", "open", "open"],
            "the declaration plus both reads of `open` are non-globals"
        );
    }

    #[test]
    fn imported_name_is_local() {
        let src = "import { open } from './x.js';\nopen();";
        // The import binding + the read.
        assert_eq!(local_names(src, false), vec!["open", "open"]);
    }

    #[test]
    fn function_param_shadows_but_top_level_use_is_global() {
        // `f` (fn binding), `open` (param binding), `open` (inner read → param)
        // are non-globals; the trailing top-level `open()` is a global read and
        // is excluded.
        let src = "function f(open) { open(); }\nopen();";
        let names = local_names(src, false);
        assert_eq!(names, vec!["f", "open", "open"]);
        // Exactly one `open` (the top-level global read) is NOT captured.
        let open_count = src.matches("open").count();
        let captured_open = names.iter().filter(|&&n| n == "open").count();
        assert_eq!(
            open_count - captured_open,
            1,
            "the global `open` is excluded"
        );
    }

    #[test]
    fn props_destructure_default_binding_is_local() {
        // The `open` prop *declaration* (a binding, not a reference) must be in
        // the set — this is the shape that produced the largest FP cluster:
        // `let { open = $bindable() } = $props()`.
        let src = "let { open = $bindable() } = $props();";
        let names = local_names(src, false);
        assert!(
            names.contains(&"open"),
            "the `open` binding declaration must be a non-global: {names:?}"
        );
        // `$bindable` / `$props` are undeclared globals → excluded.
        assert!(!names.contains(&"$bindable"));
        assert!(!names.contains(&"$props"));
    }

    #[test]
    fn ts_prop_destructure_is_local() {
        // The `open` prop from `$props()` destructuring is a binding; its reads
        // resolve to it. `$props` (global) is excluded.
        let src = "let { open } = $props();\nfunction toggle() { open = !open; }";
        let names = local_names(src, true);
        assert!(names.contains(&"open"));
        assert!(
            !names.contains(&"$props"),
            "the `$props` global is excluded"
        );
    }

    #[test]
    fn root_binding_names_are_top_level_only() {
        // Top level: import `cn`, prop `open`, `value`, function `toggle`. The
        // param `x` inside `toggle` is NOT a root (template-visible) binding.
        let src = "import { cn } from './x';\n\
                   let { open = $bindable(), value } = $props();\n\
                   function toggle(x) { return x; }";
        let names = root_names(src, false);
        assert!(names.contains(&"open".to_string()));
        assert!(names.contains(&"value".to_string()));
        assert!(names.contains(&"cn".to_string()));
        assert!(names.contains(&"toggle".to_string()));
        assert!(
            !names.contains(&"x".to_string()),
            "a function param is not a root binding: {names:?}"
        );
    }
}
