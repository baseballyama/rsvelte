import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let array = [1, 2, 3];

	$$renderer.push(`<button>reverse</button> <!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<p>${$.escape(item)}</p> `);

		if (true) {
			$$renderer.push(`<!--[0--><p>(${$.escape(item)})</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}