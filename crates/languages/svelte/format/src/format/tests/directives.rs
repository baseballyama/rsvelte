//! Directive names and block patterns, which the plugin prints from what Svelte reads.

use super::*;

#[test]
fn modifiers_the_plugin_drops_are_dropped() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    for (input, expected) in [
        ("<div use:a|x={b}></div>\n", "<div use:a={b}></div>\n"),
        (
            "<div bind:value|x={v}></div>\n",
            "<div bind:value={v}></div>\n",
        ),
        (
            "<div bind:value|x={value}></div>\n",
            "<div bind:value></div>\n",
        ),
        ("<div class:a|x={b}></div>\n", "<div class:a={b}></div>\n"),
        ("<div class:on|once></div>\n", "<div class:on></div>\n"),
        ("<div animate:a|x></div>\n", "<div animate:a></div>\n"),
        ("<div let:a|x></div>\n", "<div let:a></div>\n"),
        (
            "<div on:click|once={f}></div>\n",
            "<div on:click|once={f}></div>\n",
        ),
        (
            "<div style:color|important=\"red\"></div>\n",
            "<div style:color|important=\"red\"></div>\n",
        ),
    ] {
        assert_eq!(formatted(input), expected, "{input}");
    }
}

#[test]
fn a_regular_expression_or_a_bigint_default_in_a_block_pattern_prints_as_written() {
    // Expected outputs from Prettier 3.9.10 with prettier-plugin-svelte 4.1.1.
    for source_text in [
        "{#each items as { a = /a/g }}x{/each}\n",
        "{#each items as { a = 1n }}x{/each}\n",
    ] {
        assert_eq!(formatted(source_text), source_text);
    }
}
