//! The expected uses are what eslint-utils 4.10.1's `ReferenceTracker` yields for the same code
//! (`READ` and `CALL` for each name, `globals.browser` and `globals.es2021` declared).

use rsvelte_kernel::source::positions::Span;

use super::{
    TrackedReference, global_references, global_references_matching, import_references,
    property_references,
};
use crate::scope;
use crate::scope::Semantic;
use rsvelte_typescript_syntax::{NodeIdentifier, SyntaxTree, parser};

/// Each use as `name@text`, the text being the call's when the use is called, in source order.
fn uses(
    source: &str,
    track: impl Fn(
        &SyntaxTree,
        &Semantic,
        &[NodeIdentifier],
        NodeIdentifier,
    ) -> Vec<TrackedReference<'static>>,
) -> Vec<String> {
    let mut tree = SyntaxTree::new();
    let program = parser::parse_program(&mut tree, source, Span::new(0, source.len() as u32), true)
        .expect("parses");
    let sem = scope::analyze(&tree, program, &[]);
    let parents = tree.parents();
    let mut out: Vec<(Span, String)> = track(&tree, &sem, &parents, program)
        .into_iter()
        .map(|reference| {
            let node = reference.call.unwrap_or(reference.node);
            let span = tree.source_location(node).span().expect("parsed");
            (span, format!("{}@{}", reference.name, span.text(source)))
        })
        .collect();
    out.sort_by_key(|(span, _)| (span.start_offset, span.end_offset));
    out.into_iter().map(|(_, text)| text).collect()
}

fn store(source: &str, exports: &[&'static str]) -> Vec<String> {
    uses(source, |tree, sem, parents, program| {
        import_references(
            tree,
            sem,
            parents,
            source,
            &[program],
            "svelte/store",
            exports,
        )
    })
}

fn globals(source: &str) -> Vec<String> {
    uses(source, |tree, sem, parents, _| {
        global_references(
            tree,
            sem,
            parents,
            source,
            &["setTimeout", "setInterval", "queueMicrotask"],
        )
    })
}

#[test]
fn named_default_and_namespace_imports_are_followed() {
    let source = "import { writable as w, readable } from 'svelte/store';\n\
                  import store, * as ns from 'svelte/store';\n\
                  import { writable } from './other';\n\
                  w(1); readable; ns.derived(); ns['writable']; ns.other; store.x; writable();";
    assert_eq!(
        store(source, &["writable", "readable", "derived", "default"]),
        [
            "writable@w(1)",
            "readable@readable",
            "derived@ns.derived()",
            "writable@ns['writable']",
            "default@store",
        ]
    );
}

#[test]
fn aliases_are_followed_and_cycles_end() {
    let source = "import { writable } from 'svelte/store';\n\
                  import * as ns from 'svelte/store';\n\
                  const a = writable; a();\n\
                  const { derived: d } = ns; d();\n\
                  let x = y; let y = x;";
    assert_eq!(
        store(source, &["writable", "derived"]),
        [
            "writable@writable",
            "writable@a()",
            "derived@derived: d",
            "derived@d()"
        ]
    );
}

#[test]
fn a_shadowing_binding_is_not_the_import() {
    let source = "import { writable } from 'svelte/store';\n\
                  function f(writable) { writable(); }\n\
                  writable();";
    assert_eq!(store(source, &["writable"]), ["writable@writable()"]);
}

#[test]
fn values_pass_through_expressions_assignments_and_defaults() {
    let calls = |source: &str| -> Vec<String> {
        store(source, &["writable", "readable"])
            .into_iter()
            .filter(|text| text.ends_with(')'))
            .collect()
    };
    let prefix = "import { writable, readable } from 'svelte/store';\n\
                  import * as ns from 'svelte/store';\n";
    for (code, expected) in [
        ("(0, ns.writable)();", vec!["writable@(0, ns.writable)()"]),
        (
            "(c ? writable : readable)();",
            vec![
                "writable@(c ? writable : readable)()",
                "readable@(c ? writable : readable)()",
            ],
        ),
        ("(c || writable)();", vec!["writable@(c || writable)()"]),
        (
            "const { writable: w = null } = ns; w();",
            vec!["writable@w()"],
        ),
        (
            "let alias; alias = readable; alias();",
            vec!["readable@alias()"],
        ),
        ("(a = writable)();", vec!["writable@(a = writable)()"]),
        ("function f(w = writable) { w(); }", vec!["writable@w()"]),
        ("(writable as any)();", vec!["writable@(writable as any)()"]),
        ("ns[`writable`]();", vec!["writable@ns[`writable`]()"]),
    ] {
        let source = format!("{prefix}{code}");
        let found = calls(&source);
        // Two names may share one call, whose span sorts them in either order.
        let mut sorted = found.clone();
        sorted.sort();
        let mut want: Vec<String> = expected.iter().map(|&text| text.to_owned()).collect();
        want.sort();
        assert_eq!(sorted, want, "{code}");
    }
}

#[test]
fn globals_are_followed_through_global_objects() {
    assert_eq!(
        globals(
            "window.setTimeout(f); globalThis.queueMicrotask(f); self.setInterval(f); \
             setTimeout(f);"
        ),
        [
            "setTimeout@window.setTimeout(f)",
            "queueMicrotask@globalThis.queueMicrotask(f)",
            "setInterval@self.setInterval(f)",
            "setTimeout@setTimeout(f)",
        ]
    );
    assert_eq!(
        globals("const w = window; w.setTimeout(f); const { setTimeout: s } = globalThis; s(f);"),
        [
            "setTimeout@w.setTimeout(f)",
            "setTimeout@setTimeout: s",
            "setTimeout@s(f)"
        ]
    );
}

#[test]
fn assigned_undeclared_and_shadowed_globals_are_not_followed() {
    // An assigned global stops only its own name, not the members of `window`.
    assert_eq!(
        globals("setTimeout = 1; setTimeout(f); window.setTimeout(f);"),
        ["setTimeout@window.setTimeout(f)"]
    );
    assert_eq!(
        globals("window = 1; window.setTimeout(f);"),
        Vec::<String>::new()
    );
    // `global` is Node.js's, not a browser global.
    assert_eq!(globals("global.setTimeout(f);"), Vec::<String>::new());
    assert_eq!(
        globals("function g(setTimeout) { setTimeout(f); } window.window.setTimeout(f);"),
        Vec::<String>::new()
    );
}

#[test]
fn an_alias_reports_what_is_done_with_it_not_itself() {
    // eslint-utils reports `t()` but not the read `t`, while each read of the global counts.
    assert_eq!(
        globals("const t = setTimeout; t; t(); setTimeout;"),
        [
            "setTimeout@setTimeout",
            "setTimeout@t()",
            "setTimeout@setTimeout"
        ]
    );
}

#[test]
fn globals_can_be_matched_by_a_predicate_with_other_global_objects() {
    let source = "window.location; globalThis.location; location; window.window.location;";
    let found = uses(source, |tree, sem, parents, _| {
        let found = global_references_matching(
            tree,
            sem,
            parents,
            source,
            |name| matches!(name, "location" | "window"),
            &["globalThis"],
        );
        // The names borrow from the tree; the test's signature asks for static ones.
        found
            .into_iter()
            .map(|r| TrackedReference {
                name: if r.name == "window" {
                    "window"
                } else {
                    "location"
                },
                ..r
            })
            .collect()
    });
    assert_eq!(
        found,
        [
            "window@window",
            "location@globalThis.location",
            "location@location",
            "window@window"
        ]
    );
}

#[test]
fn members_of_a_value_are_followed_through_aliases_and_patterns() {
    let source = "const m = new Map(); m.set(1); const { delete: d } = m; d(); const n = m; \
                  n.clear(); m.get(1);";
    let found = uses(source, |tree, sem, parents, program| {
        let rsvelte_typescript_syntax::Kind::Program(statements) = tree.kind(program) else {
            unreachable!()
        };
        let rsvelte_typescript_syntax::Kind::VariableDeclaration { declarations, .. } =
            tree.kind(statements[0])
        else {
            unreachable!()
        };
        let rsvelte_typescript_syntax::Kind::Declarator {
            initializer: Some(map),
            ..
        } = tree.kind(declarations[0])
        else {
            unreachable!()
        };
        property_references(
            tree,
            sem,
            parents,
            source,
            map,
            &[],
            &["set", "delete", "clear", "get"],
        )
    });
    assert_eq!(
        found,
        [
            "set@m.set(1)",
            "delete@delete: d",
            "delete@d()",
            "clear@n.clear()",
            "get@m.get(1)"
        ]
    );
}

#[test]
fn members_on_a_path_are_followed_through_each_step() {
    let source = "const m = import.meta; m.env.SSR; const { env } = m; env.SSR; \
                  const { SSR } = env; const e = m.env; e[\"SSR\"]; m.SSR; m.env.other;";
    let found = uses(source, |tree, sem, parents, program| {
        let rsvelte_typescript_syntax::Kind::Program(statements) = tree.kind(program) else {
            unreachable!()
        };
        let rsvelte_typescript_syntax::Kind::VariableDeclaration { declarations, .. } =
            tree.kind(statements[0])
        else {
            unreachable!()
        };
        let rsvelte_typescript_syntax::Kind::Declarator {
            initializer: Some(meta),
            ..
        } = tree.kind(declarations[0])
        else {
            unreachable!()
        };
        property_references(tree, sem, parents, source, meta, &["env"], &["SSR"])
    });
    assert_eq!(
        found,
        ["SSR@m.env.SSR", "SSR@env.SSR", "SSR@SSR", "SSR@e[\"SSR\"]"]
    );
}
