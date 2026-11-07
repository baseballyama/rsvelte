import * as $ from 'svelte/internal/server';
import { foo } from '../documentation';

export default function Signature_help($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		foo();
		abc(1, '');

		/**
		 * @param b formatted number
		 */
		function abc(a, b) {}

		let items = [];

		$$renderer.push(`<!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<!---->${$.escape(item)}`);
		}

		$$renderer.push(`<!--]-->`);
	});
}