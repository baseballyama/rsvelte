import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let items = [{ id: 1, value: "test" }];

	const update = () => {
		const clone = items.slice();

		clone[0].value += " !!!";
		items = clone;
	};

	$$renderer.push(`<button>Update</button> <ul><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li>${$.escape(item.value)}</li>`);
	}

	$$renderer.push(`<!--]--></ul>`);
}