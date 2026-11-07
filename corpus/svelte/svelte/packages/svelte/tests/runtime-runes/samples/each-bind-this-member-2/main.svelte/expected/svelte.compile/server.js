import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let items = [];

	function add_item() {
		items.push({
			id: items.length,
			text: 'Item ' + (items.length + 1),
			dom: null
		});
	}

	function clear() {
		items = [];
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<button>add item</button> <button>clear</button> <!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			Child($$renderer, {
				get item() {
					return items[index];
				},

				set item($$value) {
					items[index] = $$value;
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