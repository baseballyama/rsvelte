import * as $ from 'svelte/internal/server';
import Checkbox from './checkbox.svelte';

export default function Main($$renderer) {
	let foo = {};
	const schema = { foo: true };

	function retrieveSchema() {
		const cloned = { ...schema };

		for (const key of Object.keys(foo)) {
			cloned[key] = key;
		}

		return cloned;
	}

	const keys = $.derived(() => Object.keys(retrieveSchema()));
	let nextKey = 1;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button>Add</button> <!--[-->`);

		const each_array = $.ensure_array_like(keys());

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let key = each_array[$$index];

			Checkbox($$renderer, {
				get value() {
					return foo[key];
				},

				set value($$value) {
					foo[key] = $$value;
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