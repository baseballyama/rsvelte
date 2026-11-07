//! Under `experimental.async` a server instance body with a top-level `await`
//! is printed to text, split by the shared async-body transform and re-parsed.
//! That round trip used to print without the registered comment regions and
//! re-parse without registering the result's comments, so every comment in the
//! instance script was dropped — including those inside function bodies, which
//! the split never touches. The split itself cut a run of line comments into
//! comment-only statements and discarded all but the last line, on both
//! targets. The corpus output gate compares with comments ignored, so these
//! pins are the only guard.
//!
//! Every expectation is the official compiler's bytes (5.57.3,
//! `experimental: { async: true }`).

use rsvelte_core::compiler::ExperimentalOptions;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn server(filename: &str, src: &str, dev: bool) -> String {
    run(filename, src, GenerateMode::Server, dev)
}

fn client(filename: &str, src: &str, dev: bool) -> String {
    run(filename, src, GenerateMode::Client, dev)
}

fn run(filename: &str, src: &str, generate: GenerateMode, dev: bool) -> String {
    compile(
        src,
        CompileOptions {
            filename: Some(filename.into()),
            generate,
            dev,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code
}

#[test]
fn function_comments_survive_a_top_level_await() {
    let src = r#"<script>
	const top = await load();
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
	let x = /* init */ 1;
</script>
<p>{top}{f}{x}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function T1($$renderer) {
	async function f() {
		const r = /** @type {R} */ (await load());

		return (/* c */ await other());
	}

	var top, x;
	var $$promises = $$renderer.run([async () => top = await load(), () => x = /* init */ 1]);

	$$renderer.push(`<p>`);
	$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(top)));
	$$renderer.push(`${$.escape(f)}`);
	$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(x)));
	$$renderer.push(`</p>`);
}"#;
    assert_eq!(server("T1.svelte", src, false), expected);
}

#[test]
fn function_comments_survive_a_top_level_await_dev() {
    let src = r#"<script>
	const top = await load();
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
	let x = /* init */ 1;
</script>
<p>{top}{f}{x}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';

T1[$.FILENAME] = 'T1.svelte';

import * as $ from 'svelte/internal/server';

function T1($$renderer, $$props) {
	$$renderer.component(
		($$renderer) => {
			async function f() {
				const r = /** @type {R} */ (await load());

				return (/* c */ await other());
			}

			var top, x;
			var $$promises = $$renderer.run([async () => top = await load(), () => x = /* init */ 1]);

			$$renderer.push(`<p>`);
			$.push_element($$renderer, 'p', 9, 0);
			$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(top)));
			$$renderer.push(`${$.escape(f)}`);
			$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(x)));
			$$renderer.push(`</p>`);
			$.pop_element();
		},
		T1
	);
}

T1.render = function () {
	throw new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');
};

export default T1;"#;
    assert_eq!(server("T1.svelte", src, true), expected);
}

#[test]
fn an_interior_comment_survives_the_hoisted_thunk() {
    let src = r#"<script>
	let { p } = $props();
	const r = /* top */ await p.load();
</script>
<p>{r}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function T4($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { p } = $$props;
		var r;
		var $$promises = $$renderer.run([async () => r = /* top */ await p.load()]);

		$$renderer.push(`<p>`);
		$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(r)));
		$$renderer.push(`</p>`);
	});
}"#;
    assert_eq!(server("T4.svelte", src, false), expected);
}

#[test]
fn an_interior_comment_survives_the_hoisted_thunk_dev() {
    let src = r#"<script>
	let { p } = $props();
	const r = /* top */ await p.load();
</script>
<p>{r}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';

T4[$.FILENAME] = 'T4.svelte';

import * as $ from 'svelte/internal/server';

function T4($$renderer, $$props) {
	$$renderer.component(
		($$renderer) => {
			let { p } = $$props;
			var r;
			var $$promises = $$renderer.run([async () => r = /* top */ await p.load()]);

			$$renderer.push(`<p>`);
			$.push_element($$renderer, 'p', 5, 0);
			$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(r)));
			$$renderer.push(`</p>`);
			$.pop_element();
		},
		T4
	);
}

T4.render = function () {
	throw new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');
};

export default T4;"#;
    assert_eq!(server("T4.svelte", src, true), expected);
}

#[test]
fn function_comments_without_a_top_level_await() {
    let src = r#"<script>
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
</script>
<p>{f}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function G01($$renderer) {
	async function f() {
		const r = /** @type {R} */ (await load());

		return (/* c */ await other());
	}

	$$renderer.push(`<p>${$.escape(f)}</p>`);
}"#;
    assert_eq!(server("G01.svelte", src, false), expected);
}

#[test]
fn function_comments_without_a_top_level_await_dev() {
    let src = r#"<script>
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
</script>
<p>{f}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';

G01[$.FILENAME] = 'G01.svelte';

import * as $ from 'svelte/internal/server';

function G01($$renderer, $$props) {
	$$renderer.component(
		($$renderer) => {
			async function f() {
				const r = /** @type {R} */ (await load());

				return (/* c */ await other());
			}

			$$renderer.push(`<p>`);
			$.push_element($$renderer, 'p', 7, 0);
			$$renderer.push(`${$.escape(f)}</p>`);
			$.pop_element();
		},
		G01
	);
}

G01.render = function () {
	throw new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');
};

export default G01;"#;
    assert_eq!(server("G01.svelte", src, true), expected);
}

#[test]
fn a_comment_on_a_hoisted_declarator_survives() {
    let src = r#"<script>
	const top = await load();
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
	// line comment outside
	let x = /* init */ 1;
</script>
<p>{top}{f}{x}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function G12($$renderer) {
	async function f() {
		const r = /** @type {R} */ (await load());

		return (/* c */ await other());
	}

	var top,
		// line comment outside
		x;

	var $$promises = $$renderer.run([async () => top = await load(), () => x = /* init */ 1]);

	$$renderer.push(`<p>`);
	$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(top)));
	$$renderer.push(`${$.escape(f)}`);
	$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(x)));
	$$renderer.push(`</p>`);
}"#;
    assert_eq!(server("G12.svelte", src, false), expected);
}

#[test]
fn a_comment_on_a_hoisted_declarator_survives_dev() {
    let src = r#"<script>
	const top = await load();
	async function f() {
		const r = /** @type {R} */ (await load());
		return /* c */ await other();
	}
	// line comment outside
	let x = /* init */ 1;
</script>
<p>{top}{f}{x}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';

G12[$.FILENAME] = 'G12.svelte';

import * as $ from 'svelte/internal/server';

function G12($$renderer, $$props) {
	$$renderer.component(
		($$renderer) => {
			async function f() {
				const r = /** @type {R} */ (await load());

				return (/* c */ await other());
			}

			var top,
				// line comment outside
				x;

			var $$promises = $$renderer.run([async () => top = await load(), () => x = /* init */ 1]);

			$$renderer.push(`<p>`);
			$.push_element($$renderer, 'p', 10, 0);
			$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(top)));
			$$renderer.push(`${$.escape(f)}`);
			$$renderer.async([$$promises[1]], ($$renderer) => $$renderer.push(() => $.escape(x)));
			$$renderer.push(`</p>`);
			$.pop_element();
		},
		G12
	);
}

G12.render = function () {
	throw new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');
};

export default G12;"#;
    assert_eq!(server("G12.svelte", src, true), expected);
}

#[test]
fn every_line_of_a_comment_run_survives() {
    let src = r#"<script>
	const one = Promise.resolve(1);

	// first line
	// second line
	one.then(() => {});

	const total = $derived(await one);
</script>

<p>{total}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';

export default function T5($$renderer) {
	const one = Promise.resolve(1);

	// first line
	// second line
	one.then(() => {});

	var total;
	var $$promises = $$renderer.run([async () => total = await $.async_derived(() => one)]);

	$$renderer.push(`<p>`);
	$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(total())));
	$$renderer.push(`</p>`);
}"#;
    assert_eq!(server("T5.svelte", src, false), expected);
}

#[test]
fn every_line_of_a_comment_run_survives_dev() {
    let src = r#"<script>
	const one = Promise.resolve(1);

	// first line
	// second line
	one.then(() => {});

	const total = $derived(await one);
</script>

<p>{total}</p>
"#;
    let expected = r#"import 'svelte/internal/flags/async';

T5[$.FILENAME] = 'T5.svelte';

import * as $ from 'svelte/internal/server';

function T5($$renderer, $$props) {
	$$renderer.component(
		($$renderer) => {
			const one = Promise.resolve(1);

			// first line
			// second line
			one.then(() => {});

			var total;
			var $$promises = $$renderer.run([async () => total = await $.async_derived(() => one)]);

			$$renderer.push(`<p>`);
			$.push_element($$renderer, 'p', 11, 0);
			$$renderer.async([$$promises[0]], ($$renderer) => $$renderer.push(() => $.escape(total())));
			$$renderer.push(`</p>`);
			$.pop_element();
		},
		T5
	);
}

T5.render = function () {
	throw new Error('Component.render(...) is no longer valid in Svelte 5. See https://svelte.dev/docs/svelte/v5-migration-guide#Components-are-no-longer-classes for more information');
};

export default T5;"#;
    assert_eq!(server("T5.svelte", src, true), expected);
}

#[test]
fn every_line_of_a_comment_run_survives_on_the_client() {
    let src = r#"<script>
	const one = Promise.resolve(1);

	// first line
	// second line
	one.then(() => {});

	const total = $derived(await one);
</script>

<p>{total}</p>
"#;
    let expected = r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<p> </p>`);

export default function T5($$anchor) {
	const one = Promise.resolve(1);

	// first line
	// second line
	one.then(() => {});

	var total;
	var $$promises = $.run([async () => total = await $.async_derived(() => one)]);
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(total)), void 0, void 0, [$$promises[0]]);
	$.append($$anchor, p);
}"#;
    assert_eq!(client("T5.svelte", src, false), expected);
}

#[test]
fn every_line_of_a_comment_run_survives_on_the_client_dev() {
    let src = r#"<script>
	const one = Promise.resolve(1);

	// first line
	// second line
	one.then(() => {});

	const total = $derived(await one);
</script>

<p>{total}</p>
"#;
    let expected = r#"import 'svelte/internal/disclose-version';
import 'svelte/internal/flags/async';

T5[$.FILENAME] = 'T5.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.from_html(`<p> </p>`), T5[$.FILENAME], [[11, 0]]);

export default function T5($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, T5);

	const one = Promise.resolve(1);

	// first line
	// second line
	one.then(() => {});

	var total;

	var $$promises = $.run([
		async () => total = await $.async_derived(async () => (await $.track_reactivity_loss(one))(), 'total', 'T5.svelte:8:15')
	]);

	var $$exports = { ...$.legacy_api() };
	var p = root();
	var text = $.only_child(p, true);

	$.template_effect(() => $.set_text(text, $.get(total)), void 0, void 0, [$$promises[0]]);
	$.append($$anchor, p);

	return $.pop($$exports);
}"#;
    assert_eq!(client("T5.svelte", src, true), expected);
}
