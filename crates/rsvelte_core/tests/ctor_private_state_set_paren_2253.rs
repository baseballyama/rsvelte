//! Regression tests for issue #2253 — the `)` that closes the injected
//! `$.set(...)` for a `#private` `$state` field was emitted at the offset of a
//! `;`/`}`/`)` that appeared inside a **comment or literal** rather than at the
//! end of the assigned value.
//!
//! The class transforms rewrite these assignments as text. Several of their
//! scanners counted brackets, or hunted for the statement's `;`, without
//! stepping over comment bodies, string / template / regex literals, or (in
//! places) bracket nesting:
//!
//!   * `split_rhs_at_top_level_semi` broke at a `//` at *any* depth, so a line
//!     comment nested inside a multi-line literal truncated the value there —
//!     the reported bug.
//!   * four `rest.find(';')` scans in the method / non-`this` paths took the
//!     first `;` anywhere, including inside a comment, a string or a nested
//!     function body.
//!   * the client member scan and the server `update_member_brace_depth`
//!     counted `{`/`}` character by character, so a `// … } …` line split a
//!     method in two.
//!   * the server class transform found the class body's closing `}` with a
//!     bare char loop, so a `}` in a comment closed the class early and every
//!     member after it was silently dropped.
//!
//! All of them now share `shared::js_scan::skip_opaque`. The emitted module has
//! to parse in every one of these shapes; before the fix it did not, and
//! Vite/Rolldown rejected the file with `Parse failure: Unexpected token`.
//!
//! Layout expectations here are **the official compiler's own bytes**, obtained
//! by compiling the same source with `submodules/svelte`. They are not a record
//! of what rsvelte happens to print. Where rsvelte still diverges from upstream,
//! the assertion says so at its own site instead of absorbing the difference.

use rsvelte_core::compiler::ModuleCompileOptions;
use rsvelte_core::{GenerateMode, compile_module};

fn compile(src: &str, generate: GenerateMode, dev: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("A.svelte.js".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// Balanced-bracket check that respects strings, template literals and both
/// comment forms — a `)` spliced into a comment shows up here as an imbalance.
fn assert_structurally_valid(code: &str, ctx: &str) {
    let bytes = code.as_bytes();
    let mut stack: Vec<u8> = Vec::new();
    let mut prev: Option<u8> = None;
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'\'' | b'"' | b'`' => {
                let quote = bytes[i];
                i += 1;
                while i < bytes.len() {
                    match bytes[i] {
                        b'\\' => i += 2,
                        b if b == quote => {
                            i += 1;
                            break;
                        }
                        _ => i += 1,
                    }
                }
                prev = Some(b'x');
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'/') => {
                while i < bytes.len() && bytes[i] != b'\n' {
                    i += 1;
                }
                continue;
            }
            b'/' if bytes.get(i + 1) == Some(&b'*') => {
                i += 2;
                while i + 1 < bytes.len() && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                    i += 1;
                }
                i = (i + 2).min(bytes.len());
                continue;
            }
            b'/' if !matches!(prev, Some(c) if c.is_ascii_alphanumeric()
                || matches!(c, b'_' | b'$' | b')' | b']' | b'}' | b'\'' | b'"' | b'`')) =>
            {
                i += 1;
                let mut in_class = false;
                while i < bytes.len() {
                    match bytes[i] {
                        b'\\' => i += 2,
                        b'[' => {
                            in_class = true;
                            i += 1;
                        }
                        b']' if in_class => {
                            in_class = false;
                            i += 1;
                        }
                        b'/' if !in_class => {
                            i += 1;
                            break;
                        }
                        b'\n' => break,
                        _ => i += 1,
                    }
                }
                while i < bytes.len() && bytes[i].is_ascii_alphabetic() {
                    i += 1;
                }
                prev = Some(b'x');
                continue;
            }
            b'(' => stack.push(b')'),
            b'[' => stack.push(b']'),
            b'{' => stack.push(b'}'),
            c @ (b')' | b']' | b'}') => {
                assert_eq!(stack.pop(), Some(c), "unbalanced bracket ({ctx}):\n{code}");
            }
            _ => {}
        }
        if !bytes[i].is_ascii_whitespace() {
            prev = Some(bytes[i]);
        }
        i += 1;
    }
    assert!(stack.is_empty(), "unclosed brackets ({ctx}):\n{code}");
}

/// Strip each line's leading indentation. The class re-printer's *indentation*
/// of a verbatim (non-rune) member is a separate, pre-existing concern; these
/// tests are about where the injected `)` lands, so they compare the statement
/// shape rather than its indentation.
fn dedented(code: &str) -> String {
    code.lines()
        .map(str::trim_start)
        .collect::<Vec<_>>()
        .join("\n")
}

/// Compile for all three targets and require the output to stay well-formed and
/// to keep the whole class body (the server path used to delete every member
/// after a `}`-bearing comment).
fn assert_all_targets_valid(src: &str, ctx: &str, must_contain: &[&str]) {
    for (generate, dev, label) in [
        (GenerateMode::Client, false, "client"),
        (GenerateMode::Client, true, "client-dev"),
        (GenerateMode::Server, false, "server"),
    ] {
        let out = compile(src, generate, dev);
        assert_structurally_valid(&out, &format!("{ctx} {label}"));
        for needle in must_contain {
            assert!(
                out.contains(needle),
                "{ctx} {label}: missing {needle} in:\n{out}"
            );
        }
    }
}

const OBJECT_LITERAL: &str = "export class R {
\t#x = $state.raw({});

\tconstructor(s) {
\t\tthis.#x = {
\t\t\ta: s,
\t\t\t// c
\t\t\tb: s
\t\t};
\t}

\tm(s) {
\t\tthis.#x = {
\t\t\ta: s,
\t\t\t// c
\t\t\tb: s
\t\t};
\t}
}
";

#[test]
fn constructor_object_literal_with_line_comment_closes_after_the_literal() {
    let out = compile(OBJECT_LITERAL, GenerateMode::Client, false);
    assert!(
        out.contains(
            "\tconstructor(s) {\n\t\t$.set(this.#x, {\n\t\t\ta: s,\n\t\t\t// c\n\t\t\tb: s\n\t\t});\n\t}"
        ),
        "constructor body must close the $.set(...) after the literal:\n{out}"
    );
    assert_structurally_valid(&out, "constructor object literal");
}

/// The constructor and the method must lower to the same statement.
#[test]
fn constructor_and_method_agree() {
    let out = compile(OBJECT_LITERAL, GenerateMode::Client, false);
    let statement = "$.set(this.#x, {\na: s,\n// c\nb: s\n});";
    assert_eq!(
        dedented(&out).matches(statement).count(),
        2,
        "constructor and method must produce the same statement:\n{out}"
    );
}

#[test]
fn constructor_array_literal_with_line_comment() {
    let out = compile(
        "export class R {
\t#x = $state.raw([]);

\tconstructor(s) {
\t\tthis.#x = [
\t\t\ts,
\t\t\t// c
\t\t\ts
\t\t];
\t}
}
",
        GenerateMode::Client,
        false,
    );
    assert!(
        out.contains("\t\t$.set(this.#x, [\n\t\t\ts,\n\t\t\t// c\n\t\t\ts\n\t\t]);"),
        "array literal RHS must survive the rewrite:\n{out}"
    );
    assert_structurally_valid(&out, "constructor array literal");
}

/// A comment in the last property position (nothing but the closing brace after
/// it) is the shape most likely to swallow the terminator.
#[test]
fn constructor_literal_with_trailing_line_comment_in_last_position() {
    let out = compile(
        "export class R {
\t#x = $state.raw({});

\tconstructor(s) {
\t\tthis.#x = {
\t\t\ta: s
\t\t\t// c
\t\t};
\t}
}
",
        GenerateMode::Client,
        false,
    );
    // The official compiler's own bytes: esrap reflows the literal onto the
    // opening line and gives the trailing comment a line of its own.
    assert!(
        out.contains("\t\t$.set(this.#x, { a: s\n\n\t\t// c\n\t\t });"),
        "trailing comment must stay inside the literal:\n{out}"
    );
    assert_structurally_valid(&out, "trailing comment in last position");
}

/// A `//` at bracket depth 0 is still the statement's tail, not part of the
/// value — the guard that #907 added must keep working.
#[test]
fn top_level_trailing_comment_is_still_the_tail() {
    let out = compile(
        "export class C {
\t#current = $state();
\tconstructor(getter) {
\t\tthis.#current = getter(); // set the initial value
\t}
}
",
        GenerateMode::Client,
        false,
    );
    assert!(
        out.contains("$.set(this.#current, getter(), true); // set the initial value"),
        "the trailing comment must stay outside the $.set(...) call:\n{out}"
    );
    assert_structurally_valid(&out, "top-level trailing comment");
}

/// Compound and logical assignment operators share the same right-hand-side
/// scan, so they are reachable from the same defect.
#[test]
fn compound_and_logical_assignments_keep_nested_comments() {
    let out = compile(
        "export class R {
\t#x = $state.raw({});
\t#n = $state(0);

\tconstructor(s) {
\t\tthis.#x ??= {
\t\t\ta: s,
\t\t\t// c
\t\t\tb: s
\t\t};
\t\tthis.#n += [
\t\t\t1,
\t\t\t// c
\t\t\t2
\t\t].length;
\t}
}
",
        GenerateMode::Client,
        false,
    );
    assert_structurally_valid(&out, "compound/logical assignment");
    let flat = dedented(&out);
    // Both assertions below carry a divergence from upstream that predates this
    // file and is tracked separately; only the comment's survival is this test's
    // subject. Official emits `$.set(this.#x, this.#x.v ?? { … })` with no third
    // argument — the `true` is a spurious proxy flag on a logical-assignment RHS
    // — and reads the compound operand as `this.#n.v`, not `$.get(this.#n)`.
    assert!(
        flat.contains("?? {\na: s,\n// c\nb: s\n},\ntrue\n);"),
        "logical assignment RHS must survive:\n{out}"
    );
    assert!(
        flat.contains("$.set(this.#n, $.get(this.#n) + [\n1,\n// c\n2\n].length);"),
        "compound assignment RHS must survive:\n{out}"
    );
}

/// The comment *text* contains `}`, `)` and `;`. Every scanner on the way must
/// treat it as text: the emitted comment has to come out byte-for-byte as
/// written, and the call has to close after the literal.
#[test]
fn a_comment_containing_brackets_and_a_semicolon_is_text() {
    for host in ["constructor(s)", "m(s)"] {
        let src = format!(
            "export class R {{
\t#x = $state.raw({{}});

\t{host} {{
\t\tthis.#x = {{
\t\t\ta: s,
\t\t\t// }} ) ; c
\t\t\tb: s
\t\t}};
\t}}
}}
"
        );
        let out = compile(&src, GenerateMode::Client, false);
        assert!(
            dedented(&out).contains("$.set(this.#x, {\na: s,\n// } ) ; c\nb: s\n});"),
            "{host}: the comment text must be untouched and the call closed after the literal:\n{out}"
        );
        assert_all_targets_valid(&src, host, &["// } ) ; c"]);
    }
}

/// Same shape with a block comment, a string literal, a regex literal and a
/// nested function body — each carries a `}`/`)`/`;` that is not code.
#[test]
fn brackets_and_semicolons_inside_literals_are_not_statement_ends() {
    let cases: [(&str, &str); 4] = [
        (
            "block-comment",
            "{\n\t\t\ta: s,\n\t\t\t/* } ) ; */\n\t\t\tb: s\n\t\t}",
        ),
        ("string", "{ a: 'a) ; } b', b: s }"),
        ("regex", "{ a: /[});]+/g, b: s }"),
        (
            "nested-fn",
            "{\n\t\t\tf: () => { g(); },\n\t\t\tb: s\n\t\t}",
        ),
    ];
    for (label, rhs) in cases {
        for host in ["constructor(s)", "m(s)"] {
            let src = format!(
                "export class R {{
\t#x = $state.raw({{}});

\t{host} {{
\t\tthis.#x = {rhs};
\t}}
}}
"
            );
            assert_all_targets_valid(&src, &format!("{label} in {host}"), &["b: s"]);
        }
    }
}

/// The server path found the class body's closing brace with a bare char loop,
/// so a `}` inside a comment closed the class early and dropped every member
/// after it. The output still parsed in some shapes — this pins the content.
#[test]
fn a_brace_in_a_comment_does_not_truncate_the_class_body() {
    let src = "export class R {
\t#x = $state.raw({});

\tm(s) {
\t\tthis.#x = {
\t\t\ta: s,
\t\t\t// } ) ; c
\t\t\tb: s
\t\t};
\t}

\tlast() {
\t\treturn 42;
\t}
}
";
    assert_all_targets_valid(src, "class body truncation", &["last()", "return 42"]);
}

/// A `static { … }` block has no parameter list, so the server's method test
/// (which needs a `(`) never fired: the block's body was emitted line by line
/// as class fields, each with a `;` appended — including the comment line,
/// which swallowed the following property into the comment.
#[test]
fn a_static_initialization_block_is_not_emitted_as_fields() {
    for opener in ["static {\n\t\tconst s = 1;", "static { const s = 1;"] {
        let src = format!(
            "export class R {{
\t#x = $state.raw({{}});

\t{opener}
\t\tthis.#x = {{
\t\t\ta: s,
\t\t\t// }} ) ; c
\t\t\tb: s
\t\t}};
\t}}
}}
"
        );
        assert_all_targets_valid(&src, "static block", &["// } ) ; c", "b: s"]);
        let server = compile(&src, GenerateMode::Server, false);
        assert!(
            !server.contains("// } ) ; c;"),
            "a `;` must not be appended inside the comment:\n{server}"
        );
        assert!(
            !server.contains("b: s;"),
            "a `;` must not be appended to an object property:\n{server}"
        );
    }
}

/// A module-level class is at column 0, so its lowered members belong one tab
/// deep — not two, as the hard-coded indentation used to emit.
#[test]
fn module_level_class_members_are_indented_one_level() {
    let out = compile(
        "export class S {
\tv = $state(0);
\tasync load() {
\t\tfor await (const x of gen()) this.v = x;
\t}
}
",
        GenerateMode::Client,
        false,
    );
    assert!(
        out.contains("\n\t#v = $.state(0);"),
        "backing field must sit one tab deep:\n{out}"
    );
    assert!(
        out.contains("\n\tget v() {\n\t\treturn $.get(this.#v);\n\t}"),
        "getter must sit one tab deep:\n{out}"
    );
    assert!(
        out.contains("\n\tset v(value) {\n\t\t$.set(this.#v, value, true);\n\t}"),
        "setter must sit one tab deep:\n{out}"
    );
    assert!(out.ends_with("\n}"), "class must close at column 0:\n{out}");
}

/// Dev mode wraps the field in `$.tag(...)` but must not change the shape.
#[test]
fn dev_mode_output_is_parseable_too() {
    let out = compile(OBJECT_LITERAL, GenerateMode::Client, true);
    assert!(
        out.contains(
            "\tconstructor(s) {\n\t\t$.set(this.#x, {\n\t\t\ta: s,\n\t\t\t// c\n\t\t\tb: s\n\t\t});\n\t}"
        ),
        "dev-mode constructor body must match:\n{out}"
    );
    assert_structurally_valid(&out, "dev mode");
}

#[test]
fn server_output_keeps_the_literal_intact() {
    let out = compile(OBJECT_LITERAL, GenerateMode::Server, false);
    assert_structurally_valid(&out, "server");
    assert!(
        out.contains("// c"),
        "the nested comment must survive on the server too:\n{out}"
    );
}
