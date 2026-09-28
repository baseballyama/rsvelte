import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<!---->

<!--[-->`);

	const each_array = $.ensure_array_like('abc');

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let l = each_array[$$index];

		$$renderer.push(`<!---->
	<div>${$.escape(l)}</div>
`);
	}

	$$renderer.push(`<!--]-->`);
}