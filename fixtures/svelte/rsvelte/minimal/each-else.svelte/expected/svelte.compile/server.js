import * as $ from 'svelte/internal/server';

export default function Each_else($$renderer, $$props) {
	let { results } = $$props;
	const each_array = $.ensure_array_like(results);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let result = each_array[$$index];

			$$renderer.push(`<p>${$.escape(result.title)}</p>`);
		}
	} else {
		$$renderer.push(`<!--[!--><p>No results.</p>`);
	}

	$$renderer.push(`<!--]-->`);
}