//! A component or element that reads a binding of an async `{const}` in the
//! same block has to wait for that binding's `$$renderer.run` slot, as it does
//! for a top-level-await blocker. Without the wrapper the server read `n()`
//! before `run` assigned `n` and threw `n is not a function`. A property that
//! merely shares the binding's name (`obj.n`) is not a read of it.
//!
//! The expectation is the official compiler's bytes (5.57.3,
//! `experimental: { async: true }`).

use rsvelte_core::compiler::ExperimentalOptions;
use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[test]
fn a_read_of_an_async_const_waits_for_its_run_slot() {
    let src = r#"<script>
	import Child from './Child.svelte';
	let obj = { n: 1 };
</script>

<svelte:boundary>
	{const h = $derived(await Promise.resolve({ n: 42 }))}
	{const n = $derived(h.n)}
	<Child value={n}>{n}</Child>
	<div class={n}></div>
	<Child value={obj.n} />
	<div class={obj.n}></div>
</svelte:boundary>
"#;
    let out = compile(
        src,
        CompileOptions {
            filename: Some("T1.svelte".into()),
            generate: GenerateMode::Server,
            experimental: ExperimentalOptions { r#async: true },
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    let expected = r#"import 'svelte/internal/flags/async';
import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function T1($$renderer) {
	let obj = { n: 1 };

	$$renderer.push(`<!--[-->`);

	{
		let h;
		let n;

		var promises = $$renderer.run([
			async () => h = await $.async_derived(async () => (await $.save(Promise.resolve({ n: 42 })))()),
			() => n = $.derived(() => h().n)
		]);

		$$renderer.async_block([promises[1]], ($$renderer) => {
			Child($$renderer, {
				value: n(),
				children: ($$renderer) => {
					$$renderer.push(`<!---->`);
					$$renderer.async([promises[1]], ($$renderer) => $$renderer.push(() => $.escape(n())));
				},
				$$slots: { default: true }
			});
		});

		$$renderer.push(` `);

		$$renderer.async([promises[1]], ($$renderer) => {
			$$renderer.push(`<div${$.attr_class($.clsx(n()))}></div>`);
		});

		$$renderer.push(` `);
		Child($$renderer, { value: obj.n });
		$$renderer.push(`<!----> <div${$.attr_class($.clsx(obj.n))}></div>`);
	}

	$$renderer.push(`<!--]-->`);
}"#;
    assert_eq!(out.trim_end(), expected.trim_end());
}
