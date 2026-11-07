//! An arrow function whose expression body starts on the line after `=>` must stay
//! one statement in a script with a top-level `await`. The async-body statement
//! splitter used to end the statement at `=>` when the next line began with `$.`
//! (a read of a `$derived`) or a statement keyword, leaving `const f = (x) =>`
//! with no body and the body as a separate expression statement.

use rsvelte_core::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

fn compile_async(src: &str, ssr: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: if ssr {
                GenerateMode::Server
            } else {
                GenerateMode::Client
            },
            dev: false,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"))
}

/// The statement that starts at `needle`, up to the next `;` at the end of a line.
fn statement_from<'a>(out: &'a str, needle: &str) -> &'a str {
    let start = out
        .find(needle)
        .unwrap_or_else(|| panic!("`{needle}` missing:\n{out}"));
    let rest = &out[start..];
    let end = rest.find(";\n").map_or(rest.len(), |e| e + 1);
    &rest[..end]
}

#[test]
fn arrow_body_on_the_next_line_stays_with_its_arrow() {
    let src = "<script>
	let { a } = $props();
	const first = await Promise.resolve(1);
	let d = $derived(a);
	const f = (x) =>
		d && x;
	const g = (id) => id;
</script>
<p>{f(first)}{g(1)}</p>
";
    for ssr in [false, true] {
        let out = compile_async(src, ssr);
        assert!(!out.contains("COMPILE_ERROR"), "ssr={ssr}: {out}");
        let stmt = statement_from(&out, "const f = ");
        assert!(
            stmt.contains("&& x"),
            "ssr={ssr}: the body of `f` was split off:\n{out}"
        );
        assert!(
            !out.contains("=>\n\tconst g")
                && !out.contains("=>\n\t\tconst g")
                && !out.contains("=>\n\t\t\tconst g"),
            "ssr={ssr}: `f` has no body:\n{out}"
        );
    }
}

#[test]
fn logical_operator_continuation_on_the_next_line_stays_one_statement() {
    let src = "<script>
	let { a } = $props();
	const first = await Promise.resolve(1);
	let d = $derived(a);
	const both = a ||
		d;
</script>
<p>{both}{first}</p>
";
    let out = compile_async(src, false);
    assert!(!out.contains("COMPILE_ERROR"), "{out}");
    assert!(
        out.contains("both = $$props.a || $.get(d);"),
        "the operand after `||` was split off:\n{out}"
    );
}

fn collapse_ws(s: &str) -> String {
    s.split_whitespace().collect::<Vec<_>>().join(" ")
}

/// An instance-script tail after a top-level `await`, and the statement Svelte
/// 5.57.3 prints for it on the client and on the server (whitespace collapsed).
const CELLS: &[(&str, &str, &str, &str)] = &[
    (
        "line comment after the operator",
        "\tconst both = a || // note\n\t\td;",
        "both = $$props.a || $.get(d);",
        "both = a || d();",
    ),
    (
        "block comment after the operator",
        "\tconst both = a || /* note */\n\t\td;",
        "both = $$props.a || $.get(d);",
        "both = a || d();",
    ),
    (
        "string holding `//` before the operator",
        "\tconst u = 'http://x' +\n\t\td;",
        "u = 'http://x' + $.get(d);",
        "u = 'http://x' + d();",
    ),
    (
        "keyword operator at the end of the line",
        "\tconst p = typeof\n\t\td;",
        "p = typeof $.get(d);",
        "p = typeof d();",
    ),
    (
        "brace-less `if` body on the next line",
        "\tif (a)\n\t\tawait Promise.resolve(d);",
        "async () => { if ($$props.a) await Promise.resolve($.get(d)); }",
        "async () => { if (a) await Promise.resolve(d()); }",
    ),
    (
        "brace-less `else` body on the next line",
        "\tif (a) s = 1;\n\telse\n\t\ts = d;",
        "if ($$props.a) $.set(s, 1); else $.set(s, $.get(d), true);",
        "if (a) s = 1; else s = d();",
    ),
    (
        "async arrow after the first await",
        "\tconst f = async (x) =>\n\t\tawait x;",
        "const f = async (x) => await x; var first, d, s;",
        "const f = async (x) => await x; var first, d, s;",
    ),
];

#[test]
fn a_statement_continued_on_the_next_line_matches_upstream() {
    let mut failures = Vec::new();
    for &(label, tail, client, server) in CELLS {
        let src = format!(
            "<script>\n\tlet {{ a }} = $props();\n\tconst first = await Promise.resolve(1);\n\tlet d = $derived(a);\n\tlet s = $state(0);\n{tail}\n</script>\n<p>{{first}}{{d}}{{s}}</p>\n"
        );
        for (ssr, expected) in [(false, client), (true, server)] {
            // Upstream drops these comments on the client; where a comment lands is
            // not what this test covers, so it is removed before comparing.
            let out = compile_async(&src, ssr)
                .replace("// note", "")
                .replace("/* note */", "");
            let out = collapse_ws(&out);
            if !out.contains(expected) {
                failures.push(format!(
                    "{label} (ssr={ssr}): expected `{expected}` in\n{out}"
                ));
            }
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n\n"));
}
