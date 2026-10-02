import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(Array(1));

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let ref = void 0;
		let count = 0;

		$$renderer.push(`<button>${$.escape(count)}</button> <button></button>`);
	}

	$$renderer.push(`<!--]-->`);
}