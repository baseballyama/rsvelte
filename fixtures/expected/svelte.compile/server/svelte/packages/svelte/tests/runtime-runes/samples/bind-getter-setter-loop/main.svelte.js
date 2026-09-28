import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let arr = [1, 2, 3, 4, 5];
	let elements = [];

	$$renderer.push(`<button>Shuffle</button><br/> <!--[-->`);

	const each_array = $.ensure_array_like(arr);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let item = each_array[i];

		$$renderer.push(`<b>${$.escape(item)}</b>`);
	}

	$$renderer.push(`<!--]--> <br/> <!--[-->`);

	const each_array_1 = $.ensure_array_like(elements);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let elem = each_array_1[$$index_1];

		$$renderer.push(`<!---->${$.escape(elem.textContent)}`);
	}

	$$renderer.push(`<!--]-->`);
}