import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [{ t: 0 }];

		$$renderer.push(`<button>add</button> <button>adjust</button> <h2>Keyed</h2> <!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];

			$$renderer.push(`<div>Item: ${$.escape(item.t)}. Index: ${$.escape(index)}</div>`);
		}

		$$renderer.push(`<!--]--> <h2>Unkeyed</h2> <!--[-->`);

		const each_array_1 = $.ensure_array_like(items);

		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let item = each_array_1[index];

			$$renderer.push(`<div>Item: ${$.escape(item.t)}. Index: ${$.escape(index)}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}