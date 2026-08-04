//! Overflowing block headers keep their grouped call arguments' expanded
//! spacing (#1976).
//!
//! When a `{#if}` / `{#each}` / `{#key}` / `{#await}` header line does not fit
//! the print width, the oracle still prints it on one line, but renders every
//! call whose arguments it lays out "grouped" from that expanded layout:
//! `callee( a, b )`, one space inside each delimiter, arguments flat, no
//! trailing comma. The trigger is the width of the *whole* header line —
//! indent, opener, expression and the `as …}` suffix — not the expression alone.
//!
//! Every expectation here is the recorded output of the `oxfmt --svelte` oracle
//! at `printWidth: 80`, the corpus configuration.

use rsvelte_formatter::{FormatOptions, format};

/// `FormatOptions::default()` prints at 100 columns; the expectations below were
/// recorded from the oracle at the corpus width, so pin it.
fn fmt(src: &str) -> String {
    let mut options = FormatOptions::default();
    options.js.line_width = oxc_formatter_core::LineWidth::try_from(80).unwrap();
    format(src, &options).expect("format ok")
}

/// The last header line (`{#…}` / `{:…}`) of the formatted output.
fn header_of(out: &str) -> String {
    out.lines()
        .rfind(|l| l.trim_start().starts_with("{#") || l.trim_start().starts_with("{:"))
        .unwrap_or_default()
        .trim()
        .to_string()
}

#[test]
fn overflowing_each_header_expands_grouped_call() {
    // The #1976 repro, reduced from skeleton's date-picker examples.
    let src = concat!(
        "{#each datePicker().getMonthsGrid({ columns: 4, format: 'short' }) as months, id (id)}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        r#"{#each datePicker().getMonthsGrid( { columns: 4, format: "short" } ) as months, id (id)}"#
    );
}

#[test]
fn fitting_header_stays_hugged() {
    // The same call shape, 66 columns wide: it fits, so the oracle leaves it
    // hugged. Only the overflow triggers the rewrite.
    let src = concat!(
        "{#each datePicker().getYearsGrid({ columns: 4 }) as years, id (id)}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each datePicker().getYearsGrid({ columns: 4 }) as years, id (id)}"
    );
}

#[test]
fn suffix_width_counts_toward_the_trigger() {
    // The call itself is tiny; the header overflows only because of the `as …}`
    // clause, and the oracle expands the call all the same.
    let src = concat!(
        "{#each f({ a: 1 }) as monthsAndSomeVeryLongNameThatOverflowsTheLimitHere, id (id)}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each f( { a: 1 } ) as monthsAndSomeVeryLongNameThatOverflowsTheLimitHere, id (id)}"
    );
}

#[test]
fn indent_depth_counts_toward_the_trigger() {
    // Identical header two levels deep: the added indent is what pushes it past
    // the print width.
    let src = concat!(
        "<div>\n",
        "\t<div>\n",
        "\t\t{#each datePicker().getYearsGrid({ columns: 4, format: 'short' }) as years, id (id)}\n",
        "\t\t\t<p>x</p>\n",
        "\t\t{/each}\n",
        "\t</div>\n",
        "</div>\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        r#"{#each datePicker().getYearsGrid( { columns: 4, format: "short" } ) as years, id (id)}"#
    );
}

#[test]
fn expansion_recurses_through_nested_calls() {
    let src = concat!(
        "{#each wrapOuter(innerCall({ a: 1, b: 2, c: 3 }), { d: 4, e: 5 }) as months, id (id)}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each wrapOuter( innerCall( { a: 1, b: 2, c: 3 } ), { d: 4, e: 5 } ) as months, id (id)}"
    );
}

#[test]
fn expansion_reaches_calls_inside_a_logical_operand() {
    // The header is not a call at the top level, so the rewrite has to walk into
    // the operands rather than test only the outermost expression.
    let src = concat!(
        "{#if checkCondition({ alpha: 1, beta: 2, gamma: 3 }) && okFlagValueHereOkayFineYes}\n",
        "\t<p>x</p>\n",
        "{/if}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#if checkCondition( { alpha: 1, beta: 2, gamma: 3 } ) && okFlagValueHereOkayFineYes}"
    );
}

#[test]
fn ungrouped_call_keeps_flat_parens_when_overflowing() {
    // An arrow last argument with a bare expression body is not groupable, so
    // the oracle leaves the overflowing header exactly as it found it.
    let src = concat!(
        "{#each items.filter((item) => item.value > thresholdValueHereOkayFine) as m, id (id)}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each items.filter((item) => item.value > thresholdValueHereOkayFine) as m, id (id)}"
    );
}

#[test]
fn penultimate_argument_of_the_same_shape_suppresses_expansion() {
    let src = concat!(
        "{#each getGrid({ alpha: 1, beta: 2 }, { gamma: 3, delta: 4 }) as monthsHere, id (id)}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each getGrid({ alpha: 1, beta: 2 }, { gamma: 3, delta: 4 }) as monthsHere, id (id)}"
    );
}

#[test]
fn key_and_await_headers_expand_too() {
    let src = concat!(
        "{#key datePicker().getMonthsGrid({ columns: 4, format: 'shortest1234567890AB' })}\n",
        "\t<p>x</p>\n",
        "{/key}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        r#"{#key datePicker().getMonthsGrid( { columns: 4, format: "shortest1234567890AB" } )}"#
    );

    let src = concat!(
        "{#await getTheGrid({ columns: 4, format: 'shorter' }) then valueHereOkayFineOkay}\n",
        "\t<p>x</p>\n",
        "{/await}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        r#"{#await getTheGrid( { columns: 4, format: "shorter" } ) then valueHereOkayFineOkay}"#
    );
}

#[test]
fn else_if_header_expands_with_its_wider_opener() {
    let src = concat!(
        "{#if a}\n",
        "\t<p>x</p>\n",
        "{:else if datePicker().getMonthsGrid({ columns: 4, format: 'short12345678901' })}\n",
        "\t<p>y</p>\n",
        "{/if}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        r#"{:else if datePicker().getMonthsGrid( { columns: 4, format: "short12345678901" } )}"#
    );
}

#[test]
fn each_key_expression_expands_too() {
    // The key is a second JS expression in the same header, and it gets the same
    // treatment as the iterable.
    let src = concat!(
        "{#each items as item, index (computeKey({ id: item.id, salt: 42, another: 12345 }))}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each items as item, index (computeKey( { id: item.id, salt: 42, another: 12345 } ))}"
    );
}

#[test]
fn fitting_each_key_stays_hugged() {
    let src = concat!(
        "{#each items as item (getKey(item))}\n",
        "\t<p>x</p>\n",
        "{/each}\n"
    );
    assert_eq!(header_of(&fmt(src)), "{#each items as item (getKey(item))}");

    // 79 columns: still fits, so neither the call nor its argument gains spacing.
    let src = concat!(
        "{#each items as item (getKeyValueHere({ id: item.id, salt: 424242, more: 1 }))}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each items as item (getKeyValueHere({ id: item.id, salt: 424242, more: 1 }))}"
    );
}

#[test]
fn a_long_iterable_pushes_the_key_over_the_width() {
    // The key is short; only the iterable's length overflows the header, and the
    // key expands because the trigger is the whole line.
    let src = concat!(
        "{#each someVeryLongCollectionNameHereOkFineYesOkLongerStill as m, id (mk({ a: 1 }))}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each someVeryLongCollectionNameHereOkFineYesOkLongerStill as m, id (mk( { a: 1 } ))}"
    );
}

#[test]
fn each_header_settles_iterable_before_key() {
    // An `{#each}` header holds two expressions and the oracle settles them left
    // to right. Both cases below flatten to the same 78 columns and hold three
    // grouped calls; only the split between the two expressions differs.

    // Iterable one call, key two. The iterable is judged against the not-yet-
    // settled key at its widest (78 + 2*2 = 82 > 80) and expands; the key is then
    // judged against the iterable as settled (78 + 2*1 = 80) and stays flat.
    let src = concat!(
        "{#each getRows({ limit: 20 }) as item (wrap(inner({ a: 1, b: 2 }), { c: 3 }))}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each getRows( { limit: 20 } ) as item (wrap(inner({ a: 1, b: 2 }), { c: 3 }))}"
    );

    // The same counts the other way round. The iterable now fits even with the key
    // at its widest (78 + 2*1 = 80), so it stays flat — and the key, with nothing
    // ahead of it expanded, fits at 78 too. Nothing expands: measuring either
    // expression against the other *unconditionally* expanded would wrongly add
    // spacing here.
    let src = concat!(
        "{#each wrap(inner({ a: 1, b: 2 }), { c: 3 }) as item (getRows({ limit: 20 }))}\n",
        "\t<p>x</p>\n",
        "{/each}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each wrap(inner({ a: 1, b: 2 }), { c: 3 }) as item (getRows({ limit: 20 }))}"
    );
}

// #2070: a spread final argument is not a grouped-layout call, so the oracle
// keeps the header on one line even when OXC's multi-line rendering of the
// call would otherwise look like a chain break.
#[test]
fn spread_final_argument_keeps_header_on_one_line() {
    let src = concat!(
        "<script>\n",
        "\tlet alpha = 1;\n",
        "\tlet restOfTheArguments = [];\n",
        "\tlet someCalleeNameHere = { getGrid: (a, ...r) => [] };\n",
        "</script>\n",
        "\n",
        "{#if a}\n",
        "\t{#if b}\n",
        "\t\t{#each someCalleeNameHere.getGrid(alpha, ...restOfTheArguments) as m, id (id)}\n",
        "\t\t\t<div>{m}</div>\n",
        "\t\t{/each}\n",
        "\t{/if}\n",
        "{/if}\n",
    );
    assert_eq!(
        header_of(&fmt(src)),
        "{#each someCalleeNameHere.getGrid(alpha, ...restOfTheArguments) as m, id (id)}"
    );
}

// #2070: a call with an arrow-function block-body argument (e.g. an effect
// hook) prints multi-line regardless of width; the continuation lines must
// nest at the header's own indent depth, not OXC's column-0 output.
#[test]
fn arrow_block_body_argument_reindents_continuation_to_header_depth() {
    let src = concat!(
        "<script>\n",
        "\tlet depA = 1;\n",
        "\tlet depB = 2;\n",
        "\tfunction run() {}\n",
        "\tfunction useEffect(fn, deps) {}\n",
        "</script>\n",
        "\n",
        "{#if a}\n",
        "\t{#if b}\n",
        "\t\t{#if useEffect(() => { run(); }, [depA, depB])}\n",
        "\t\t\t<div>x</div>\n",
        "\t\t{/if}\n",
        "\t{/if}\n",
        "{/if}\n",
    );
    let out = fmt(src);
    let block = out
        .lines()
        .skip_while(|l| !l.trim_start().starts_with("{#if useEffect"))
        .take_while(|l| !l.trim_start().starts_with("<div>x</div>"))
        .collect::<Vec<_>>()
        .join("\n");
    assert_eq!(
        block,
        concat!(
            "    {#if useEffect(() => {\n",
            "      run();\n",
            "    }, [depA, depB])}"
        )
    );
}
