import * as $ from 'svelte/internal/server';
import { SvelteSet } from 'svelte/reactivity';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function* generator() {
			yield 1;
		}

		let gen = new SvelteSet(generator());

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(gen);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(item)}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}