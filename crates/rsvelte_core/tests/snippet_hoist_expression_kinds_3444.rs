//! Whether a top-level snippet is hoisted to module scope must not depend on
//! which expression kinds the hoist predicate happens to enumerate.
//!
//! Every `expect` below is the answer the official compiler (5.56.9) gives for
//! the same source on the same target, read off its output rather than reasoned
//! about. `hoist: true` rows are the defect direction (rsvelte declined a hoist
//! official performs); `hoist: false` rows are the controls that must not move,
//! because hoisting a snippet that closes over instance state is a correctness
//! bug, not a missed optimisation.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

struct Cell {
    name: &'static str,
    source: &'static str,
    hoist: bool,
}

const CELLS: &[Cell] = &[
    Cell {
        name: "static",
        source: "{#snippet outer()}x{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "ref-module",
        source: "<script module>\n\tconst M = 1;\n</script>\n{#snippet outer()}{M}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "ref-instance",
        source: "<script>\n\tlet n = $state(1);\n</script>\n{#snippet outer()}{n}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "ref-store",
        source: "<script>\n\timport { writable } from 'svelte/store';\n\tconst cnt = writable(0);\n</script>\n{#snippet outer()}{$cnt}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "rune-state-callee",
        source: "<script>\n\tlet n = $state(1);\n</script>\n{#snippet outer()}{@render n?.()}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "inner-plain",
        source: "{#snippet outer()}{#snippet s()}x{/snippet}{@render s()}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "inner-optional",
        source: "{#snippet outer()}{#snippet s()}x{/snippet}{@render s?.()}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "inner-optional-arg",
        source: "{#snippet outer()}{#snippet s(a)}{a}{/snippet}{@render s?.(1)}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "inner-optional-arg-module",
        source: "<script module>\n\tconst M = 1;\n</script>\n{#snippet outer()}{#snippet s(a)}{a}{/snippet}{@render s?.(M)}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "inner-optional-arg-instance",
        source: "<script>\n\tlet n = $state(1);\n</script>\n{#snippet outer()}{#snippet s(a)}{a}{/snippet}{@render s?.(n)}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "inner-optional-3deep",
        source: "{#snippet outer()}{#snippet s()}{#snippet t()}x{/snippet}{@render t?.()}{/snippet}{@render s?.()}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "call-module-fn-plain",
        source: "<script module>\n\tfunction mf() {}\n</script>\n{#snippet outer()}{mf()}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "call-module-fn-optional",
        source: "<script module>\n\tfunction mf() {}\n</script>\n{#snippet outer()}{mf?.()}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "call-instance-fn-plain",
        source: "<script>\n\tconst inf = () => {};\n</script>\n{#snippet outer()}{inf()}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "call-instance-fn-optional",
        source: "<script>\n\tconst inf = () => {};\n</script>\n{#snippet outer()}{inf?.()}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "member-module-plain",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{mo.a}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "member-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{mo?.a}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "member-module-optional-computed",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{mo?.[0]}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "member-instance-plain",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{io.a}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "member-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{io?.a}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "member-instance-optional-computed",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{io?.[0]}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "member-optional-instance-index",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n<script>\n\tlet n = $state(1);\n</script>\n{#snippet outer()}{mo?.[n]}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "render-member-module-plain",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{@render mo.s()}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "render-member-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{@render mo?.s?.()}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "render-member-instance-plain",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{@render io.s()}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "render-member-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{@render io?.s?.()}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "attr-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}<div title={mo?.a}></div>{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "attr-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}<div title={io?.a}></div>{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "const-tag-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{@const v = mo?.a}{v}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "const-tag-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{@const v = io?.a}{v}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "arrow-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}<div onclick={() => mo?.a}></div>{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "arrow-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}<div onclick={() => io?.a}></div>{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "if-test-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{#if mo?.a}y{/if}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "if-test-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{#if io?.a}y{/if}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "each-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{#each mo?.a ?? [] as z}{z}{/each}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "each-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{#each io?.a ?? [] as z}{z}{/each}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "html-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{@html mo?.a}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "html-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{@html io?.a}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "tagged-template-module",
        source: "<script module>\n\tfunction tag() { return 1; }\n</script>\n{#snippet outer()}{tag`x`}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "tagged-template-instance",
        source: "<script>\n\tconst itag = () => 1;\n</script>\n{#snippet outer()}{itag`x`}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "await-module",
        source: "<script module>\n\tconst mp = Promise.resolve(1);\n</script>\n{#snippet outer()}{#await mp then v}{v}{/await}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "class-expr-module",
        source: "<script module>\n\tconst M = 1;\n</script>\n{#snippet outer()}{new (class { m() { return M; } })().m()}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "class-expr-instance",
        source: "<script>\n\tlet n = $state(1);\n</script>\n{#snippet outer()}{new (class { m() { return n; } })().m()}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "seq-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{(0, mo?.a)}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "seq-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{(0, io?.a)}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "nullish-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n\tconst M = 1;\n</script>\n{#snippet outer()}{mo?.a ?? M}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "nullish-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{io?.a ?? 1}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "ts-as-module",
        source: "<script module lang=\"ts\">\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{(mo as any)?.a}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "ts-as-instance",
        source: "<script lang=\"ts\">\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{(io as any)?.a}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "ts-nonnull-module",
        source: "<script module lang=\"ts\">\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer()}{mo!.a}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "ts-nonnull-instance",
        source: "<script lang=\"ts\">\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer()}{io!.a}{/snippet}\n{@render outer()}\n",
        hoist: false,
    },
    Cell {
        name: "bigint-literal",
        source: "{#snippet outer()}{1n}{/snippet}\n{@render outer()}\n",
        hoist: true,
    },
    Cell {
        name: "param-default-module-optional",
        source: "<script module>\n\tconst mo = { a: 1, s: null };\n</script>\n{#snippet outer(a = mo?.a)}{a}{/snippet}\n{@render outer(1)}\n",
        hoist: true,
    },
    Cell {
        name: "param-default-instance-optional",
        source: "<script>\n\tlet io = $state({ a: 1, s: null });\n</script>\n{#snippet outer(a = io?.a)}{a}{/snippet}\n{@render outer(1)}\n",
        hoist: false,
    },
    Cell {
        name: "param-optional-call",
        source: "{#snippet outer(f)}{f?.()}{/snippet}\n{@render outer(1)}\n",
        hoist: true,
    },
    Cell {
        name: "param-optional-member",
        source: "{#snippet outer(p)}{p?.a}{/snippet}\n{@render outer(1)}\n",
        hoist: true,
    },
];

fn code(source: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        source,
        CompileOptions {
            generate,
            dev,
            ..Default::default()
        },
    )
    .unwrap_or_else(|error| panic!("compile failed: {error:?}"))
    .js
    .code
}

/// A hoisted snippet is declared at module scope, so its declaration starts at
/// column 0; a pinned one is nested inside the component function and indented.
fn is_hoisted(output: &str) -> bool {
    output
        .lines()
        .any(|line| line.starts_with("const outer = ") || line.starts_with("function outer("))
}

fn run(generate: GenerateMode, dev: bool, target: &str) {
    let mut wrong = Vec::new();
    for cell in CELLS {
        let output = code(cell.source, generate, dev);
        if is_hoisted(&output) != cell.hoist {
            wrong.push(format!(
                "{} [{target}]: official hoists = {}, rsvelte hoists = {}\n--- source ---\n{}--- output ---\n{output}",
                cell.name,
                cell.hoist,
                !cell.hoist,
                cell.source
            ));
        }
    }
    assert!(
        wrong.is_empty(),
        "{} of {} cells disagree with the official hoist decision:\n\n{}",
        wrong.len(),
        CELLS.len(),
        wrong.join("\n\n")
    );
}

#[test]
fn hoist_decision_matches_official_on_client() {
    run(GenerateMode::Client, false, "client");
}

#[test]
fn hoist_decision_matches_official_on_client_dev() {
    run(GenerateMode::Client, true, "client-dev");
}

#[test]
fn hoist_decision_matches_official_on_server() {
    run(GenerateMode::Server, false, "server");
}
