import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let obj = { test: 0 };
	let keys = $.derived(() => Object.keys(obj));

	$$renderer.push(`<button>delete</button> <!--[-->`);

	const each_array = $.ensure_array_like(keys());

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let key = each_array[$$index];

		$$renderer.push(`<p>${$.escape(key)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}