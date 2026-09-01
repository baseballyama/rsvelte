//! #4062 — a markup expression is formatted through a `(expr);` wrapper, so
//! OXC parenthesizes any head it would have to disambiguate at STATEMENT
//! position. A template expression sits in expression position, where
//! prettier-plugin-svelte (the oxfmt `svelte: true` oracle) keeps the head bare.
//!
//! Every expected value below is the oxfmt oracle's own output for that cell,
//! not a hand-written guess. Two families, crossed with five markup host slots:
//!
//!   A  head identifier NAME x expression shape.  The reported symptom was
//!      `{type as X}` -> `{(type) as X}`, but the axis is the NAME, not
//!      "identifier": `foo as X` was already correct. OXC parenthesizes only
//!      `await` / `component` / `hook` / `interface` / `let` / `module` /
//!      `type` / `using` / `yield`, and only as the operand of an
//!      `as`/`satisfies` chain (a `!` in the chain stops it).
//!   B  operand KIND x type operator.  Covers the object-literal head reached
//!      through `as`/`satisfies`/`!` (`{ a: 1 }!`, `{ a: 1 }.a as T`).
//!
//! Both families carry cells that were ALREADY correct before the fix (neutral
//! names, `!`-broken chains, parenthesized subexpressions), so a regression that
//! strips a paren that is genuinely load-bearing fails here too.
//!
//! Two cells the oracle accepts are absent: `accessor satisfies T` and
//! `declare satisfies T`, which rsvelte rejects before reaching this decision —
//! a separate defect, unmoved by this fix.

use rsvelte_formatter::{FormatOptions, format};

/// (input markup, expected markup) for one expression, per host slot. A quoted
/// single-interpolation attribute value normalizes to the unquoted form, so its
/// two templates differ; every other slot round-trips its own shape.
const HOSTS: &[(&str, &str)] = &[
    (
        "<button title={E}>x</button>",
        "<button title={E}>x</button>",
    ),
    ("<p>{E}</p>", "<p>{E}</p>"),
    ("{#if E}<p>y</p>{/if}", "{#if E}<p>y</p>{/if}"),
    (
        "<button title=\"{E}\">x</button>",
        "<button title={E}>x</button>",
    ),
    ("<button {...E}>x</button>", "<button {...E}>x</button>"),
];

fn check(family: &str, axis_a: &str, axis_b: &str, expr: &str, expected_expr: &str) -> Vec<String> {
    let mut failures = Vec::new();
    for (input_tpl, output_tpl) in HOSTS {
        let markup = input_tpl.replace('E', expr);
        let want_markup = output_tpl.replace('E', expected_expr);
        let src = format!("<script lang=\"ts\"></script>\n\n{markup}\n");
        let want = format!("<script lang=\"ts\"></script>\n\n{want_markup}\n");
        match format(&src, &FormatOptions::default()) {
            Ok(got) => {
                if got != want {
                    failures.push(format!(
                        "{family}/{axis_a}/{axis_b} in {input_tpl}\n  expected: {want:?}\n  actual:   {got:?}"
                    ));
                    continue;
                }
                // The formatter must be a fixed point on its own output.
                match format(&got, &FormatOptions::default()) {
                    Ok(again) if again == got => {}
                    Ok(again) => failures.push(format!(
                        "{family}/{axis_a}/{axis_b} in {input_tpl} is not idempotent\n  once:  {got:?}\n  twice: {again:?}"
                    )),
                    Err(e) => failures.push(format!(
                        "{family}/{axis_a}/{axis_b} in {input_tpl} failed to re-format: {e:?}"
                    )),
                }
            }
            Err(e) => failures.push(format!(
                "{family}/{axis_a}/{axis_b} in {input_tpl} failed to format: {e:?}"
            )),
        }
    }
    failures
}

fn report(family: &str, cells: &[(&str, &str, &str, &str)]) {
    let mut failures = Vec::new();
    for (axis_a, axis_b, expr, expected) in cells {
        failures.extend(check(family, axis_a, axis_b, expr, expected));
    }
    assert!(
        failures.is_empty(),
        "{} of {} cells diverge from the oxfmt oracle:\n{}",
        failures.len(),
        cells.len() * HOSTS.len(),
        failures.join("\n")
    );
}

/// The exact reproduction from the issue, kept verbatim so the report stays
/// searchable: the attribute name and the identifier are both `type`.
#[test]
fn issue_4062_repro() {
    let src = "<script lang=\"ts\">\n\tlet { type }: { type: 'a' | 'b' } = $props();\n</script>\n\n<button type={type as 'a' | 'b'}>x</button>\n";
    let out = format(src, &FormatOptions::default()).expect("format ok");
    assert!(
        out.contains("<button type={type as \"a\" | \"b\"}>x</button>"),
        "operand must not be parenthesized:\n{out}"
    );
}

/// Family A: head identifier NAME x expression shape.
#[test]
fn declaration_name_head_matches_oracle() {
    report("A", A_CELLS);
}

/// Family B: operand KIND x type operator.
#[test]
fn type_operator_operand_matches_oracle() {
    report("B", B_CELLS);
}

/// name, shape, source expression, oracle-formatted expression.
const A_CELLS: &[(&str, &str, &str, &str)] = &[
    ("type", "bare", "type", "type"),
    ("type", "as", "type as string", "type as string"),
    (
        "type",
        "as_union",
        "type as 'a' | 'b'",
        "type as \"a\" | \"b\"",
    ),
    (
        "type",
        "as_as",
        "type as any as string",
        "type as any as string",
    ),
    (
        "type",
        "satisfies",
        "type satisfies string",
        "type satisfies string",
    ),
    (
        "type",
        "as_satisfies",
        "type as any satisfies string",
        "type as any satisfies string",
    ),
    ("type", "src_paren_as", "(type) as string", "type as string"),
    ("type", "nonnull", "type!", "type!"),
    ("type", "nonnull_as", "type! as string", "type! as string"),
    (
        "type",
        "as_nonnull",
        "(type as string)!",
        "(type as string)!",
    ),
    ("type", "member_as", "type.p as string", "type.p as string"),
    ("type", "as_member", "(type as any).p", "(type as any).p"),
    (
        "type",
        "as_in_call",
        "f(type as string)",
        "f(type as string)",
    ),
    (
        "type",
        "as_in_array",
        "[type as string]",
        "[type as string]",
    ),
    (
        "type",
        "as_in_cond",
        "type as any ? 1 : 2",
        "(type as any) ? 1 : 2",
    ),
    ("module", "bare", "module", "module"),
    ("module", "as", "module as string", "module as string"),
    (
        "module",
        "as_union",
        "module as 'a' | 'b'",
        "module as \"a\" | \"b\"",
    ),
    (
        "module",
        "as_as",
        "module as any as string",
        "module as any as string",
    ),
    (
        "module",
        "satisfies",
        "module satisfies string",
        "module satisfies string",
    ),
    (
        "module",
        "as_satisfies",
        "module as any satisfies string",
        "module as any satisfies string",
    ),
    (
        "module",
        "src_paren_as",
        "(module) as string",
        "module as string",
    ),
    ("module", "nonnull", "module!", "module!"),
    (
        "module",
        "nonnull_as",
        "module! as string",
        "module! as string",
    ),
    (
        "module",
        "as_nonnull",
        "(module as string)!",
        "(module as string)!",
    ),
    (
        "module",
        "member_as",
        "module.p as string",
        "module.p as string",
    ),
    (
        "module",
        "as_member",
        "(module as any).p",
        "(module as any).p",
    ),
    (
        "module",
        "as_in_call",
        "f(module as string)",
        "f(module as string)",
    ),
    (
        "module",
        "as_in_array",
        "[module as string]",
        "[module as string]",
    ),
    (
        "module",
        "as_in_cond",
        "module as any ? 1 : 2",
        "(module as any) ? 1 : 2",
    ),
    ("using", "bare", "using", "using"),
    ("using", "as", "using as string", "using as string"),
    (
        "using",
        "as_union",
        "using as 'a' | 'b'",
        "using as \"a\" | \"b\"",
    ),
    (
        "using",
        "as_as",
        "using as any as string",
        "using as any as string",
    ),
    (
        "using",
        "satisfies",
        "using satisfies string",
        "using satisfies string",
    ),
    (
        "using",
        "as_satisfies",
        "using as any satisfies string",
        "using as any satisfies string",
    ),
    (
        "using",
        "src_paren_as",
        "(using) as string",
        "using as string",
    ),
    ("using", "nonnull", "using!", "using!"),
    (
        "using",
        "nonnull_as",
        "using! as string",
        "using! as string",
    ),
    (
        "using",
        "as_nonnull",
        "(using as string)!",
        "(using as string)!",
    ),
    (
        "using",
        "member_as",
        "using.p as string",
        "using.p as string",
    ),
    ("using", "as_member", "(using as any).p", "(using as any).p"),
    (
        "using",
        "as_in_call",
        "f(using as string)",
        "f(using as string)",
    ),
    (
        "using",
        "as_in_array",
        "[using as string]",
        "[using as string]",
    ),
    (
        "using",
        "as_in_cond",
        "using as any ? 1 : 2",
        "(using as any) ? 1 : 2",
    ),
    ("component", "bare", "component", "component"),
    (
        "component",
        "as",
        "component as string",
        "component as string",
    ),
    (
        "component",
        "as_union",
        "component as 'a' | 'b'",
        "component as \"a\" | \"b\"",
    ),
    (
        "component",
        "as_as",
        "component as any as string",
        "component as any as string",
    ),
    (
        "component",
        "satisfies",
        "component satisfies string",
        "component satisfies string",
    ),
    (
        "component",
        "as_satisfies",
        "component as any satisfies string",
        "component as any satisfies string",
    ),
    (
        "component",
        "src_paren_as",
        "(component) as string",
        "component as string",
    ),
    ("component", "nonnull", "component!", "component!"),
    (
        "component",
        "nonnull_as",
        "component! as string",
        "component! as string",
    ),
    (
        "component",
        "as_nonnull",
        "(component as string)!",
        "(component as string)!",
    ),
    (
        "component",
        "member_as",
        "component.p as string",
        "component.p as string",
    ),
    (
        "component",
        "as_member",
        "(component as any).p",
        "(component as any).p",
    ),
    (
        "component",
        "as_in_call",
        "f(component as string)",
        "f(component as string)",
    ),
    (
        "component",
        "as_in_array",
        "[component as string]",
        "[component as string]",
    ),
    (
        "component",
        "as_in_cond",
        "component as any ? 1 : 2",
        "(component as any) ? 1 : 2",
    ),
    ("hook", "bare", "hook", "hook"),
    ("hook", "as", "hook as string", "hook as string"),
    (
        "hook",
        "as_union",
        "hook as 'a' | 'b'",
        "hook as \"a\" | \"b\"",
    ),
    (
        "hook",
        "as_as",
        "hook as any as string",
        "hook as any as string",
    ),
    (
        "hook",
        "satisfies",
        "hook satisfies string",
        "hook satisfies string",
    ),
    (
        "hook",
        "as_satisfies",
        "hook as any satisfies string",
        "hook as any satisfies string",
    ),
    ("hook", "src_paren_as", "(hook) as string", "hook as string"),
    ("hook", "nonnull", "hook!", "hook!"),
    ("hook", "nonnull_as", "hook! as string", "hook! as string"),
    (
        "hook",
        "as_nonnull",
        "(hook as string)!",
        "(hook as string)!",
    ),
    ("hook", "member_as", "hook.p as string", "hook.p as string"),
    ("hook", "as_member", "(hook as any).p", "(hook as any).p"),
    (
        "hook",
        "as_in_call",
        "f(hook as string)",
        "f(hook as string)",
    ),
    (
        "hook",
        "as_in_array",
        "[hook as string]",
        "[hook as string]",
    ),
    (
        "hook",
        "as_in_cond",
        "hook as any ? 1 : 2",
        "(hook as any) ? 1 : 2",
    ),
    ("foo", "bare", "foo", "foo"),
    ("foo", "as", "foo as string", "foo as string"),
    (
        "foo",
        "as_union",
        "foo as 'a' | 'b'",
        "foo as \"a\" | \"b\"",
    ),
    (
        "foo",
        "as_as",
        "foo as any as string",
        "foo as any as string",
    ),
    (
        "foo",
        "satisfies",
        "foo satisfies string",
        "foo satisfies string",
    ),
    (
        "foo",
        "as_satisfies",
        "foo as any satisfies string",
        "foo as any satisfies string",
    ),
    ("foo", "src_paren_as", "(foo) as string", "foo as string"),
    ("foo", "nonnull", "foo!", "foo!"),
    ("foo", "nonnull_as", "foo! as string", "foo! as string"),
    ("foo", "as_nonnull", "(foo as string)!", "(foo as string)!"),
    ("foo", "member_as", "foo.p as string", "foo.p as string"),
    ("foo", "as_member", "(foo as any).p", "(foo as any).p"),
    ("foo", "as_in_call", "f(foo as string)", "f(foo as string)"),
    ("foo", "as_in_array", "[foo as string]", "[foo as string]"),
    (
        "foo",
        "as_in_cond",
        "foo as any ? 1 : 2",
        "(foo as any) ? 1 : 2",
    ),
    ("namespace", "bare", "namespace", "namespace"),
    (
        "namespace",
        "as",
        "namespace as string",
        "namespace as string",
    ),
    (
        "namespace",
        "as_union",
        "namespace as 'a' | 'b'",
        "namespace as \"a\" | \"b\"",
    ),
    (
        "namespace",
        "as_as",
        "namespace as any as string",
        "namespace as any as string",
    ),
    (
        "namespace",
        "satisfies",
        "namespace satisfies string",
        "namespace satisfies string",
    ),
    (
        "namespace",
        "as_satisfies",
        "namespace as any satisfies string",
        "namespace as any satisfies string",
    ),
    (
        "namespace",
        "src_paren_as",
        "(namespace) as string",
        "namespace as string",
    ),
    ("namespace", "nonnull", "namespace!", "namespace!"),
    (
        "namespace",
        "nonnull_as",
        "namespace! as string",
        "namespace! as string",
    ),
    (
        "namespace",
        "as_nonnull",
        "(namespace as string)!",
        "(namespace as string)!",
    ),
    (
        "namespace",
        "member_as",
        "namespace.p as string",
        "namespace.p as string",
    ),
    (
        "namespace",
        "as_member",
        "(namespace as any).p",
        "(namespace as any).p",
    ),
    (
        "namespace",
        "as_in_call",
        "f(namespace as string)",
        "f(namespace as string)",
    ),
    (
        "namespace",
        "as_in_array",
        "[namespace as string]",
        "[namespace as string]",
    ),
    (
        "namespace",
        "as_in_cond",
        "namespace as any ? 1 : 2",
        "(namespace as any) ? 1 : 2",
    ),
    ("satisfies", "bare", "satisfies", "satisfies"),
    (
        "satisfies",
        "as",
        "satisfies as string",
        "satisfies as string",
    ),
    (
        "satisfies",
        "as_union",
        "satisfies as 'a' | 'b'",
        "satisfies as \"a\" | \"b\"",
    ),
    (
        "satisfies",
        "as_as",
        "satisfies as any as string",
        "satisfies as any as string",
    ),
    (
        "satisfies",
        "satisfies",
        "satisfies satisfies string",
        "satisfies satisfies string",
    ),
    (
        "satisfies",
        "as_satisfies",
        "satisfies as any satisfies string",
        "satisfies as any satisfies string",
    ),
    (
        "satisfies",
        "src_paren_as",
        "(satisfies) as string",
        "satisfies as string",
    ),
    ("satisfies", "nonnull", "satisfies!", "satisfies!"),
    (
        "satisfies",
        "nonnull_as",
        "satisfies! as string",
        "satisfies! as string",
    ),
    (
        "satisfies",
        "as_nonnull",
        "(satisfies as string)!",
        "(satisfies as string)!",
    ),
    (
        "satisfies",
        "member_as",
        "satisfies.p as string",
        "satisfies.p as string",
    ),
    (
        "satisfies",
        "as_member",
        "(satisfies as any).p",
        "(satisfies as any).p",
    ),
    (
        "satisfies",
        "as_in_call",
        "f(satisfies as string)",
        "f(satisfies as string)",
    ),
    (
        "satisfies",
        "as_in_array",
        "[satisfies as string]",
        "[satisfies as string]",
    ),
    (
        "satisfies",
        "as_in_cond",
        "satisfies as any ? 1 : 2",
        "(satisfies as any) ? 1 : 2",
    ),
    ("of", "bare", "of", "of"),
    ("of", "as", "of as string", "of as string"),
    ("of", "as_union", "of as 'a' | 'b'", "of as \"a\" | \"b\""),
    ("of", "as_as", "of as any as string", "of as any as string"),
    (
        "of",
        "satisfies",
        "of satisfies string",
        "of satisfies string",
    ),
    (
        "of",
        "as_satisfies",
        "of as any satisfies string",
        "of as any satisfies string",
    ),
    ("of", "src_paren_as", "(of) as string", "of as string"),
    ("of", "nonnull", "of!", "of!"),
    ("of", "nonnull_as", "of! as string", "of! as string"),
    ("of", "as_nonnull", "(of as string)!", "(of as string)!"),
    ("of", "member_as", "of.p as string", "of.p as string"),
    ("of", "as_member", "(of as any).p", "(of as any).p"),
    ("of", "as_in_call", "f(of as string)", "f(of as string)"),
    ("of", "as_in_array", "[of as string]", "[of as string]"),
    (
        "of",
        "as_in_cond",
        "of as any ? 1 : 2",
        "(of as any) ? 1 : 2",
    ),
    ("async", "bare", "async", "async"),
    (
        "async",
        "src_paren_as",
        "(async) as string",
        "async as string",
    ),
    ("async", "nonnull", "async!", "async!"),
    (
        "async",
        "nonnull_as",
        "async! as string",
        "async! as string",
    ),
    (
        "async",
        "member_as",
        "async.p as string",
        "async.p as string",
    ),
    ("accessor", "bare", "accessor", "accessor"),
    ("accessor", "as", "accessor as string", "accessor as string"),
    (
        "accessor",
        "as_union",
        "accessor as 'a' | 'b'",
        "accessor as \"a\" | \"b\"",
    ),
    (
        "accessor",
        "as_as",
        "accessor as any as string",
        "accessor as any as string",
    ),
    (
        "accessor",
        "as_satisfies",
        "accessor as any satisfies string",
        "accessor as any satisfies string",
    ),
    (
        "accessor",
        "src_paren_as",
        "(accessor) as string",
        "accessor as string",
    ),
    ("accessor", "nonnull", "accessor!", "accessor!"),
    (
        "accessor",
        "nonnull_as",
        "accessor! as string",
        "accessor! as string",
    ),
    (
        "accessor",
        "as_nonnull",
        "(accessor as string)!",
        "(accessor as string)!",
    ),
    (
        "accessor",
        "member_as",
        "accessor.p as string",
        "accessor.p as string",
    ),
    (
        "accessor",
        "as_member",
        "(accessor as any).p",
        "(accessor as any).p",
    ),
    (
        "accessor",
        "as_in_call",
        "f(accessor as string)",
        "f(accessor as string)",
    ),
    (
        "accessor",
        "as_in_array",
        "[accessor as string]",
        "[accessor as string]",
    ),
    (
        "accessor",
        "as_in_cond",
        "accessor as any ? 1 : 2",
        "(accessor as any) ? 1 : 2",
    ),
    ("global", "bare", "global", "global"),
    ("global", "as", "global as string", "global as string"),
    (
        "global",
        "as_union",
        "global as 'a' | 'b'",
        "global as \"a\" | \"b\"",
    ),
    (
        "global",
        "as_as",
        "global as any as string",
        "global as any as string",
    ),
    (
        "global",
        "satisfies",
        "global satisfies string",
        "global satisfies string",
    ),
    (
        "global",
        "as_satisfies",
        "global as any satisfies string",
        "global as any satisfies string",
    ),
    (
        "global",
        "src_paren_as",
        "(global) as string",
        "global as string",
    ),
    ("global", "nonnull", "global!", "global!"),
    (
        "global",
        "nonnull_as",
        "global! as string",
        "global! as string",
    ),
    (
        "global",
        "as_nonnull",
        "(global as string)!",
        "(global as string)!",
    ),
    (
        "global",
        "member_as",
        "global.p as string",
        "global.p as string",
    ),
    (
        "global",
        "as_member",
        "(global as any).p",
        "(global as any).p",
    ),
    (
        "global",
        "as_in_call",
        "f(global as string)",
        "f(global as string)",
    ),
    (
        "global",
        "as_in_array",
        "[global as string]",
        "[global as string]",
    ),
    (
        "global",
        "as_in_cond",
        "global as any ? 1 : 2",
        "(global as any) ? 1 : 2",
    ),
    ("declare", "bare", "declare", "declare"),
    ("declare", "as", "declare as string", "declare as string"),
    (
        "declare",
        "as_union",
        "declare as 'a' | 'b'",
        "declare as \"a\" | \"b\"",
    ),
    (
        "declare",
        "as_as",
        "declare as any as string",
        "declare as any as string",
    ),
    (
        "declare",
        "as_satisfies",
        "declare as any satisfies string",
        "declare as any satisfies string",
    ),
    (
        "declare",
        "src_paren_as",
        "(declare) as string",
        "declare as string",
    ),
    ("declare", "nonnull", "declare!", "declare!"),
    (
        "declare",
        "nonnull_as",
        "declare! as string",
        "declare! as string",
    ),
    (
        "declare",
        "as_nonnull",
        "(declare as string)!",
        "(declare as string)!",
    ),
    (
        "declare",
        "member_as",
        "declare.p as string",
        "declare.p as string",
    ),
    (
        "declare",
        "as_member",
        "(declare as any).p",
        "(declare as any).p",
    ),
    (
        "declare",
        "as_in_call",
        "f(declare as string)",
        "f(declare as string)",
    ),
    (
        "declare",
        "as_in_array",
        "[declare as string]",
        "[declare as string]",
    ),
    (
        "declare",
        "as_in_cond",
        "declare as any ? 1 : 2",
        "(declare as any) ? 1 : 2",
    ),
];

/// operand kind, type operator, source expression, oracle-formatted expression.
const B_CELLS: &[(&str, &str, &str, &str)] = &[
    ("ident", "none", "foo", "foo"),
    ("ident", "as", "foo as string", "foo as string"),
    (
        "ident",
        "satisfies",
        "foo satisfies string",
        "foo satisfies string",
    ),
    ("ident", "nonnull", "foo!", "foo!"),
    (
        "ident",
        "as_as",
        "foo as any as string",
        "foo as any as string",
    ),
    ("ident", "nonnull_as", "foo! as string", "foo! as string"),
    ("member", "none", "foo.p", "foo.p"),
    ("member", "as", "foo.p as string", "foo.p as string"),
    (
        "member",
        "satisfies",
        "foo.p satisfies string",
        "foo.p satisfies string",
    ),
    ("member", "nonnull", "foo.p!", "foo.p!"),
    (
        "member",
        "as_as",
        "foo.p as any as string",
        "foo.p as any as string",
    ),
    (
        "member",
        "nonnull_as",
        "foo.p! as string",
        "foo.p! as string",
    ),
    ("computed", "none", "foo['p']", "foo[\"p\"]"),
    (
        "computed",
        "as",
        "foo['p'] as string",
        "foo[\"p\"] as string",
    ),
    (
        "computed",
        "satisfies",
        "foo['p'] satisfies string",
        "foo[\"p\"] satisfies string",
    ),
    ("computed", "nonnull", "foo['p']!", "foo[\"p\"]!"),
    (
        "computed",
        "as_as",
        "foo['p'] as any as string",
        "foo[\"p\"] as any as string",
    ),
    (
        "computed",
        "nonnull_as",
        "foo['p']! as string",
        "foo[\"p\"]! as string",
    ),
    ("call", "none", "f()", "f()"),
    ("call", "as", "f() as string", "f() as string"),
    (
        "call",
        "satisfies",
        "f() satisfies string",
        "f() satisfies string",
    ),
    ("call", "nonnull", "f()!", "f()!"),
    (
        "call",
        "as_as",
        "f() as any as string",
        "f() as any as string",
    ),
    ("call", "nonnull_as", "f()! as string", "f()! as string"),
    ("str", "none", "'a'", "\"a\""),
    ("str", "as", "'a' as string", "\"a\" as string"),
    (
        "str",
        "satisfies",
        "'a' satisfies string",
        "\"a\" satisfies string",
    ),
    ("str", "nonnull", "'a'!", "\"a\"!"),
    (
        "str",
        "as_as",
        "'a' as any as string",
        "\"a\" as any as string",
    ),
    ("str", "nonnull_as", "'a'! as string", "\"a\"! as string"),
    ("num", "none", "1", "1"),
    ("num", "as", "1 as string", "1 as string"),
    (
        "num",
        "satisfies",
        "1 satisfies string",
        "1 satisfies string",
    ),
    ("num", "nonnull", "1!", "1!"),
    ("num", "as_as", "1 as any as string", "1 as any as string"),
    ("num", "nonnull_as", "1! as string", "1! as string"),
    ("object", "none", "{ a: 1 }", "{ a: 1 }"),
    ("object", "as", "{ a: 1 } as string", "{ a: 1 } as string"),
    (
        "object",
        "satisfies",
        "{ a: 1 } satisfies string",
        "{ a: 1 } satisfies string",
    ),
    ("object", "nonnull", "{ a: 1 }!", "{ a: 1 }!"),
    (
        "object",
        "as_as",
        "{ a: 1 } as any as string",
        "{ a: 1 } as any as string",
    ),
    (
        "object",
        "nonnull_as",
        "{ a: 1 }! as string",
        "{ a: 1 }! as string",
    ),
    ("object_member", "none", "{ a: 1 }.a", "{ a: 1 }.a"),
    (
        "object_member",
        "as",
        "{ a: 1 }.a as string",
        "{ a: 1 }.a as string",
    ),
    (
        "object_member",
        "satisfies",
        "{ a: 1 }.a satisfies string",
        "{ a: 1 }.a satisfies string",
    ),
    ("object_member", "nonnull", "{ a: 1 }.a!", "{ a: 1 }.a!"),
    (
        "object_member",
        "as_as",
        "{ a: 1 }.a as any as string",
        "{ a: 1 }.a as any as string",
    ),
    (
        "object_member",
        "nonnull_as",
        "{ a: 1 }.a! as string",
        "{ a: 1 }.a! as string",
    ),
    ("array", "none", "[1, 2]", "[1, 2]"),
    ("array", "as", "[1, 2] as string", "[1, 2] as string"),
    (
        "array",
        "satisfies",
        "[1, 2] satisfies string",
        "[1, 2] satisfies string",
    ),
    ("array", "nonnull", "[1, 2]!", "[1, 2]!"),
    (
        "array",
        "as_as",
        "[1, 2] as any as string",
        "[1, 2] as any as string",
    ),
    (
        "array",
        "nonnull_as",
        "[1, 2]! as string",
        "[1, 2]! as string",
    ),
    ("binary", "none", "a + b", "a + b"),
    ("binary", "as", "a + b as string", "(a + b) as string"),
    (
        "binary",
        "satisfies",
        "a + b satisfies string",
        "(a + b) satisfies string",
    ),
    ("binary", "nonnull", "a + b!", "a + b!"),
    (
        "binary",
        "as_as",
        "a + b as any as string",
        "(a + b) as any as string",
    ),
    (
        "binary",
        "nonnull_as",
        "a + b! as string",
        "(a + b!) as string",
    ),
    ("ternary", "none", "a ? b : c", "a ? b : c"),
    (
        "ternary",
        "as",
        "a ? b : c as string",
        "a ? b : (c as string)",
    ),
    (
        "ternary",
        "satisfies",
        "a ? b : c satisfies string",
        "a ? b : (c satisfies string)",
    ),
    ("ternary", "nonnull", "a ? b : c!", "a ? b : c!"),
    (
        "ternary",
        "as_as",
        "a ? b : c as any as string",
        "a ? b : (c as any as string)",
    ),
    (
        "ternary",
        "nonnull_as",
        "a ? b : c! as string",
        "a ? b : (c! as string)",
    ),
    ("template", "none", "`x${a}y`", "`x${a}y`"),
    ("template", "as", "`x${a}y` as string", "`x${a}y` as string"),
    (
        "template",
        "satisfies",
        "`x${a}y` satisfies string",
        "`x${a}y` satisfies string",
    ),
    ("template", "nonnull", "`x${a}y`!", "`x${a}y`!"),
    (
        "template",
        "as_as",
        "`x${a}y` as any as string",
        "`x${a}y` as any as string",
    ),
    (
        "template",
        "nonnull_as",
        "`x${a}y`! as string",
        "`x${a}y`! as string",
    ),
    ("unary", "none", "!a", "!a"),
    ("unary", "as", "!a as string", "!a as string"),
    (
        "unary",
        "satisfies",
        "!a satisfies string",
        "!a satisfies string",
    ),
    ("unary", "nonnull", "!a!", "!a!"),
    (
        "unary",
        "as_as",
        "!a as any as string",
        "!a as any as string",
    ),
    ("unary", "nonnull_as", "!a! as string", "!a! as string"),
    ("optchain", "none", "a?.p", "a?.p"),
    ("optchain", "as", "a?.p as string", "a?.p as string"),
    (
        "optchain",
        "satisfies",
        "a?.p satisfies string",
        "a?.p satisfies string",
    ),
    ("optchain", "nonnull", "a?.p!", "a?.p!"),
    (
        "optchain",
        "as_as",
        "a?.p as any as string",
        "a?.p as any as string",
    ),
    (
        "optchain",
        "nonnull_as",
        "a?.p! as string",
        "a?.p! as string",
    ),
    ("newx", "none", "new Foo()", "new Foo()"),
    ("newx", "as", "new Foo() as string", "new Foo() as string"),
    (
        "newx",
        "satisfies",
        "new Foo() satisfies string",
        "new Foo() satisfies string",
    ),
    ("newx", "nonnull", "new Foo()!", "new Foo()!"),
    (
        "newx",
        "as_as",
        "new Foo() as any as string",
        "new Foo() as any as string",
    ),
    (
        "newx",
        "nonnull_as",
        "new Foo()! as string",
        "new Foo()! as string",
    ),
    ("src_paren", "none", "(foo)", "foo"),
    ("src_paren", "as", "(foo) as string", "foo as string"),
    (
        "src_paren",
        "satisfies",
        "(foo) satisfies string",
        "foo satisfies string",
    ),
    ("src_paren", "nonnull", "(foo)!", "foo!"),
    (
        "src_paren",
        "as_as",
        "(foo) as any as string",
        "foo as any as string",
    ),
    (
        "src_paren",
        "nonnull_as",
        "(foo)! as string",
        "foo! as string",
    ),
];
