//! Issue #2368: a comment inside a legacy `$:` statement must follow upstream's
//! comment cursor, not be deleted.
//!
//! Upstream replaces the statement with `b.empty`: the comment re-homes onto
//! the next surviving statement, and a `BlockStatement`
//! *nested* in the `$:` body keeps its span, so the cursor rewinds into it and
//! prints the comment a second time in place.
//!
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    let code = compile(
        src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .map(|r| r.js.code)
    .unwrap_or_else(|e| format!("COMPILE_ERROR: {e:?}"));
    let start = code
        .find("export default")
        .unwrap_or_else(|| panic!("no component function: {code}"));
    code[start..].trim_end().to_string()
}

/// A comment directly in the `$:` body's own block: the body block is rebuilt as
/// a span-less `b.block(body)`, so it is printed once, on the successor.
#[test]
fn rehomes_a_block_body_comment_onto_the_surviving_successor() {
    let out = client(
        "<script>\n\tlet bar;\n\t$: {\n\t\t/* inner */\n\t\tbar = []\n\t}\n\tlet z = 1;\n\tconsole.log(z);\n</script>",
    );
    assert!(out.contains("\t/* inner */\n\tlet z = 1;"), "{out}");
    assert!(out.contains("$.set(bar, []);"), "{out}");
    assert_eq!(out.matches("/* inner */").count(), 1, "{out}");
}

/// A comment inside a nested `BlockStatement` — the `if`'s consequent keeps its
/// source span, so it is printed twice.
#[test]
fn keeps_a_nested_block_comment_and_rehomes_a_copy() {
    let out = client(
        "<script>\n\tlet a = 1;\n\tlet b;\n\t$: if (a) {\n\t\t/* inner */\n\t\tb = 1;\n\t}\n\tlet z = 1;\n\tconsole.log(z, b);\n</script>",
    );
    assert!(out.contains("\t/* inner */\n\tlet z = 1;"), "{out}");
    assert!(
        out.contains("\t\t\t/* inner */\n\t\t\t$.set(b, 1);"),
        "{out}"
    );
    assert_eq!(out.matches("/* inner */").count(), 2, "{out}");
}

/// The control for the case #2355 / PR #2365 already handled: with nothing left
/// to re-home onto, the cursor parks past the end and the comment is lost. This
/// must keep passing — re-homing may not resurrect it.
#[test]
fn still_drops_a_block_body_comment_with_no_successor() {
    let out = client("<script>\n\tlet bar;\n\t$: {\n\t\t/* inner */\n\t\tbar = []\n\t}\n</script>");
    assert!(!out.contains("/* inner */"), "{out}");
    assert!(out.contains("$.set(bar, []);"), "{out}");
}

/// The other half of that control: with no successor the comment is still not
/// re-homed, but a nested block keeps its own copy — so "nothing survives" is
/// not the same claim as "nothing is printed".
#[test]
fn keeps_a_nested_block_comment_with_no_successor() {
    let out = client(
        "<script>\n\tlet bar;\n\t$: if (bar) {\n\t\t/* inner */\n\t\tbar = [];\n\t}\n</script>",
    );
    assert!(
        out.contains("\t\tif ($.get(bar)) {\n\t\t\t/* inner */\n"),
        "{out}"
    );
    assert_eq!(out.matches("/* inner */").count(), 1, "{out}");
}

/// An object literal's braces are not a `BlockStatement`, so the comment only
/// re-homes; the guard is the AST's, not the byte scanner's.
#[test]
fn an_object_literal_does_not_keep_the_comment_in_place() {
    let out = client(
        "<script>\n\tlet bar;\n\t$: {\n\t\tbar = {\n\t\t\t/* inner */\n\t\t\ta: 1\n\t\t};\n\t}\n\tlet z = 1;\n\tconsole.log(z, bar);\n</script>",
    );
    assert!(out.contains("\t/* inner */\n\tlet z = 1;"), "{out}");
    assert_eq!(out.matches("/* inner */").count(), 1, "{out}");
}

/// A comment trailing the statement on its own line is inside the statement's
/// span too, and upstream re-homes it just the same.
#[test]
fn rehomes_a_comment_trailing_the_statement() {
    let out = client(
        "<script>\n\tlet count = 1;\n\tlet double;\n\t$: double = count * 2; // this too\n\tlet z = 1;\n\tconsole.log(z, double);\n</script>",
    );
    assert!(out.contains("\t// this too\n\tlet z = 1;"), "{out}");
    assert_eq!(out.matches("// this too").count(), 1, "{out}");
}

/// `$: if (…) { … } else if (…) { … }` — the statement does not end at the
/// first `}`. Re-homing inserts text at the statement's end, so a short span
/// splits the chain: the `else if` escaped the effect and the re-homed comment
/// landed in front of it, producing `// fa else if (…) {` and unparseable
/// output. `svelte-ux`'s `Icon.svelte` is the corpus entry that caught it.
#[test]
fn an_else_if_chain_is_one_statement() {
    let out = client(
        "<script>\n\tlet data;\n\tlet out = 1;\n\t$: if (typeof data === \"object\") {\n\t\t// fa\n\t\tout = 2;\n\t} else if (typeof data === \"string\") {\n\t\t// str\n\t\tout = 3;\n\t}\n\tconsole.log(out);\n</script>",
    );
    assert!(
        out.contains("} else if (typeof data === 'string') {"),
        "{out}"
    );
    assert_eq!(out.matches("// fa").count(), 2, "{out}");
    assert_eq!(out.matches("// str").count(), 2, "{out}");
    assert!(out.contains("console.log($.get(out));"), "{out}");
}

/// `catch` and `finally` continue a statement the same way `else` does. Only
/// the effect body is compared: upstream parenthesizes the dependency thunk
/// differently, which the corpus normalizer erases and this fix does not touch.
#[test]
fn catch_and_finally_continue_the_statement() {
    let out = client(
        "<script>\n\tlet a;\n\tlet out = 1;\n\t$: try {\n\t\t// t\n\t\tout = a;\n\t} catch (e) {\n\t\t// c\n\t\tout = 0;\n\t} finally {\n\t\t// f\n\t\tout += 1;\n\t}\n\tconsole.log(out);\n</script>",
    );
    assert!(
        out.contains(
            "\t\ttry {\n\t\t\t// t\n\t\t\t$.set(out, a);\n\t\t} catch (e) {\n\t\t\t// c\n\t\t\t$.set(out, 0);\n\t\t} finally {\n\t\t\t// f\n\t\t\t$.set(out, $.get(out) + 1);\n\t\t}\n"
        ),
        "{out}"
    );
    assert!(
        out.contains("\t// t\n\t// c\n\t// f\n\tconsole.log("),
        "{out}"
    );
}

/// The negative control for the rule above: `while` also *begins* a statement,
/// so a `while` after a plain `$: { … }` must stay a statement of its own. A
/// fix that absorbed every keyword following the closing brace would swallow it
/// and both tests above would still pass.
#[test]
fn a_while_after_the_block_is_not_absorbed() {
    let out = client(
        "<script>\n\tlet bar;\n\tlet i = 0;\n\t$: {\n\t\t// inner\n\t\tbar = [];\n\t}\n\twhile (i < 1) {\n\t\ti += 1;\n\t}\n\tconsole.log(bar, i);\n</script>",
    );
    assert!(out.contains("\t// inner\n\twhile (i < 1) {"), "{out}");
    assert!(out.contains("console.log($.get(bar), i);"), "{out}");
    assert!(out.contains("$.set(bar, []);"), "{out}");
    assert_eq!(out.matches("// inner").count(), 1, "{out}");
}
