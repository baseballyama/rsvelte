import * as $ from 'svelte/internal/server';
import { tick } from 'svelte';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selected = -1;
		let current = void 0;
		let div; // explicitly no $state

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like([1, 2, 3]);

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let n = each_array[i];

			$$renderer.push(`<button>${$.escape(n)}</button>`);
		}

		$$renderer.push(`<!--]--> <hr/> <!--[-->`);

		const each_array_1 = $.ensure_array_like([1, 2, 3]);

		for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
			let n = each_array_1[i];

			if (selected === i) {
				$$renderer.push(`<!--[0--><div>${$.escape(n)}</div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> <hr/> <p>${$.escape(current ?? '...')}</p>`);
	});
}