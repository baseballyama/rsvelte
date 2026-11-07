import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Main($$renderer) {
	let fetching = false;
	let items = ['a', 'b', 'c'];

	$$renderer.push(`<button>remove</button> <button>fetch</button> `);

	if (fetching) {
		$$renderer.push(`<!--[0--><p>loading</p>`);
	} else {
		$$renderer.push(`<!--[-1--><div><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div class="item">${$.escape(item)}</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	}

	$$renderer.push(`<!--]-->`);
}