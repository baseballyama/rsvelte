import * as $ from 'svelte/internal/server';

export default function Each_static($$renderer) {
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like([1, 2, 3]);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let n = each_array[$$index];
		$$renderer.push(`<!---->${$.escape(n)}`);
	}
	$$renderer.push(`<!--]-->`);
}
