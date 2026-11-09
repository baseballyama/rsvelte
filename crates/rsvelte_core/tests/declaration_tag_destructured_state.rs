//! A destructured `$state` / `$derived` in a declaration tag. Every expected
//! line is the official compiler's output for the component it is checked on.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(source: &str, filename: &str) -> String {
    compile_with(source, filename, GenerateMode::Client)
}

fn compile_with(source: &str, filename: &str, generate: GenerateMode) -> String {
    compile(
        source,
        CompileOptions {
            filename: Some(filename.to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("official compiles it")
    .js
    .code
}

const SCRIPTLESS: &str = "<p>no script</p>
{let [a, b] = $state([1, 2])}
{let { c, d } = $state({ c: 3, d: 4 })}
<p>{a}{b}{c}{d}</p>
";

const SCRIPTLESS_LINES: &str = "\tlet tmp = [1, 2],
\t\t$$array = $.derived(() => $.to_array(tmp, 2)),
\t\ta = $.proxy($.get($$array)[0]),
\t\tb = $.proxy($.get($$array)[1]);

\tlet tmp_1 = { c: 3, d: 4 },
\t\tc = $.proxy(tmp_1.c),
\t\td = $.proxy(tmp_1.d);
";

#[test]
fn a_component_without_a_script_lays_out_and_numbers_its_temps_like_official() {
    let code = client(SCRIPTLESS, "C32.svelte");
    assert!(code.contains(SCRIPTLESS_LINES), "got\n{code}");
}

#[test]
fn temp_numbering_does_not_carry_over_from_an_earlier_compile_on_the_thread() {
    let first = client(SCRIPTLESS, "C32.svelte");
    client(
        "<script>\n\tlet [x] = $state([1]);\n\tlet { y } = $state({ y: 2 });\n\tconst [z] = $derived.by(() => [x]);\n</script>\n{x}{y}{z}\n",
        "Other.svelte",
    );
    assert_eq!(client(SCRIPTLESS, "C32.svelte"), first);
}

#[test]
fn a_destructured_tag_beside_another_declarator_stays_one_declaration() {
    let code = client(
        "{let [a] = $state([1]), b = $state(2), { c } = $derived({ c: a + b })}\n<p>{a}{b}{c}</p>\n<button onclick={() => { a++; b++; }}>x</button>\n",
        "C08.svelte",
    );
    let expected = "\tlet tmp = [1],
\t\t$$array = $.derived(() => $.to_array(tmp, 1)),
\t\ta = $.state($.proxy($.get($$array)[0])),
\t\tb = $.state(2),
\t\t$$d = $.derived(() => ({ c: $.get(a) + $.get(b) })),
\t\tc = $.derived(() => $.get($$d).c);
";
    assert!(code.contains(expected), "got\n{code}");
}

#[test]
fn a_default_that_reads_state_is_not_thunked() {
    let code = client(
        "<script>\n\tlet n = $state(1);\n</script>\n{let { a = n } = $state({})}\n{const [x = n * 2] = $derived([])}\n<p>{a}{x}</p>\n<button onclick={() => { n++; a = 7; }}>x</button>\n",
        "C05.svelte",
    );
    assert!(
        code.contains("x = $.derived(() => $.fallback($.get($$array)[0], $.get(n) * 2));"),
        "got\n{code}"
    );
}

#[test]
fn a_destructured_tag_name_shadows_an_outer_constant_on_the_server() {
    let code = compile_with(
        "<script>\n\tlet n = $state(1);\n\tlet items = $state([1, 2]);\n</script>\n{#if n}\n\t{let [n] = $state([5])}\n\t<p>{n}</p>\n\t<button onclick={() => n++}>x</button>\n{/if}\n",
        "C09.svelte",
        GenerateMode::Server,
    );
    assert!(
        code.contains("$$renderer.push(`<p>${$.escape(n)}</p> <button>x</button>`);"),
        "got\n{code}"
    );
}
