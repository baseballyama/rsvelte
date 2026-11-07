import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let power = 0;

		$$renderer.push(`<p>power: ${$.escape(power)}</p> <!--[-->`);

		const each_array = $.ensure_array_like([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let n = each_array[$$index];

			$$renderer.push(`<button>${$.escape(n)}</button>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}