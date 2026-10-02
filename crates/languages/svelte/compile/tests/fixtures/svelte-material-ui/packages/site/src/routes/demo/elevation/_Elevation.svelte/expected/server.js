import * as $ from 'svelte/internal/server';

export default function _Elevation($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<div class="flexy-dad svelte-z66g28"><!--[-->`);

		const each_array = $.ensure_array_like([...Array(24)].map((_v, i) => i + 1));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let n = each_array[$$index];

			$$renderer.push(`<div${$.attr_class(`mdc-elevation--z${$.stringify(n)} flexy-boy`, 'svelte-z66g28')}>Elevation: ${$.escape(n)}</div>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}