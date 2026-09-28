import * as $ from 'svelte/internal/server';
import { untrack } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 0;

		function default_arg() {
			untrack(() => count++);

			return 1;
		}

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like([{}, { a: 2 }, {}]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { a = default_arg() } = each_array[$$index];

			$$renderer.push(`<div>${$.escape(a)} ${$.escape(a)} ${$.escape(a)}</div>`);
		}

		$$renderer.push(`<!--]--> <p>${$.escape(count)}</p>`);
	});
}