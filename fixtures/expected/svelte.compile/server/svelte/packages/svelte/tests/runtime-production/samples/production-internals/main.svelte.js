import * as $ from 'svelte/internal/server';
import Child from "./Child.svelte";

export default function Main($$renderer) {
	let foo;

	function onerror(err) {
		// re-throw if it isn't the production error
		// do in a such way because config.error is checked via `includes`
		if (err.message !== 'https://svelte.dev/e/props_invalid_value') {
			throw err;
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<!--[-->`);

		{
			Child($$renderer, {
				get foo() {
					return foo;
				},

				set foo($$value) {
					foo = $$value;
					$$settled = false;
				}
			});
		}

		$$renderer.push(`<!--]-->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}