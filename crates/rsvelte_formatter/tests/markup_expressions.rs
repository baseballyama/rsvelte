//! Phase 1 coverage: format every JS expression that can appear inside
//! an attribute value, a directive value, a Svelte block header, or a
//! standalone tag (`@html` / `@render` / `@debug` / `@attach`). Markup,
//! whitespace, attribute order, etc. all stay verbatim.

use rsvelte_formatter::{FormatOptions, format};

fn fmt(src: &str) -> String {
    format(src, &FormatOptions::default()).expect("format ok")
}

// ─── Attribute values ────────────────────────────────────────────────────

#[test]
fn attr_expression_value() {
    let out = fmt("<div class={ foo +1 }></div>");
    assert!(
        out.contains("class={foo + 1}"),
        "expected attribute expr formatted:\n{out}"
    );
}

#[test]
fn attr_sequence_with_interp() {
    let out = fmt("<div class=\"a{ foo +1 }b\"></div>");
    assert!(
        out.contains("class=\"a{foo + 1}b\""),
        "expected interp inside attribute sequence formatted:\n{out}"
    );
}

#[test]
fn attr_boolean_stays_verbatim() {
    let out = fmt("<input disabled />");
    assert_eq!(out, "<input disabled />");
}

// ─── Spread attribute ────────────────────────────────────────────────────

#[test]
fn spread_attribute_expression() {
    let out = fmt("<div {...obj . props}></div>");
    assert!(
        out.contains("{...obj.props}"),
        "expected spread expr formatted:\n{out}"
    );
}

// ─── Directives ──────────────────────────────────────────────────────────

#[test]
fn bind_directive_expression() {
    let out = fmt("<input bind:value={ foo .bar }/>");
    assert!(
        out.contains("bind:value={foo.bar}"),
        "expected bind expr formatted:\n{out}"
    );
}

#[test]
fn class_directive_expression() {
    let out = fmt("<div class:active={ a&&b }></div>");
    assert!(
        out.contains("class:active={a && b}"),
        "expected class directive expr formatted:\n{out}"
    );
}

#[test]
fn on_directive_with_handler() {
    let out = fmt("<button on:click={() =>count++}>x</button>");
    assert!(
        out.contains("on:click={() => count++}"),
        "expected on directive expr formatted:\n{out}"
    );
}

#[test]
fn on_directive_without_handler() {
    let out = fmt("<button on:click>x</button>");
    assert_eq!(out, "<button on:click>x</button>");
}

#[test]
fn use_directive_with_argument() {
    let out = fmt("<div use:action={ {a:1} }></div>");
    assert!(
        out.contains("use:action={{ a: 1 }}"),
        "expected use directive expr formatted:\n{out}"
    );
}

#[test]
fn transition_directive_with_argument() {
    let out = fmt("<div transition:fade={ { duration : 200 } }></div>");
    assert!(
        out.contains("transition:fade={{ duration: 200 }}"),
        "expected transition directive expr formatted:\n{out}"
    );
}

#[test]
fn style_directive_value() {
    let out = fmt("<div style:color={ active?'red':'blue' }></div>");
    assert!(
        out.contains("style:color={active ? \"red\" : \"blue\"}"),
        "expected style directive value formatted:\n{out}"
    );
}

// ─── Block headers ───────────────────────────────────────────────────────

#[test]
fn if_block_test() {
    let out = fmt("{#if foo +1}<p>x</p>{/if}");
    assert!(
        out.contains("{#if foo + 1}"),
        "expected if test formatted:\n{out}"
    );
}

#[test]
fn if_else_block_both_branches() {
    let out = fmt("{#if a&&b}<p>{ x +1 }</p>{:else}<p>{ y +2 }</p>{/if}");
    assert!(out.contains("{#if a && b}"), "{out}");
    assert!(out.contains("{x + 1}"), "{out}");
    assert!(out.contains("{y + 2}"), "{out}");
}

#[test]
fn each_block_iterable_and_key() {
    let out = fmt("{#each items.map(x=>x) as item (item.id)}<li>{ item.name }</li>{/each}");
    assert!(
        out.contains("{#each items.map((x) => x)"),
        "expected each iterable formatted:\n{out}"
    );
    assert!(
        out.contains("(item.id)"),
        "expected each key formatted:\n{out}"
    );
    assert!(
        out.contains("{item.name}"),
        "expected each body interp formatted:\n{out}"
    );
}

#[test]
fn await_block_promise() {
    let out = fmt("{#await fetch( url )}<p>loading</p>{:then data}<p>{ data.value }</p>{/await}");
    assert!(
        out.contains("{#await fetch(url)}"),
        "expected await promise formatted:\n{out}"
    );
    assert!(
        out.contains("{data.value}"),
        "expected then-body interp formatted:\n{out}"
    );
}

#[test]
fn key_block_expression() {
    let out = fmt("{#key value+1}<p>x</p>{/key}");
    assert!(
        out.contains("{#key value + 1}"),
        "expected key expr formatted:\n{out}"
    );
}

// ─── Tags ────────────────────────────────────────────────────────────────

#[test]
fn html_tag() {
    let out = fmt("{@html  raw +'x' }");
    assert!(
        out.contains("{@html raw + \"x\"}"),
        "expected @html expr formatted:\n{out}"
    );
}

#[test]
fn render_tag() {
    let out = fmt("{@render foo (a , b )}");
    assert!(
        out.contains("{@render foo(a, b)}"),
        "expected @render expr formatted:\n{out}"
    );
}

#[test]
fn debug_tag_multiple_identifiers() {
    let out = fmt("{@debug a, b, c}");
    assert!(
        out.contains("{@debug a, b, c}"),
        "expected @debug identifiers formatted (no-op):\n{out}"
    );
}

#[test]
fn attach_tag_as_attribute() {
    let out = fmt("<div {@attach  effect (x ) }></div>");
    assert!(
        out.contains("{@attach effect(x)}"),
        "expected @attach expr formatted:\n{out}"
    );
}

// ─── svelte:component / svelte:element ───────────────────────────────────

#[test]
fn svelte_component_this() {
    let out = fmt("<svelte:component this={ Comp ||Fallback } />");
    assert!(
        out.contains("this={Comp || Fallback}"),
        "expected svelte:component this expr formatted:\n{out}"
    );
}

#[test]
fn svelte_element_this() {
    let out = fmt("<svelte:element this={ tagName ||'div' }></svelte:element>");
    assert!(
        out.contains("this={tagName || \"div\"}"),
        "expected svelte:element this expr formatted:\n{out}"
    );
}

// ─── End-to-end mixed sanity ─────────────────────────────────────────────

#[test]
fn end_to_end_mix() {
    let src = "<script>let count=1+2</script>\n\
               <button on:click={() =>count++} class:active={count >5}>\n\
                 { count +3 }\n\
               </button>\n\
               {#each Array.from({length:count}) as item}<li>{ item }</li>{/each}";
    let out = fmt(src);
    assert!(out.contains("let count = 1 + 2"), "script:\n{out}");
    assert!(out.contains("on:click={() => count++}"), "on:\n{out}");
    assert!(out.contains("class:active={count > 5}"), "class:\n{out}");
    assert!(out.contains("{count + 3}"), "interp:\n{out}");
    assert!(
        out.contains("{#each Array.from({ length: count })"),
        "each:\n{out}"
    );
    assert!(out.contains("{item}"), "each-body:\n{out}");
}

// ─── #799: outer parens of a top-level sequence expression are preserved ──
// prettier-plugin-svelte keeps the redundant outer parens of a sequence
// (comma) expression in a mustache; only non-sequence redundant parens strip.

#[test]
fn sequence_keeps_outer_parens_in_mustache() {
    let out = fmt("{((a = 1), '')}");
    assert!(
        out.contains("{((a = 1), \"\")}"),
        "expected sequence outer parens kept:\n{out}"
    );
}

#[test]
fn bare_sequence_gains_outer_parens() {
    let out = fmt("<p>{a, b}</p>");
    assert!(out.contains("{(a, b)}"), "expected (a, b) wrapped:\n{out}");
}

#[test]
fn sequence_of_assignments_keeps_parens() {
    let out = fmt("{(a = 1, b = 2)}");
    assert!(
        out.contains("{((a = 1), (b = 2))}"),
        "expected each assignment + outer wrapped:\n{out}"
    );
}

#[test]
fn non_sequence_redundant_parens_still_strip() {
    let out = fmt("<p>{(a + 1)}</p>");
    assert!(
        out.contains("{a + 1}"),
        "expected redundant parens stripped:\n{out}"
    );
    assert!(
        !out.contains("{(a + 1)}"),
        "non-sequence outer parens must still strip:\n{out}"
    );
}

#[test]
fn sequence_in_attribute_value_keeps_parens() {
    let out = fmt("<div class={(a, b)}></div>");
    assert!(
        out.contains("class={(a, b)}"),
        "expected attr sequence parens kept:\n{out}"
    );
}

#[test]
fn sequence_in_block_header_keeps_parens() {
    let out = fmt("{#if (a, b)}x{/if}");
    assert!(
        out.contains("{#if (a, b)}"),
        "expected block-header sequence parens kept:\n{out}"
    );
}
