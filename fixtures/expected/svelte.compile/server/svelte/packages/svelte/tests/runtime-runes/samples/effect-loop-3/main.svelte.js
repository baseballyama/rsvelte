import * as $ from 'svelte/internal/server';
import Child from './Child.svelte';

export default function Main($$renderer) {
	let show = false;

	$$renderer.push(`<button>toggle</button> `);

	if (show) {
		$$renderer.push(`<!--[0--><!--[-->`);

		const each_array = $.ensure_array_like({ length: 1234 });

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let i = each_array[$$index];

			Child($$renderer, {
				children: ($$renderer) => {
					$$renderer.push(`<!---->${$.escape(i)}`);
				},
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}