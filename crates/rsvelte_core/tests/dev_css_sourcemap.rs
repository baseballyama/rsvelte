//! The dev CSS source map. Upstream builds it with MagicString over the whole
//! `.svelte` source, so a segment lands at the start of every unedited chunk, at
//! every line start inside one, and at every `addSourcemapLocation` — which
//! `css/index.js`'s `_` visitor calls on every visited node's `start` and `end`.
//! The scoping modifier is inserted with `appendLeft`, which maps nowhere.
//!
//! The corpus gates compile with `dev: false`, so nothing else covers this.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn injected_css(src: &str) -> String {
    let out = compile(
        src,
        CompileOptions {
            filename: Some("Child.svelte".to_string()),
            generate: GenerateMode::Client,
            dev: true,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let start = out.find("base64,").expect("no inline map") + "base64,".len();
    let end = out[start..].find(" */").expect("unterminated map");
    String::from_utf8(base64_decode(&out[start..start + end])).expect("map is not utf-8")
}

fn base64_decode(input: &str) -> Vec<u8> {
    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = Vec::new();
    let mut buffer = 0u32;
    let mut bits = 0u32;
    for byte in input.bytes().filter(|b| *b != b'=') {
        let value = ALPHABET
            .iter()
            .position(|c| *c == byte)
            .unwrap_or_else(|| panic!("not base64: {byte}")) as u32;
        buffer = (buffer << 6) | value;
        bits += 6;
        if bits >= 8 {
            bits -= 8;
            out.push((buffer >> bits) as u8);
        }
    }
    out
}

const COMPONENT: &str = r#"<svelte:options css="injected" />

<h1>count</h1>

<style>
	h1 {
		color: red;
	}
</style>
"#;

#[test]
fn the_map_carries_the_source_basename_and_upstream_segments() {
    let map = injected_css(COMPONENT);
    assert!(map.contains("\"file\":\"Child.svelte\""), "got:\n{map}");
    // `;AAKA,CAAC,gBAAE,CAAC;AACJ,EAAE,UAAU;AACZ;` — the empty first line, then
    // the chunk start, the selector node, the resume after the inserted
    // `.svelte-…`, the block brace, and one segment per declaration boundary.
    assert!(
        map.contains("\"mappings\":\";AAKA,CAAC,gBAAE,CAAC;AACJ,EAAE,UAAU;AACZ;\""),
        "got:\n{map}"
    );
}

#[test]
fn a_custom_element_carries_the_map_too() {
    let map = injected_css(
        r#"<svelte:options customElement="my-widget" />

<h1>count</h1>

<style>
	h1 {
		color: red;
	}
</style>
"#,
    );
    assert!(map.contains("\"mappings\":\";AAKA,"), "got:\n{map}");
}

#[test]
fn a_partially_pruned_selector_list_keeps_its_segments() {
    let map = injected_css(
        r#"<svelte:options css="injected" />

<div class="foo">foo</div>

<style>
	.foo, .unused {
		color: green;
	}
</style>
"#,
    );
    // `overwrite` replaces the separator before the pruned selector, so the
    // ` /* (unused) ` it writes still carries that separator's position, and
    // both selectors keep segments of their own.
    assert!(
        map.contains("\"mappings\":\";AAKA,CAAC,kBAAI,aAAE,SAAO,CAAC;AACf,EAAE,YAAY;AACd;\""),
        "got:\n{map}"
    );
}

/// Every expected `mappings` below is what the pinned official compiler emits
/// for the same source with `dev: true`, `filename: "Child.svelte"`.
fn assert_mappings(source: &str, expected: &str) {
    let map = injected_css(source);
    assert!(
        map.contains(&format!("\"mappings\":\"{expected}\"")),
        "expected {expected}\ngot:\n{map}"
    );
}

#[test]
fn a_nested_rule_maps_its_declarations() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a"><b class="b">b</b></div>

<style>
	.a {
		color: red;
		& .b { color: blue }
	}
</style>
"#,
        ";AAKA,CAAC,gBAAE,CAAC;AACJ,EAAE,UAAU;AACZ,EAAE,CAAC,CAAC,wBAAE,CAAC,EAAE,YAAY;AACrB;",
    );
}

#[test]
fn an_at_rule_maps_its_prelude_and_body() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	@media (min-width: 10px) {
		.a { color: red }
	}
</style>
"#,
        ";AAKA,CAAC,yBAAyB;AAC1B,EAAE,gBAAE,CAAC,EAAE,WAAW;AAClB;",
    );
}

#[test]
fn an_at_rule_nested_in_a_rule_maps_too() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	.a {
		@media (min-width: 10px) { color: red }
	}
</style>
"#,
        ";AAKA,CAAC,gBAAE,CAAC;AACJ,EAAE,yBAAyB,EAAE,WAAW;AACxC;",
    );
}

#[test]
fn a_keyframes_prefix_is_an_insertion_not_a_reset() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	@keyframes k { from { opacity: 0 } }
	.a { animation: k 1s }
</style>
"#,
        ";AAKA,CAAC,yBAAW;AACZ,CAAC,gBAAE,CAAC,EAAE,yBAAW,KAAK;",
    );
}

#[test]
fn a_nested_keyframes_keeps_the_rest_of_the_stylesheet_mapped() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	.a {
		@keyframes k { from { opacity: 0 } }
		animation: k 1s;
	}
</style>
"#,
        ";AAKA,CAAC,gBAAE,CAAC;AACJ,EAAE,yBAAW;AACb,EAAE,yBAAW,IAAI;AACjB;",
    );
}

#[test]
fn a_removed_global_pseudo_class_leaves_its_selector_mapped() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	:global(.x) { color: red }
	.a { color: blue }
</style>
"#,
        ";AAKA,CAAS,EAAG,CAAC,EAAE,WAAW;AAC1B,CAAC,gBAAE,CAAC,EAAE,YAAY;",
    );
}

#[test]
fn a_global_pseudo_class_in_a_selector_list_keeps_the_rest_mapped() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	:global(.x), .a { color: red }
</style>
"#,
        ";AAKA,CAAS,EAAG,EAAE,gBAAE,CAAC,EAAE,WAAW;",
    );
}

#[test]
fn a_commented_out_global_block_maps_its_body() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	:global {
		.x { color: red }
	}
	.a { color: blue }
</style>
"#,
        ";AAKA,IAAC,QAAQ;AACT,EAAE,EAAE,CAAC,EAAE,WAAW;AAClB,GAAC;AACD,CAAC,gBAAE,CAAC,EAAE,YAAY;",
    );
}

#[test]
fn nothing_inside_a_keyframes_block_is_marked() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	:global {
		@keyframes k { from { opacity: 0 } }
	}
	.a { animation: k 1s }
</style>
"#,
        ";AAKA,IAAC,QAAQ;AACT,EAAE;AACF,GAAC;AACD,CAAC,gBAAE,CAAC,EAAE,gBAAgB;",
    );
}

#[test]
fn a_passthrough_at_rule_maps_its_declarations() {
    assert_mappings(
        r#"<svelte:options css="injected" />

<div class="a">a</div>

<style>
	@font-face { font-family: x; src: url(a.woff) }
	.a { color: red }
</style>
"#,
        ";AAKA,CAAC,WAAW,EAAE,cAAc,EAAE,iBAAiB;AAC/C,CAAC,gBAAE,CAAC,EAAE,WAAW;",
    );
}
