//! Regression tests for #3576 — every `bind:group` inside one `{#each}`
//! collapsed onto that block's single group name.
//!
//! Upstream keys a group on the binding EXPRESSION — `(keypath, bindings)` —
//! and stores the winner on the directive's own metadata
//! (`2-analyze/visitors/BindDirective.js:251-262`), which the client visitor
//! then just reads. rsvelte's phase 2 computed the same names, under the same
//! composite key, and then had nowhere per-directive to put them: the client
//! visitor walked up for an enclosing each block and took THAT block's single
//! `binding_group_name`. So the group count was right, the second name was
//! declared and never referenced, and two checkboxes shared a group — checking
//! one wrote through the other's array.
//!
//! The analysis now records the resolved name per directive, keyed by the
//! directive expression's start, and the each-block name is only the fallback.
//!
//! `bind:group={row.picked}` written OUTSIDE the `{#each}` that declares `row`
//! is deliberately not covered: upstream throws a bare `Error('Cannot find
//! declaration for bind:group')` with no code and no position, which is not a
//! verdict to reproduce.
//!
//! Every expectation below is the byte-exact output of the official compiler
//! (Svelte v5.56.9).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn client(src: &str) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some("X.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

/// `(names declared, names passed to `$.bind_group` in source order)`.
fn groups(code: &str) -> (Vec<String>, Vec<String>) {
    let mut declared = Vec::new();
    let mut used = Vec::new();
    let mut lines = code.lines().peekable();
    while let Some(line) = lines.next() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("const ")
            && let Some(name) = rest.strip_suffix(" = [];")
            && name.starts_with("binding_group")
        {
            declared.push(name.to_string());
        }
        if trimmed.starts_with("$.bind_group(") {
            // Prod prints the call on one line, dev breaks it; take whichever
            // holds the first argument.
            let arg = trimmed
                .strip_prefix("$.bind_group(")
                .filter(|rest| !rest.is_empty())
                .map(|rest| rest.split(',').next().unwrap_or("").trim().to_string())
                .filter(|a| !a.is_empty())
                .or_else(|| {
                    lines
                        .peek()
                        .map(|l| l.trim().trim_end_matches(',').to_string())
                });
            if let Some(arg) = arg {
                used.push(arg);
            }
        }
    }
    (declared, used)
}

fn two_inputs(host: &str, a: &str, b: &str) -> String {
    let body = match host {
        "same-each" => format!(
            "{{#each rows as row, i}}\n\t<input type=\"checkbox\" value={{i}} bind:group={{{a}}} />\n\t<input type=\"checkbox\" value={{i}} bind:group={{{b}}} />\n{{/each}}"
        ),
        "two-eachs" => format!(
            "{{#each rows as row, i}}\n\t<input type=\"checkbox\" value={{i}} bind:group={{{a}}} />\n{{/each}}\n{{#each rows as row, i}}\n\t<input type=\"checkbox\" value={{i}} bind:group={{{b}}} />\n{{/each}}"
        ),
        "both-out" => format!(
            "<input type=\"radio\" value={{1}} bind:group={{{a}}} />\n<input type=\"radio\" value={{2}} bind:group={{{b}}} />"
        ),
        other => panic!("unknown host {other}"),
    };
    format!(
        "<script>\n\tlet rows = $state([{{ picked: [], other: [] }}]);\n\tlet top = $state([]);\n\tlet top2 = $state([]);\n</script>\n\n{body}\n"
    )
}

fn assert_groups(host: &str, a: &str, b: &str, declared: &[&str], used: &[&str]) {
    let code = client(&two_inputs(host, a, b));
    let (d, u) = groups(&code);
    assert_eq!(d, declared, "declarations for {host} / {a} / {b}\n{code}");
    assert_eq!(u, used, "uses for {host} / {a} / {b}\n{code}");
}

/// The defect: two directives in ONE each block whose expressions key
/// differently get different groups.
#[test]
fn two_directives_in_one_each_block_can_differ() {
    assert_groups(
        "same-each",
        "row.picked",
        "rows[i].picked",
        &["binding_group", "binding_group_1"],
        &["binding_group", "binding_group_1"],
    );
    assert_groups(
        "same-each",
        "row.picked",
        "row.other",
        &["binding_group", "binding_group_1"],
        &["binding_group", "binding_group_1"],
    );
    assert_groups(
        "same-each",
        "top",
        "top2",
        &["binding_group", "binding_group_1"],
        &["binding_group", "binding_group_1"],
    );
}

/// The control in the other direction, and the one that makes the fix
/// non-trivial: two directives in one each block whose expressions key the SAME
/// still share a group — one declaration, used twice. A fix that simply handed
/// every directive a fresh name would pass the test above and fail here.
#[test]
fn identical_expressions_in_one_each_block_still_share() {
    for expr in ["row.picked", "rows[i].picked", "top"] {
        assert_groups(
            "same-each",
            expr,
            expr,
            &["binding_group"],
            &["binding_group", "binding_group"],
        );
    }
}

/// Two SEPARATE each blocks are two groups even for the same source text,
/// because the composite key carries the block — while a binding that reaches
/// no each block at all is keyed by its keypath alone and is therefore shared.
#[test]
fn the_each_block_is_part_of_the_key() {
    assert_groups(
        "two-eachs",
        "row.picked",
        "row.picked",
        &["binding_group", "binding_group_1"],
        &["binding_group", "binding_group_1"],
    );
    assert_groups(
        "two-eachs",
        "rows[i].picked",
        "rows[i].picked",
        &["binding_group", "binding_group_1"],
        &["binding_group", "binding_group_1"],
    );
    assert_groups(
        "two-eachs",
        "top",
        "top",
        &["binding_group"],
        &["binding_group", "binding_group"],
    );
}

/// With no each block in the picture the keypath alone decides, which is the
/// path that was already right — so it is here to stay right.
#[test]
fn a_standalone_binding_is_keyed_by_its_keypath() {
    assert_groups(
        "both-out",
        "top",
        "top2",
        &["binding_group", "binding_group_1"],
        &["binding_group", "binding_group_1"],
    );
    assert_groups(
        "both-out",
        "top",
        "top",
        &["binding_group"],
        &["binding_group", "binding_group"],
    );
    assert_groups(
        "both-out",
        "rows[i].picked",
        "rows[i].picked",
        &["binding_group"],
        &["binding_group", "binding_group"],
    );
}
