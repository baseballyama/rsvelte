//! The control for the call-argument trailing-comment bound.
//!
//! `Printer::call_arguments` is the one site that hands
//! `flush_trailing_comments` an unconditional `Some(call_end)`. That bound is
//! what keeps a comment written after the `)` from being pulled inside the
//! argument list, so any change to it has to keep these three shapes fixed —
//! a fix that simply stops passing the bound turns `after_paren` into
//! `foo(a /* c */)`, which no gate keyed on a source-map segment can observe.
//!
//! The pair is what makes this discriminating: `inside_paren` and `after_paren`
//! differ only in which side of the `)` the comment sits on, so a rule that
//! gets one right by ignoring the bound gets the other wrong.
//!
//! Every expectation is the official compiler's bytes (5.56.10, client, prod),
//! taken from `submodules/svelte/packages/svelte/src/compiler/index.js` — not
//! the npm build, which disagrees with it on other shapes.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(body: &str) -> String {
    let src = format!(
        "<script>\n  function foo(x) {{ return x; }}\n  let a = 1;\n  {body}\n</script>\n<p>{{a}}</p>\n"
    );
    compile(
        &src,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// The single generated line that calls `foo`, which is the whole observable.
fn call_line(out: &str) -> String {
    out.lines()
        .find(|line| line.contains("foo(a"))
        .unwrap_or_else(|| panic!("no `foo(a` line in:\n{out}"))
        .to_string()
}

#[test]
fn a_block_comment_after_the_paren_stays_outside_the_call() {
    assert_eq!(call_line(&client("foo(a) /* c */;")), "\tfoo(a); /* c */");
}

#[test]
fn a_block_comment_before_the_paren_stays_inside_the_call() {
    assert_eq!(call_line(&client("foo(a /* c */);")), "\tfoo(a /* c */);");
}

#[test]
fn a_line_comment_after_the_call_stays_on_its_line() {
    assert_eq!(call_line(&client("foo(a); // c")), "\tfoo(a); // c");
}
