import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let data = [1, 1, 1];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(data);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let d = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(d)}`);
	}

	$$renderer.push(`<!--]-->`);
}