import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let numbers = [1, 2, 3];

	function x($$renderer, n) {
		$$renderer.push(`<p style="color: red">${$.escape(n)}</p>`);
	}

	function x($$renderer, n) {
		$$renderer.push(`<p style="color: blue">${$.escape(n)}</p>`);
	}

	$$renderer.push(`<button>push</button> <div style="display: grid; grid-template-columns: 1fr 1fr"><div><!--[-->`);

	const each_array = $.ensure_array_like(numbers);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let n = each_array[$$index];

		x($$renderer, n);
	}

	$$renderer.push(`<!--]--></div> <div><!--[-->`);

	const each_array_1 = $.ensure_array_like(numbers);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let n = each_array_1[$$index_1];

		x($$renderer, n);
	}

	$$renderer.push(`<!--]--></div></div>`);
}