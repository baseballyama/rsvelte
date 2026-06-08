//! Regression test for issues #779 and #781.
//!
//! After #750 moved `class:` / `style:` directives out of the `createElement`
//! props object and into a suffix statement, a directive immediately followed
//! by a **shorthand attribute** (`{onclick}`) produced a double comma in the
//! props object (`{ "class":`c`,, }`) — invalid TSX ("Property assignment
//! expected") (#779) — and a directive followed by an attribute whose value is
//! an `{expression}` (`onclick={() => f()}`) dropped the attribute's value
//! (`{ "onclick":, }`) — invalid TSX ("Expression expected") (#781). Both trip
//! the program-wide `--tsgo` suppression. The shared cause: the hoisted
//! directive's expression chunk is emitted *after* the following attribute's
//! preserved source chunk, but references an *earlier* source position,
//! violating the ascending-order requirement of the segmented overwrite. The
//! fix bakes such out-of-order chunks into literal text.

use rsvelte_core::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn opener(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".into(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    code.lines()
        .find(|l| l.contains("createElement"))
        .unwrap_or("")
        .to_string()
}

fn braces_balanced(s: &str) -> bool {
    let mut depth: i32 = 0;
    let mut in_str: Option<char> = None;
    let mut prev = '\0';
    for c in s.chars() {
        match in_str {
            Some(q) => {
                if c == q && prev != '\\' {
                    in_str = None;
                }
            }
            None => match c {
                '"' | '\'' | '`' => in_str = Some(c),
                '{' => depth += 1,
                '}' => depth -= 1,
                _ => {}
            },
        }
        if depth < 0 {
            return false;
        }
        prev = c;
    }
    depth == 0
}

#[test]
fn style_directive_then_shorthand_no_double_comma() {
    let src = "<script lang=\"ts\">let b='red'; const onclick=()=>{};</script>\n\
               <div class=\"c\" style:color={b} {onclick}>x</div>";
    let op = opener(src);
    assert!(!op.contains(",,"), "double comma in props:\n{op}");
    assert!(op.contains("onclick,"), "shorthand attr name lost:\n{op}");
    assert!(
        op.contains("__sveltets_2_ensureType(String, Number, b);"),
        "style directive suffix missing:\n{op}"
    );
}

#[test]
fn class_directive_then_shorthand_no_double_comma() {
    let src = "<script lang=\"ts\">const onclick=()=>{}; let disabled=false;</script>\n\
               <div class=\"c\" class:disabled {onclick}>x</div>";
    let op = opener(src);
    assert!(!op.contains(",,"), "double comma in props:\n{op}");
    assert!(op.contains("onclick,"), "shorthand attr name lost:\n{op}");
    assert!(
        op.contains("disabled;"),
        "class directive suffix missing:\n{op}"
    );
}

#[test]
fn real_world_button_mixed_directives_and_shorthands() {
    // `<button class="c" class:disabled style:--bg={x} {disabled} {onclick}>`
    let src = "<script lang=\"ts\">let x='#fff'; let disabled=false; const onclick=()=>{};</script>\n\
               <button class=\"c\" class:disabled style:--bg={x} {disabled} {onclick}>go</button>";
    let op = opener(src);
    assert!(!op.contains(",,"), "double comma in props:\n{op}");
    assert!(
        op.contains("disabled,"),
        "shorthand {{disabled}} lost:\n{op}"
    );
    assert!(op.contains("onclick,"), "shorthand {{onclick}} lost:\n{op}");
}

#[test]
fn no_directive_shorthands_unchanged() {
    // Guard: the in-order path (no hoisted directive) is untouched.
    let src = "<script lang=\"ts\">const onclick=()=>{}; let disabled=false;</script>\n\
               <div class=\"c\" {onclick} {disabled}>x</div>";
    let op = opener(src);
    assert!(!op.contains(",,"), "double comma in props:\n{op}");
    assert!(
        op.contains("onclick,disabled,"),
        "both shorthands should survive in order:\n{op}"
    );
}

// ---- #781: directive immediately followed by an `{expression}`-valued attr ----

#[test]
fn style_directive_then_expr_attr_keeps_value() {
    // #781: `style:color={c} onclick={() => f()}` dropped the `onclick` value,
    // emitting `{ "onclick":, }`.
    let src = "<script lang=\"ts\">let c='red'; const f=()=>{};</script>\n\
               <button style:color={c} onclick={() => f()}>x</button>";
    let op = opener(src);
    assert!(!op.contains("\":,"), "attr value dropped (\":,\"):\n{op}");
    assert!(
        op.contains("\"onclick\":() => f(),"),
        "onclick value lost:\n{op}"
    );
    assert!(
        op.contains("__sveltets_2_ensureType(String, Number, c);"),
        "style directive suffix missing:\n{op}"
    );
}

#[test]
fn class_directive_then_expr_attr_keeps_value() {
    let src = "<script lang=\"ts\">let d=false; const f=()=>{};</script>\n\
               <button class:on={d} onclick={() => f()}>x</button>";
    let op = opener(src);
    assert!(!op.contains("\":,"), "attr value dropped (\":,\"):\n{op}");
    assert!(
        op.contains("\"onclick\":() => f(),"),
        "onclick value lost:\n{op}"
    );
    assert!(op.contains("d;"), "class directive suffix missing:\n{op}");
}

#[test]
fn expr_attr_alone_unchanged() {
    // Guard: the standalone (no directive) case is untouched.
    let src = "<script lang=\"ts\">const f=()=>{};</script>\n\
               <button onclick={() => f()}>x</button>";
    let op = opener(src);
    assert!(
        op.contains("\"onclick\":() => f(),"),
        "standalone expr attr should survive:\n{op}"
    );
}

#[test]
fn directive_then_expr_attr_overlay_brace_balanced() {
    let src = "<script lang=\"ts\">let c='red'; const f=()=>{};</script>\n\
               <button style:color={c} onclick={() => f()}>x</button>";
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".into(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    assert!(braces_balanced(&code), "unbalanced overlay:\n{code}");
}

#[test]
fn whole_overlay_stays_brace_balanced() {
    let src = "<script lang=\"ts\">let b='red'; const onclick=()=>{};</script>\n\
               <div class=\"c\" style:color={b} {onclick}>x</div>";
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".into(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    assert!(braces_balanced(&code), "unbalanced overlay:\n{code}");
}
