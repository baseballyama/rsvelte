//! A bare `:global` opening a nested relative selector is replaced by `&` (#4393).
//!
//! Upstream's `ComplexSelector` visitor removes the `:global` pseudo-class and
//! then, when the rule has a parent, the pseudo-class carries no arguments and
//! the relative selector has no combinator, writes an `&` where it stood
//! (`3-transform/css/index.js:288-296`). rsvelte deleted the text and wrote
//! nothing, so `.p { :global > .a { … } }` came out as `.p… { > .a { … } }` —
//! CSS no browser accepts — and `:global.a` lost the subject it was fused to.
//!
//! Every expectation below is the `css.code` `svelte.compile` emits for that
//! source, read out of `submodules/svelte`, whitespace-collapsed on both sides.
//! The three conditions upstream ANDs are each carried by a control that must
//! NOT gain an `&`: `desc_then_global` has a combinator, `args_global` has
//! arguments, and the `top_level__*` rows have no parent rule.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compiler::CssMode};

const MARKUP: &str =
    "<svg class=\"p q\"><path class=\"a\"><i class=\"b\"><u class=\"c\"></u></i></path></svg>\n";

fn css_of(style: &str) -> Result<String, String> {
    compile(
        &format!("{MARKUP}<style>\n\t{style}\n</style>"),
        CompileOptions {
            generate: GenerateMode::Server,
            css: CssMode::External,
            filename: Some("x.svelte".to_string()),
            dev: false,
            ..Default::default()
        },
    )
    .map(|result| {
        result
            .css
            .map(|c| c.code.split_whitespace().collect::<Vec<_>>().join(" "))
            .unwrap_or_default()
    })
    .map_err(|error| error.to_string())
}

/// `(name, the `<style>` body, the whitespace-collapsed `css.code` upstream emits)`.
const NESTED: &[(&str, &str, &str)] = &[
    (
        "bare_global__bare_global_desc",
        ":global {
		:global .a { opacity: 1; }
	}",
        "/* :global {*/ & .a { opacity: 1; } /*}*/",
    ),
    (
        "bare_global__bare_global_compound",
        ":global {
		:global.a { opacity: 1; }
	}",
        "/* :global {*/ &.a { opacity: 1; } /*}*/",
    ),
    (
        "bare_global__bare_global_child",
        ":global {
		:global > .a { opacity: 1; }
	}",
        "/* :global {*/ & > .a { opacity: 1; } /*}*/",
    ),
    (
        "bare_global__desc_then_global",
        ":global {
		.b :global .a { opacity: 1; }
	}",
        "/* :global {*/ .b .a { opacity: 1; } /*}*/",
    ),
    (
        "bare_global__args_global",
        ":global {
		:global(.a) { opacity: 1; }
	}",
        "/* :global {*/ .a { opacity: 1; } /*}*/",
    ),
    (
        "prefixed_global__bare_global_desc",
        ".p :global {
		:global .a { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { & .a { opacity: 1; } }",
    ),
    (
        "prefixed_global__bare_global_compound",
        ".p :global {
		:global.a { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { &.a { opacity: 1; } }",
    ),
    (
        "prefixed_global__bare_global_child",
        ".p :global {
		:global > .a { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { & > .a { opacity: 1; } }",
    ),
    (
        "prefixed_global__desc_then_global",
        ".p :global {
		.b :global .a { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { .b .a { opacity: 1; } }",
    ),
    (
        "prefixed_global__args_global",
        ".p :global {
		:global(.a) { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { .a { opacity: 1; } }",
    ),
    (
        "plain__bare_global_desc",
        ".p {
		:global .a { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { & .a { opacity: 1; } }",
    ),
    (
        "plain__bare_global_compound",
        ".p {
		:global.a { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { &.a { opacity: 1; } }",
    ),
    (
        "plain__bare_global_child",
        ".p {
		:global > .a { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { & > .a { opacity: 1; } }",
    ),
    (
        "plain__desc_then_global",
        ".p {
		.b :global .a { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { .b:where(.svelte-1lj1c2o) .a { opacity: 1; } }",
    ),
    (
        "plain__args_global",
        ".p {
		:global(.a) { opacity: 1; }
	}",
        ".p.svelte-1lj1c2o { .a { opacity: 1; } }",
    ),
];

/// Preludes upstream rejects; the code is what `svelte.compile` throws.
const REJECTED: &[(&str, &str, &str)] = &[
    (
        "bare_global__bare_global_alone",
        ":global {
		:global { opacity: 1; }
	}",
        "css_global_block_invalid_declaration",
    ),
    (
        "prefixed_global__bare_global_alone",
        ".p :global {
		:global { opacity: 1; }
	}",
        "css_global_block_invalid_declaration",
    ),
    (
        "plain__bare_global_alone",
        ".p {
		:global { opacity: 1; }
	}",
        "css_global_block_invalid_declaration",
    ),
];

/// No parent rule, so upstream writes no `&` however the `:global` is spelled.
const TOP_LEVEL: &[(&str, &str, &str)] = &[
    (
        "top_level__bare_global_desc",
        ":global .a { opacity: 1; }",
        ".a { opacity: 1; }",
    ),
    (
        "top_level__bare_global_compound",
        ":global.a { opacity: 1; }",
        "!css_global_block_invalid_modifier_start",
    ),
    (
        "top_level__args_global",
        ":global(.a) { opacity: 1; }",
        ".a { opacity: 1; }",
    ),
];

#[test]
fn a_bare_global_in_a_nested_rule_is_replaced_by_an_ampersand() {
    let mut failures = Vec::new();
    for (name, style, expected) in NESTED {
        match css_of(style) {
            Ok(css) if css == *expected => {}
            Ok(css) => failures.push(format!("{name}: expected {expected:?}\n      got {css:?}")),
            Err(error) => failures.push(format!(
                "{name}: expected {expected:?}\n      threw {error}"
            )),
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

#[test]
fn a_global_block_with_no_declaration_is_still_rejected() {
    for (name, style, code) in REJECTED {
        let error = css_of(style).expect_err(&format!("{name} must be rejected"));
        assert!(error.contains(code), "{name}: expected {code} in {error}");
    }
}

#[test]
fn a_global_with_no_parent_rule_gains_nothing() {
    let mut failures = Vec::new();
    for (name, style, expected) in TOP_LEVEL {
        match (expected.strip_prefix('!'), css_of(style)) {
            (Some(code), Err(error)) if error.contains(code) => {}
            (Some(code), other) => failures.push(format!("{name}: expected {code}, got {other:?}")),
            (None, Ok(css)) if css == *expected => {}
            (None, other) => failures.push(format!(
                "{name}: expected {expected:?}\n      got {other:?}"
            )),
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
