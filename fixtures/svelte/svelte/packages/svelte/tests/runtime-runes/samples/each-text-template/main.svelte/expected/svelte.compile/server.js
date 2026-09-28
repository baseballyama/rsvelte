import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let array = ['A', 'B', 'C'];

	$$renderer.push(`<p><!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let a = each_array[$$index];

		$$renderer.push(`<!---->${$.escape(a)}<br/>`);
	}

	$$renderer.push(`<!--]--></p>`);
}