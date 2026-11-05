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
