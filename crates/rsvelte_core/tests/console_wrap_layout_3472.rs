//! A console call in a statement fragment oxc cannot parse was wrapped by
//! argument *spelling* instead of by upstream's rule (#3472).
//!
//! The instance-script pipeline splits on source lines, so a declaration that
//! shares a line with the head of a multi-line statement produces fragments
//! that are not standalone programs. `with_program` refuses those, and the
//! text fallback then decided the wrap with `!all_args_are_literals` — which
//! says "wrap" for an identifier, a binary expression, an arrow and a `!x`,
//! all of which upstream evaluates to a known value.
//!
//! The grid is argument shape x source layout. Only the layout moves between
//! the two columns; the program is otherwise identical, so a cell that differs
//! between them is layout-dependence and nothing else. Every expected string is
//! the official compiler's own output (`submodules/svelte`, 5.56.9,
//! 20b341f10), read from the same module instance that compiled the sources.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// `(id, source, the console line official emits)`.
const GRID: &[(&str, &str, &str)] = &[
    (
        "state_known/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(n);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(n);",
    ),
    (
        "state_known/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(n);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(n);",
    ),
    (
        "state_reassigned/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(m);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(...$.log_if_contains_state('log', $.get(m)));",
    ),
    (
        "state_reassigned/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(m);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(...$.log_if_contains_state('log', $.get(m)));",
    ),
    (
        "string/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(\"hi\");\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(\"hi\");",
    ),
    (
        "string/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(\"hi\");\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(\"hi\");",
    ),
    (
        "number/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(1);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(1);",
    ),
    (
        "number/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(1);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(1);",
    ),
    (
        "binary/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(a + b);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(a + b);",
    ),
    (
        "binary/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(a + b);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(a + b);",
    ),
    (
        "template/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(`x${n}`);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(`x${n}`);",
    ),
    (
        "template/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(`x${n}`);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(`x${n}`);",
    ),
    (
        "undefined/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(undefined);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(undefined);",
    ),
    (
        "undefined/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(undefined);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(undefined);",
    ),
    (
        "arrow/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log((x) => x);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log((x) => x);",
    ),
    (
        "arrow/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log((x) => x);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log((x) => x);",
    ),
    (
        "not/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(!n);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(!n);",
    ),
    (
        "not/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(!n);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(!n);",
    ),
    (
        "call/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(f());\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(...$.log_if_contains_state('log', f()));",
    ),
    (
        "call/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(f());\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(...$.log_if_contains_state('log', f()));",
    ),
    (
        "spread/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(...[1, 2]);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(...$.log_if_contains_state('log', ...[1, 2]));",
    ),
    (
        "spread/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(...[1, 2]);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(...$.log_if_contains_state('log', ...[1, 2]));",
    ),
    (
        "mixed/separate",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; }\n\t$effect(() => {\n\t\tconsole.log(\"x:\", n);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(\"x:\", n);",
    ),
    (
        "mixed/same_line",
        "<script>\n\tlet n = $state(1);\n\tlet m = $state(2);\n\tlet a = 1;\n\tlet b = 2;\n\tfunction f() { return 1; }\n\tfunction bump() { m = 3; } $effect(() => {\n\t\tconsole.log(\"x:\", n);\n\t});\n</script>\n<b onclick={bump}>x</b>\n",
        "console.log(\"x:\", n);",
    ),
];

#[test]
fn console_wrap_does_not_depend_on_source_layout() {
    let mut failures = Vec::new();
    for (id, source, want) in GRID {
        let code = compile(
            source,
            CompileOptions {
                generate: GenerateMode::Client,
                dev: true,
                filename: Some("T.svelte".into()),
                ..Default::default()
            },
        )
        .map(|r| r.js.code)
        .unwrap_or_else(|err| format!("ERROR {:?}", err.diagnostic().code));

        let got = code
            .lines()
            .find(|line| line.contains("console."))
            .unwrap_or("<no console call>")
            .trim();
        if got != *want {
            failures.push(format!("{id}:\n   want {want}\n   got  {got}"));
        }
    }
    assert!(
        failures.is_empty(),
        "{} of {} cells diverge from the official compiler:\n{}",
        failures.len(),
        GRID.len(),
        failures.join("\n")
    );
}
