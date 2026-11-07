import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const foo = [{ in: 'bar' }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(foo);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { in: bar } = each_array[$$index];

		$$renderer.push(`<p>${$.escape(bar)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}