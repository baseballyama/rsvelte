//! acorn-typescript's `tsLookAhead` does not set `isLookahead`, so a comment
//! consumed while speculatively parsing an object type fires `onComment` once
//! during the lookahead and again after the rewind. Upstream therefore prints
//! that comment twice, and byte equality is the goal, so rsvelte reproduces it.
//!
//! The rewind replays everything the speculation consumed, so the unit repeated
//! is the RUN, not the comment: two comments in a `TSTypeLiteral` head print
//! `c d c d` and not `c c d d`. A per-comment model agrees with a per-run one
//! for exactly one comment, which is the whole reason a grid built on a single
//! comment could not see the difference.
//!
//! Every expected sequence below was read out of the oracle
//! (`submodules/svelte/.../src/compiler/index.js`, `dev: false`) rather than
//! reasoned about. The `interface` row is the negative control: upstream does
//! not speculate over an interface body, so nothing repeats there and the cell
//! must stay single on BOTH targets — an assertion set that only ever expects a
//! doubling is satisfied by a compiler that doubles everything.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The single-letter comments of `code`, in the order they are printed.
///
/// The letters are what the grid varies; every other comment the compiler emits
/// (`/* @__PURE__ */`, a `svelte-ignore`) is longer than one character, so this
/// reads the axis and not the noise.
fn letters(code: &str) -> String {
    let bytes = code.as_bytes();
    let mut out: Vec<&str> = Vec::new();
    let mut i = 0usize;
    while i + 1 < bytes.len() {
        let (from, to, next) = if &bytes[i..i + 2] == b"//" {
            let end = code[i + 2..]
                .find(NEWLINE)
                .map_or(code.len(), |n| i + 2 + n);
            (i + 2, end, end)
        } else if &bytes[i..i + 2] == b"/*" {
            let Some(n) = code[i + 2..].find("*/") else {
                break;
            };
            (i + 2, i + 2 + n, i + 4 + n)
        } else {
            i += 1;
            continue;
        };
        let text = code[from..to].trim();
        if text.len() == 1 && text.chars().all(|c| c.is_ascii_lowercase()) {
            out.push(text);
        }
        i = next;
    }
    out.join(" ")
}

const NEWLINE: char = '\n';

fn sequence(source: &str, generate: GenerateMode) -> String {
    let js = compile(
        source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    letters(&js)
}

/// `head` are the lines inside the `type P = {` braces before the first member.
fn type_literal(head: &[&str], after_first_member: &str) -> String {
    let mut lines = vec!["<script lang=\"ts\">".to_string(), "type P = {".to_string()];
    for line in head {
        lines.push((*line).to_string());
    }
    lines.push(format!("  a: number;{after_first_member}"));
    lines.push("};".to_string());
    lines.push("let { a }: P = $props();".to_string());
    lines.push("</script>".to_string());
    lines.push("<i>{a}</i>".to_string());
    lines.push(String::new());
    lines.join("\n")
}

const INTERFACE: &str = "<script lang=\"ts\">
interface P {
  // c
  a: number;
}
let { a }: P = $props();
</script>
<i>{a}</i>
";

/// `(name, source, client, server)` — the last two are the oracle's answers.
fn cells() -> Vec<(&'static str, String, &'static str, &'static str)> {
    vec![
        (
            "one line comment in the head",
            type_literal(&["  // c"], ""),
            "c c",
            "c c",
        ),
        (
            "one block comment in the head",
            type_literal(&["  /*c*/"], ""),
            "c c",
            "c c",
        ),
        (
            "two line comments in the head",
            type_literal(&["  // c", "  // d"], ""),
            "c d c d",
            "c d c d",
        ),
        (
            "three line comments in the head",
            type_literal(&["  // c", "  // d", "  // e"], ""),
            "c d e c d e",
            "c d e c d e",
        ),
        (
            "one in the head, one after the first member",
            type_literal(&["  // c"], " // d"),
            "c c d",
            "c c d",
        ),
        (
            "an interface body does not speculate",
            INTERFACE.to_string(),
            "c",
            "c",
        ),
    ]
}

#[test]
fn a_speculated_comment_run_is_repeated_whole_on_both_targets() {
    let mut wrong: Vec<String> = Vec::new();
    for (name, source, client, server) in cells() {
        for (generate, expected, target) in [
            (GenerateMode::Client, client, "client"),
            (GenerateMode::Server, server, "server"),
        ] {
            let actual = sequence(&source, generate);
            if actual != expected {
                wrong.push(format!("{name} / {target}: {actual:?} != {expected:?}"));
            }
        }
    }
    assert!(wrong.is_empty(), "{}", wrong.join("\n"));
}

/// The letter extractor reads a real axis rather than always answering the
/// same thing: a source with no comment at all must come back empty, and the
/// generated code must be the component it claims to be.
#[test]
fn the_extractor_and_the_compile_are_live() {
    let plain = "<script lang=\"ts\">\ntype P = { a: number };\nlet { a }: P = $props();\n</script>\n<i>{a}</i>\n";
    assert_eq!(sequence(plain, GenerateMode::Client), "");
    assert_eq!(sequence(plain, GenerateMode::Server), "");

    let source = type_literal(&["  // c"], "");
    let client = compile(
        &source,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    assert!(
        client.contains("export default function C("),
        "not a compiled component: {client}"
    );
}
