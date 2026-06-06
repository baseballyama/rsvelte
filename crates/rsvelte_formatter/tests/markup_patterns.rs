//! Destructuring-pattern formatting in `{#each ... as PATTERN}`,
//! `{:then PATTERN}`, `{:catch PATTERN}`, `{#snippet name(PARAM)}`,
//! and `let:item={PATTERN}`.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn each_simple_identifier_context() {
    let src = "{#each items as item}<li>{item}</li>{/each}";
    assert_eq!(fmt(src), src); // identifier — no whitespace to collapse
}

#[test]
fn each_object_destructuring_normalizes() {
    let out = fmt("{#each users as { name,age }}<li>{name}</li>{/each}");
    assert!(
        out.contains("as { name, age }"),
        "expected normalized object pattern:\n{out}"
    );
}

#[test]
fn each_object_destructuring_with_default() {
    let out = fmt("{#each users as { name, age=18 }}<li>{name}</li>{/each}");
    assert!(
        out.contains("as { name, age = 18 }"),
        "expected default-value pattern formatted:\n{out}"
    );
}

#[test]
fn each_array_destructuring_with_rest() {
    let out = fmt("{#each pairs as [first,...rest]}<li>{first}</li>{/each}");
    assert!(
        out.contains("as [first, ...rest]"),
        "expected array+rest pattern formatted:\n{out}"
    );
}

#[test]
fn each_nested_destructuring() {
    let out = fmt("{#each items as {data:{name},id}}<li>{name}</li>{/each}");
    assert!(
        out.contains("as { data: { name }, id }"),
        "expected nested pattern formatted:\n{out}"
    );
}

#[test]
fn await_then_destructuring() {
    let out = fmt("{#await req}<p>...</p>{:then {data,status}}<p>{data}</p>{/await}");
    assert!(
        out.contains(":then { data, status }"),
        "expected then-pattern formatted:\n{out}"
    );
}

#[test]
fn await_catch_destructuring() {
    let out = fmt(
        "{#await req}<p>...</p>{:then x}<p>{x}</p>{:catch {message,stack}}<p>{message}</p>{/await}",
    );
    assert!(
        out.contains(":catch { message, stack }"),
        "expected catch-pattern formatted:\n{out}"
    );
}

#[test]
fn snippet_simple_parameter() {
    let src = "{#snippet item(name)}<li>{name}</li>{/snippet}";
    assert_eq!(fmt(src), src);
}

#[test]
fn snippet_object_destructuring_parameter() {
    let out = fmt("{#snippet item({name,age})}<li>{name}</li>{/snippet}");
    assert!(
        out.contains("{#snippet item({ name, age })}"),
        "expected snippet param pattern formatted:\n{out}"
    );
}

// ─── Snippet parameter lists are TS function parameters (#684) ───────────
//
// Optional (`?`), type-annotated, and default-valued params must round-trip
// and never leak the internal `__rsvelte_fmt_rhs__` sentinel.

fn fmt_ts(snippet: &str) -> String {
    let src = format!("<script lang=\"ts\"></script>\n{snippet}\n");
    format(&src, &FormatOptions::default()).expect("format ok")
}

#[test]
fn snippet_optional_typed_parameter() {
    let out = fmt_ts("{#snippet f(x?: string)}<p>{x}</p>{/snippet}");
    assert!(
        out.contains("{#snippet f(x?: string)}"),
        "optional param dropped/garbled:\n{out}"
    );
}

#[test]
fn snippet_default_value_parameter() {
    let out = fmt_ts("{#snippet f(x: number = 1)}<p>{x}</p>{/snippet}");
    assert!(
        out.contains("{#snippet f(x: number = 1)}"),
        "default-value param dropped/garbled:\n{out}"
    );
}

#[test]
fn snippet_typed_default_does_not_leak_sentinel() {
    let out = fmt_ts("{#snippet f(items: string[] = [])}<p>{items}</p>{/snippet}");
    assert!(
        !out.contains("__rsvelte_fmt_rhs__"),
        "internal sentinel leaked into output:\n{out}"
    );
    assert!(
        out.contains("{#snippet f(items: string[] = [])}"),
        "typed default param garbled:\n{out}"
    );
}

#[test]
fn snippet_multiple_optional_parameters() {
    let out = fmt_ts(
        "{#snippet chip(label: string, subLabel?: string, icon?: number)}<p>{label}</p>{/snippet}",
    );
    assert!(
        out.contains("{#snippet chip(label: string, subLabel?: string, icon?: number)}"),
        "multi optional/typed params garbled:\n{out}"
    );
}

#[test]
fn snippet_multiple_parameters() {
    let out = fmt("{#snippet row({name},{ value })}<li>{name}</li>{/snippet}");
    // Each parameter is formatted independently — the comma between
    // them keeps its source spacing because parameter-list rewrites
    // would require a wider edit (tracked in roadmap).
    assert!(
        out.contains("{ name }"),
        "expected first param formatted:\n{out}"
    );
    assert!(
        out.contains("{ value }"),
        "expected second param formatted:\n{out}"
    );
}

#[test]
fn let_directive_with_destructuring() {
    let out = fmt("<Component let:item={{name,age}}>x</Component>");
    assert!(
        out.contains("let:item={{ name, age }}"),
        "expected let directive pattern formatted:\n{out}"
    );
}
