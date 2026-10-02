import * as $ from 'svelte/internal/server';

export default function Each_in_if($$renderer, $$props) {
	let { show, list } = $$props;
	if (show) {
		$$renderer.push(`<!--[0--><!--[-->`);
		const each_array = $.ensure_array_like(list);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let entry = each_array[$$index];
			$$renderer.push(`<span>${$.escape(entry)}</span>`);
		}
		$$renderer.push(`<!--]-->`);
	} else {
		$$renderer.push(`<!--[-1--><p>hidden</p>`);
	}
	$$renderer.push(`<!--]-->`);
}
