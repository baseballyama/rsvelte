//! The four cells that fix the scope of the rebuilt-declaration comment defect.
//!
//! A rune declaration is not printed from its source node: it is rebuilt into
//! `var a, b;` plus a separate `$.run([…])`. The negative control below — a
//! plain `let a = 1, b = 2;` carrying the same leading comment — matches
//! upstream byte for byte, so `variable_declaration`'s general layout path is
//! not what breaks. Only the rebuilt path is.
//!
//! The single-declarator cell separates the two things the two-declarator cell
//! shows at once: with no per-declarator indent in play, what remains is that
//! the newline after the comment is written without the current indent. That
//! cell is the one still diverging; the other three are pinned as matching.
//!
//! Every expectation is the official compiler's bytes (5.56.10, client,
//! `experimental: { async: true }`).

use rsvelte_core::compiler::ExperimentalOptions;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(body: &str) -> String {
    let src = format!(
        "<script>\n\tlet {{ p, q }} = $props();\n\t{body}\n</script>\n\n<p>{{typeof a}}</p>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The three lines from the first `var`/`let` declaration onwards — the window
/// the whole grid is read through.
fn declaration_window(out: &str) -> Vec<String> {
    let lines: Vec<&str> = out.lines().collect();
    let at = lines
        .iter()
        .position(|l| l.starts_with("\tvar ") || l.starts_with("\tlet "))
        .expect("a declaration");
    lines[at..(at + 3).min(lines.len())]
        .iter()
        .map(|l| (*l).to_string())
        .collect()
}

const IGNORE: &str = "// svelte-ignore await_waterfall";
const PLAIN: &str = "// c";
const TWO_RUNES: &str = "const a = $derived(await p), b = $derived(await q);";
const ONE_RUNE: &str = "const a = $derived(await p);";

/// The cell the `Test` shards were red on. The comment sits after the keyword
/// and each declarator gets its own line at one extra level of indent.
#[test]
fn a_svelte_ignore_before_two_rune_declarators() {
    assert_eq!(
        declaration_window(&client(&format!("{IGNORE}\n\t{TWO_RUNES}"))),
        vec![
            format!("\tvar {IGNORE}"),
            "\t\ta,".to_string(),
            "\t\tb;".to_string()
        ]
    );
}

/// The same shape with an ordinary comment. It used to vanish from rsvelte's
/// output entirely while the `svelte-ignore` one survived, which read as a
/// second defect; both are the one textual `await` guard.
#[test]
fn a_plain_comment_before_two_rune_declarators() {
    assert_eq!(
        declaration_window(&client(&format!("{PLAIN}\n\t{TWO_RUNES}"))),
        vec![
            format!("\tvar {PLAIN}"),
            "\t\ta,".to_string(),
            "\t\tb;".to_string()
        ]
    );
}

/// The negative control, and it is what bounds the defect: a NON-rune multi
/// declarator carrying the same comment already matches, so the general
/// `variable_declaration` layout path — the `any_multiline` roll-up, the
/// `indent()`, the leading flush — is correct as it stands.
#[test]
fn a_plain_comment_before_two_non_rune_declarators() {
    assert_eq!(
        declaration_window(&client(&format!("{PLAIN}\n\tlet a = 1, b = 2;"))),
        vec![
            format!("\tlet {PLAIN}"),
            "\ta = 1;".to_string(),
            String::new()
        ]
    );
}

/// The cell that used to diverge, kept separate so the three above cannot hide
/// it. With one declarator there is no extra indent level, so what remained was
/// exactly "the newline after the comment carries no indent" — rsvelte wrote
/// `a;` where upstream writes `\ta;`. It is pinned at upstream's bytes now that
/// the continuation reads the `var` line's own indent.
///
/// A literal `"\n\t"` passes this cell too, and no input found so far separates
/// the two: the hoist sits at one tab in every shape a probe reached (top
/// level, inside an each block, one declarator and two). The insertion reads
/// the line's own indent because that is right by construction, not because a
/// deeper case was measured — if one is ever found, it belongs here as a row.
#[test]
fn a_single_rune_declarator_keeps_the_var_lines_indent() {
    let got = declaration_window(&client(&format!("{IGNORE}\n\t{ONE_RUNE}")));
    assert_eq!(got[0], format!("\tvar {IGNORE}"));
    assert_eq!(got[1], "\ta;");
}
