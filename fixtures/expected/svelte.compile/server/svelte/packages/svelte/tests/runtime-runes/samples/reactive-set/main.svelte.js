import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let state = new SvelteSet([0]);

		$$renderer.push(`<button>delete initial</button> <button>add</button> <button>delete</button> <button>clear</button> <div id="output"><p>${$.escape(state.size)}</p> <!--[-->`);

		const each_array = $.ensure_array_like(state);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div>${$.escape(item)}</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}