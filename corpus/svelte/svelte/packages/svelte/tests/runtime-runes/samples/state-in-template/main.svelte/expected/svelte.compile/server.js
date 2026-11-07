import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const set = new SvelteSet();

		$$renderer.push(`<form><input name="name"/> <button>Add</button></form> <!--[-->`);

		const each_array = $.ensure_array_like(set);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div>${$.escape(item.name)}</div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}