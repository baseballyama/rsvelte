//! Regression tests for issue #907.
//!
//! The reporter saw non-deterministic `[PARSE_ERROR]`s from `vite build` on
//! valid `.svelte.js` rune modules (the `runed` library). The root cause was
//! *not* thread-safety — it was three deterministic codegen bugs in the
//! module class-field transform that emit syntactically-invalid JavaScript;
//! Rolldown then parses that output in parallel and aborts on whichever bad
//! file it reaches first, so the failing file set (and the parser error text)
//! varied between runs while the per-file output was actually deterministic.
//!
//! The three bugs, each reproduced minimally below:
//!   1. A trailing `// comment` on a private-field assignment was swallowed
//!      into the rewritten `$.set(...)` RHS, producing
//!      `$.set(this.#x, getter(); // comment, true)`.
//!   2. Wrapping a private-field read used a prefix `str::replace`, so a field
//!      whose name is a prefix of a sibling (`#fps` vs `#fpsLimitOption`) was
//!      corrupted into `$.get(this.#fps)LimitOption`.
//!   3. A multi-line object-literal RHS in a constructor was transformed
//!      line-by-line, splitting `this.#x = {` from its body.
//!
//! Plus a server-specific bug: a `$state` private field assignment was lowered
//! to the call form `this.#x(v)` instead of the plain `this.#x = v`.

use rsvelte_core::{GenerateMode, compile_module, compiler::ModuleCompileOptions};

fn compile(src: &str, ssr: bool) -> String {
    compile_module(
        src,
        ModuleCompileOptions {
            filename: Some("mod.svelte.js".to_string()),
            generate: if ssr {
                GenerateMode::Server
            } else {
                GenerateMode::Client
            },
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile_module should succeed")
    .js
    .code
}

/// Lightweight structural validity check: scan the whole module (respecting
/// strings, template literals and comments) and require every `()`, `[]` and
/// `{}` to balance and nest correctly. The multi-line-split bug orphaned a
/// `this.#rect = {` from its `}`, which shows up as an imbalance here; the
/// comment-swallow and prefix-sibling bugs are pinned by the per-test
/// substring assertions. A full parse would be stricter, but pulling a JS
/// parser into the integration-test crate causes a `serde` version clash, and
/// the real Vite + Rolldown build (which *does* re-parse the output) is the
/// end-to-end guard.
fn assert_structurally_valid(code: &str, ctx: &str) {
    let bytes = code.as_bytes();
    let mut stack: Vec<u8> = Vec::new();
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
            b'(' => stack.push(b')'),
            b'[' => stack.push(b']'),
            b'{' => stack.push(b'}'),
            c @ (b')' | b']' | b'}') => {
                assert_eq!(
                    stack.pop(),
                    Some(c),
                    "mismatched/unbalanced closing bracket ({ctx}):\n{code}"
                );
            }
            _ => {}
        }
        i += 1;
    }
    assert!(stack.is_empty(), "unclosed brackets ({ctx}):\n{code}");
}

#[test]
fn private_state_assignment_with_trailing_comment_client() {
    let src = "export class C {
  #current = $state();
  constructor(getter) {
    this.#current = getter(); // set the initial value
  }
}";
    let out = compile(src, false);
    // RHS is exactly `getter()`, not `getter(); // set the initial value`.
    assert!(
        out.contains("$.set(this.#current, getter(), true)"),
        "client output should keep the RHS intact:\n{out}"
    );
    assert!(
        !out.contains("getter(); // set the initial value, true)"),
        "the trailing `;`/comment must not be swallowed into $.set(...):\n{out}"
    );
    assert_structurally_valid(&out, "client trailing comment");
}

#[test]
fn private_state_assignment_with_trailing_comment_server() {
    let src = "export class C {
  #current = $state();
  constructor(getter) {
    this.#current = getter(); // set the initial value
  }
}";
    let out = compile(src, true);
    // On the server a `$state` field is a plain value: assignment stays plain.
    assert!(
        out.contains("this.#current = getter();"),
        "server output should keep a plain assignment:\n{out}"
    );
    assert!(
        !out.contains("this.#current(getter()"),
        "server must not lower a $state assignment to a call form:\n{out}"
    );
    assert_structurally_valid(&out, "server trailing comment");
}

#[test]
fn private_state_method_assignment_server_is_plain() {
    let src = "export class C {
  #current = $state(0);
  set(v) { this.#current = v; }
}";
    let out = compile(src, true);
    assert!(
        out.contains("this.#current = v"),
        "server $state field set must stay a plain assignment:\n{out}"
    );
    assert!(
        !out.contains("this.#current(v)"),
        "server must not emit the call form for a $state field:\n{out}"
    );
}

#[test]
fn derived_field_read_does_not_corrupt_prefix_sibling() {
    // `#fps` (state) and `#fpsLimit` (derived) are prefixes of `#fpsLimitOption`
    // (a plain field). Wrapping their reads must respect word boundaries.
    let src = "export class C {
  #fpsLimitOption = 0;
  #fps = $state(0);
  #fpsLimit = $derived(this.#fpsLimitOption + this.#fps);
  get v() { return this.#fpsLimit; }
}";
    for ssr in [false, true] {
        let out = compile(src, ssr);
        assert!(
            out.contains("this.#fpsLimitOption"),
            "the sibling field name must survive intact (ssr={ssr}):\n{out}"
        );
        assert!(
            !out.contains("#fps)Limit") && !out.contains("#fps()Limit"),
            "wrapping #fps must not split #fpsLimitOption (ssr={ssr}):\n{out}"
        );
        assert_structurally_valid(&out, &format!("prefix-sibling ssr={ssr}"));
    }
}

#[test]
fn multiline_object_literal_constructor_assignment() {
    let src = "export class C {
  #rect = $state({ x: 0, y: 0 });
  constructor() {
    this.#rect = {
      x: 1,
      y: 2,
    };
  }
}";
    for ssr in [false, true] {
        let out = compile(src, ssr);
        // The object body must not be orphaned from the assignment target.
        assert!(
            !out.contains("$.set(this.#rect, {,") && !out.contains("this.#rect(\n"),
            "the multi-line RHS must travel with the assignment (ssr={ssr}):\n{out}"
        );
        assert_structurally_valid(&out, &format!("multi-line object assignment ssr={ssr}"));
    }
}

#[test]
fn runed_persisted_state_compiles_without_false_constant_assignment() {
    // `runed/persisted-state.svelte.js` has a top-level `proxy(value, root, …)`
    // helper whose param `root` collides with a `let root` inside the class
    // `get current()`. Before the class-method-body scope was registered for
    // the visitor phase, the method-local `let root` reassignment was
    // misresolved to the (constant) outer param and rejected with a spurious
    // `constant_assignment` analysis error. It must compile cleanly now.
    let src = include_str!("fixtures_runed/persisted-state.svelte.js");
    for ssr in [false, true] {
        // `compile` would panic on the spurious `constant_assignment` error.
        let out = compile(src, ssr);
        assert_structurally_valid(&out, &format!("runed persisted-state ssr={ssr}"));
    }
}
