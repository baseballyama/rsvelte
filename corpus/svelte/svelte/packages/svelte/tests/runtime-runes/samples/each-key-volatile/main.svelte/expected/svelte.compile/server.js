import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let things = [{ group: 'a', id: 1 }, { group: 'b', id: 2 }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(things);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let thing = each_array[$$index];

		$$renderer.push(`<p>${$.escape(thing.group)}-${$.escape(thing.id)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}