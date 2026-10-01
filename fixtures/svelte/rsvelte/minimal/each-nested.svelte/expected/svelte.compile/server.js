import * as $ from 'svelte/internal/server';

export default function Each_nested($$renderer) {
	let groups = [
		{ name: 'fruit', items: ['apple', 'pear'] },
		{ name: 'veg', items: ['leek'] }
	];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(groups);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let group = each_array[$$index_1];

		$$renderer.push(`<h2>${$.escape(group.name)}</h2> <ul><!--[-->`);

		const each_array_1 = $.ensure_array_like(group.items);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let item = each_array_1[$$index];

			$$renderer.push(`<li>${$.escape(group.name)}: ${$.escape(item)}</li>`);
		}

		$$renderer.push(`<!--]--></ul>`);
	}

	$$renderer.push(`<!--]-->`);
}