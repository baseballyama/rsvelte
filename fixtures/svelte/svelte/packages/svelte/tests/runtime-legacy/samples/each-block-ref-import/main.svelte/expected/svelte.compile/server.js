import * as $ from 'svelte/internal/server';
import { foo } from './utils';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(foo.bar);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let bar = each_array[$$index];

			$$renderer.push(`<input type="text"${$.attr('value', bar.value)}/>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}