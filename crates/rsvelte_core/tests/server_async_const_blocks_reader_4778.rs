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

/// An each item that shadows a top-level-await binding is not a read of it, so
/// it does not wait on `$$promises[0]`; the async `{const}` read beside it still
/// waits on its own slot.
#[test]
fn an_each_item_shadowing_a_top_level_await_binding_is_not_blocked() {
    let src = r#"<script>
	import Child from './Child.svelte';
	let t = await Promise.resolve(1);
	let items = [1, 2];
</script>

{#each items as t}
	<Child value={t} />
	<div title={t}></div>
{/each}

<svelte:boundary>
	{const n = $derived(await Promise.resolve(2))}
	{#each items as t}
		<Child value={t + n} />
	{/each}
	<Child value={t + n} />
</svelte:boundary>
"#;
    let out = compile(
        src,
        CompileOptions {
            filename: Some("T2.svelte".into()),
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

export default function T2($$renderer) {
	var t, items;

	var $$promises = $$renderer.run([
		async () => t = await Promise.resolve(1),
		() => items = [1, 2]
	]);

	$$renderer.push(`<!--[-->`);

	$$renderer.async_block([$$promises[1]], ($$renderer) => {
		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let t = each_array[$$index];

			Child($$renderer, { value: t });
			$$renderer.push(`<!----> <div${$.attr('title', t)}></div>`);
		}
	});

	$$renderer.push(`<!--]--> `);
	$$renderer.push(`<!--[-->`);

	{
		let n;

		var promises = $$renderer.run([
			async () => n = await $.async_derived(async () => (await $.save(Promise.resolve(2)))())
		]);

		$$renderer.push(`<!--[-->`);

		$$renderer.async_block([$$promises[1]], ($$renderer) => {
			const each_array_1 = $.ensure_array_like(items);

			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
				let t = each_array_1[$$index_1];

				$$renderer.async_block([promises[0]], ($$renderer) => {
					Child($$renderer, { value: t + n() });
				});
			}
		});

		$$renderer.push(`<!--]--> `);

		$$renderer.async_block([$$promises[0], promises[0]], ($$renderer) => {
			Child($$renderer, { value: t + n() });
		});
	}

	$$renderer.push(`<!--]-->`);
}"#;
    assert_eq!(out.trim_end(), expected.trim_end());
}
