//! A `{#snippet}`'s body is scoped from the ancestors of the places the snippet
//! is used, and upstream counts a component the snippet is passed to as one of
//! those places (`analysis.snippet_renderers` holds a `Component` next to every
//! `{@render}` tag). rsvelte collected only the `{@render}` tags, so a snippet
//! reached solely through a prop was scoped as if it had no ancestor at all.
//!
//! Every expectation is the official compiler's output for the same source,
//! measured across all three targets, which agree on every row.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

fn out(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".to_string()),
            generate,
            dev,
            css: CssMode::External,
            runes: Some(true),
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

struct Row {
    name: &'static str,
    src: &'static str,
    a: bool,
    b: bool,
}

const ROWS: &[Row] = &[
    // The defect: the snippet is never `{@render}`ed here, only handed to `<C>`.
    Row {
        name: "snippet passed as a component prop, nested rule",
        src: "<script>\n\timport C from \"./C.svelte\";\n</script>\n{#snippet s()}\n\t<span class=\"b\"></span>\n{/snippet}\n<div class=\"a\"><C icon={s} /></div>\n<style>\n\t.a { .b { color: red } }\n</style>\n",
        a: true,
        b: true,
    },
    Row {
        name: "snippet passed as a component prop, nested rule with an inner :global",
        src: "<script>\n\timport C from \"./C.svelte\";\n</script>\n{#snippet s()}\n\t<span class=\"b\"><i></i></span>\n{/snippet}\n<div class=\"a\"><C icon={s} /></div>\n<style>\n\t.a {\n\t\t.b {\n\t\t\tcolor: red;\n\t\t\t:global(i) { color: blue }\n\t\t}\n\t}\n</style>\n",
        a: true,
        b: true,
    },
    // Controls that already passed: the fix must not move them.
    Row {
        name: "snippet rendered with {@render}, nested rule",
        src: "{#snippet s()}\n\t<span class=\"b\"></span>\n{/snippet}\n<div class=\"a\">{@render s()}</div>\n<style>\n\t.a { .b { color: red } }\n</style>\n",
        a: true,
        b: true,
    },
    Row {
        name: "a snippet nobody uses scopes nothing in its body",
        src: "{#snippet s()}\n\t<span class=\"b\"></span>\n{/snippet}\n<div class=\"a\"></div>\n<style>\n\t.a { .b { color: red } }\n</style>\n",
        a: true,
        b: false,
    },
    Row {
        name: "a rule that names only the snippet's own subject",
        src: "{#snippet s()}\n\t<span class=\"b\"></span>\n{/snippet}\n{@render s()}\n<style>\n\t.b { color: red }\n</style>\n",
        a: false,
        b: true,
    },
    Row {
        name: "the parent selector matches no element in the markup",
        src: "{#snippet s()}\n\t<span class=\"b\"></span>\n{/snippet}\n{@render s()}\n<style>\n\t.a .b { color: red }\n</style>\n",
        a: false,
        b: false,
    },
    Row {
        name: "plain nesting, no snippet",
        src: "<div class=\"a\"><span class=\"b\"></span></div>\n<style>\n\t.a { .b { color: red } }\n</style>\n",
        a: true,
        b: true,
    },
    Row {
        name: "plain nesting, flat descendant selector",
        src: "<div class=\"a\"><span class=\"b\"></span></div>\n<style>\n\t.a .b { color: red }\n</style>\n",
        a: true,
        b: true,
    },
    Row {
        name: "an {#each} body is not a snippet",
        src: "<div class=\"a\">{#each [1] as i}<span class=\"b\"></span>{/each}</div>\n<style>\n\t.a { .b { color: red } }\n</style>\n",
        a: true,
        b: true,
    },
    Row {
        name: "the snippet is declared inside the parent it is rendered in",
        src: "<div class=\"a\">{#snippet s()}<span class=\"b\"></span>{/snippet}{@render s()}</div>\n<style>\n\t.a { .b { color: red } }\n</style>\n",
        a: true,
        b: true,
    },
];

#[test]
fn a_snippet_reached_only_through_a_component_prop_is_scoped_from_that_component() {
    let targets = [
        ("server", GenerateMode::Server, false),
        ("client", GenerateMode::Client, false),
        ("client-dev", GenerateMode::Client, true),
    ];
    let mut failures = Vec::new();
    for row in ROWS {
        for (tname, generate, dev) in targets {
            let code = out(row.src, generate, dev);
            for (class, want) in [("a", row.a), ("b", row.b)] {
                // The scope class survives into client output inside a template
                // string as well as a server `class="…"`, so match the token pair.
                let present = code.contains(&format!("{class} svelte-"));
                if present != want {
                    failures.push(format!(
                        "{} [{tname}] .{class}: want scoped={want}, got={present}",
                        row.name
                    ));
                }
            }
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
