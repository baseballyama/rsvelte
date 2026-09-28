import * as $ from 'svelte/internal/server';
import { SvelteMap } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let state = new SvelteMap([[0, 0]]);

		$$renderer.push(`<button>set if</button> <button>set if 1</button> <button>add</button> <button>delete</button> <button>clear</button> <!--[-->`);

		const each_array = $.ensure_array_like(state);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let [key, value] = each_array[$$index];

			$$renderer.push(`<div>${$.escape(key)}:${$.escape(value)}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}