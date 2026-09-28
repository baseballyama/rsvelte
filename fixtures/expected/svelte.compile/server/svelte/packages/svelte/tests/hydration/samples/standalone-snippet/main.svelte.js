import * as $ from 'svelte/internal/server';

function thing($$renderer) {
	$$renderer.push(`<p>thing</p>`);
}

export default function Main($$renderer) {
	if (true) {
		$$renderer.push('<!--[0-->');
		thing($$renderer);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array = $.ensure_array_like([1, 2, 3]);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let n = each_array[$$index];

		thing($$renderer);
	}

	$$renderer.push(`<!--]-->`);
}