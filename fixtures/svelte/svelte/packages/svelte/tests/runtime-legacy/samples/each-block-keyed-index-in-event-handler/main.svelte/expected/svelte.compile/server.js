import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let list = ["a", "b", "c"];

	const remove = (index) => {
		list.splice(index, 1);
		list = list;
	};

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(list);

	for (let index = 0, $$length = each_array.length; index < $$length; index++) {
		let value = each_array[index];

		if (value) {
			$$renderer.push(`<!--[0--><button>remove</button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]-->`);
}