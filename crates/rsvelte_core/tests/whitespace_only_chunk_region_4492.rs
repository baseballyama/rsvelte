//! The comment-buffer region a builder-made node is given must hold something.
//!
//! `to_oxc::consumed` gives a container the slice of the synthetic comment
//! buffer its children consumed. When they consumed only the `'\n'` a chunk is
//! appended with, that slice sits just past a NEIGHBOURING chunk's trailing
//! comment, and `has_loc` reads it as a real location — so
//! `arrow_function_with_owned_comments` hands it to the parameter list as the
//! `until` bound and the comment is flushed inside the parens (#4492, and
//! #4481's `{#key}` cell).
//!
//! The four cells are the pair that makes the rule discriminating. Two of them
//! move under the fix, in OPPOSITE directions — `<svelte:boundary>` must lose
//! the comment and `{#key}` must keep it, one argument earlier than rsvelte put
//! it — and two must not move at all while still carrying the comment through,
//! so a fix that simply stops flushing at builder-made nodes fails them.
//!
//! Every expectation is the official compiler's bytes at the recorded submodule
//! pin, `submodules/svelte/packages/svelte/src/compiler/index.js`, `client`,
//! `dev: false` — generated from it rather than transcribed.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

/// One instance script — `let c = 1;` then a trailing `// x` — under one template.
fn client(template: &str) -> String {
    let source = format!("<script>\n\tlet c = 1;\n\t// x\n</script>\n{template}\n");
    compile(
        &source,
        CompileOptions {
            filename: Some("T.svelte".into()),
            generate: GenerateMode::Client,
            dev: false,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn a_svelte_boundary_drops_it_as_upstream_does() {
    assert_eq!(
        client(r#"<svelte:boundary><b>{c}</b></svelte:boundary>"#),
        r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<b></b>`);

export default function T($$anchor) {
	let c = 1;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.boundary(node, {}, ($$anchor) => {
		var b = root();

		b.textContent = '1';
		$.append($$anchor, b);
	});

	$.append($$anchor, fragment);
}"#
    );
}

#[test]
fn a_key_block_keeps_it_in_the_second_arguments_parameter_list() {
    assert_eq!(
        client(r#"{#key c}<b>{c}</b>{/key}"#),
        r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<b></b>`);

export default function T($$anchor) {
	let c = 1;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.key(
		node,
		(// x
		) => c,
		($$anchor) => {
			var b = root();

			b.textContent = '1';
			$.append($$anchor, b);
		}
	);

	$.append($$anchor, fragment);
}"#
    );
}

#[test]
fn a_plain_element_still_keeps_it_on_the_var() {
    assert_eq!(
        client(r#"<p>{c}</p>"#),
        r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p></p>`);

export default function T($$anchor) {
	let c = 1;

	var // x
	p = root();

	p.textContent = '1';
	$.append($$anchor, p);
}"#
    );
}

#[test]
fn an_await_block_still_keeps_it_in_a_parameter_list() {
    assert_eq!(
        client(r#"{#await Promise.resolve(c)}<b>{c}</b>{/await}"#),
        r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/legacy';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<b></b>`);

export default function T($$anchor) {
	let c = 1;
	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.await(
		node,
		(// x
		) => Promise.resolve(c),
		($$anchor) => {
			var b = root();

			b.textContent = '1';
			$.append($$anchor, b);
		}
	);

	$.append($$anchor, fragment);
}"#
    );
}
