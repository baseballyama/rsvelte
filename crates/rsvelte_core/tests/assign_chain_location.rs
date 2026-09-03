//! `$.assign(object, key, op, value, '<file>:<line>:<column>')` locates the
//! assignment's own left-hand side (`locate_node(left)` in
//! `AssignmentExpression.js`), and rsvelte finds it by matching the lowered
//! target back against a source-order list of assignment sites.
//!
//! A site's key is `(root, path, operator)`, and a computed member contributes
//! a valueless `Computed` element — so the two targets of
//! `o.p[2] = o.p[3] = s` have the SAME key and only the order the sites are
//! consumed in tells them apart. The visitor walked post-order, so the inner
//! assignment claimed the outer's site and every link of a computed chain
//! reported the same column.
//!
//! A static-key chain (`o.a = o.b = s`) has two different keys and was correct
//! throughout, which is why the negative cells below are the ones that matter:
//! a grid of only computed chains cannot tell "claims in source order" from
//! "always claims the first site".
//!
//! Every expected string was taken from the official Svelte compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`).

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// The `'M.svelte:<line>:<column>'` literals in output order.
fn locations(statement: &str) -> Vec<String> {
    // The right-hand side is an import so `scope.evaluate(right).is_primitive`
    // is false — with a literal there, upstream wraps nothing and every cell
    // below reads as agreement.
    let src = format!(
        "<script>\n\timport {{ s }} from './x.js';\n\tlet o = {{ p: [], a: 0, b: 0 }};\n\tlet a = 0, b = 0;\n\tfunction go() {{\n{statement}\n\t}}\n</script>\n<button on:click={{go}}>x</button>\n"
    );
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("M.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let mut out = Vec::new();
    let mut rest = js.as_str();
    while let Some(i) = rest.find("'M.svelte:") {
        rest = &rest[i + 1..];
        let Some(end) = rest.find('\'') else { break };
        out.push(rest[..end].to_string());
        rest = &rest[end + 1..];
    }
    out
}

/// `(name, statement, official's location literals in output order)`.
const CELLS: &[(&str, &str, &[&str])] = &[
    (
        "computed chain depth 2",
        "    o.p[2] = o.p[3] = s",
        &["M.svelte:6:13"],
    ),
    (
        "computed chain depth 3",
        "    o.p[1] = o.p[2] = o.p[3] = s",
        &["M.svelte:6:22", "M.svelte:6:13"],
    ),
    (
        "computed chain depth 4",
        "    o.p[0] = o.p[1] = o.p[2] = o.p[3] = s",
        &["M.svelte:6:31", "M.svelte:6:22", "M.svelte:6:13"],
    ),
    (
        // A whole-statement assignment is upstream's
        // `path.at(-1) !== 'ExpressionStatement'` guard, so nothing is wrapped
        // — but its site is still spent, which is what keeps the chains above
        // off the outer link's column.
        "plain computed member, no chain",
        "    o.p[2] = s",
        &[],
    ),
    ("identifier chain", "    a = b = s", &[]),
    ("member then identifier", "    o.p[2] = a = s", &[]),
    (
        "identifier then member",
        "    a = o.p[2] = s",
        &["M.svelte:6:8"],
    ),
    (
        // Two distinct keys: correct before the fix, so it is the cell that
        // separates a source-order claim from one that always takes site 0.
        "static-key chain",
        "    o.a = o.b = s",
        &["M.svelte:6:10"],
    ),
    (
        "static then computed",
        "    o.a = o.p[3] = s",
        &["M.svelte:6:10"],
    ),
    (
        "computed chain with a coercing inner operator",
        "    o.p[2] = o.p[3] ??= s",
        &["M.svelte:6:13"],
    ),
    (
        // `scope.evaluate(right).is_primitive` — nothing is wrapped, on either
        // side, so a fix that started wrapping everything fails here.
        "primitive right-hand side",
        "    o.p[2] = o.p[3] = 1",
        &[],
    ),
    (
        // A sequence puts the first chain's OUTER link off an
        // `ExpressionStatement` too, so all four links are wrapped and the
        // ordering has to hold across two chains.
        "two chains in one sequence",
        "    o.p[2] = o.p[3] = s, o.a = o.b = s",
        &[
            "M.svelte:6:13",
            "M.svelte:6:4",
            "M.svelte:6:31",
            "M.svelte:6:25",
        ],
    ),
];

#[test]
fn an_assignment_claims_the_site_of_its_own_left_hand_side() {
    // Cells in both directions, and a live denominator: a grid where every cell
    // expects nothing is satisfied by a compiler that emits no `$.assign` at all.
    assert!(
        CELLS.iter().filter(|(_, _, want)| !want.is_empty()).count() >= 6,
        "too few cells expect a location"
    );
    assert!(
        CELLS.iter().any(|(_, _, want)| want.is_empty()),
        "no cell expects no location"
    );

    for (name, statement, want) in CELLS {
        assert_eq!(
            locations(statement),
            want.iter().map(|s| s.to_string()).collect::<Vec<_>>(),
            "cell `{name}`"
        );
    }
}
