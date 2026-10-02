import * as $ from 'svelte/internal/server';

export default function Each_keyed($$renderer) {
	let people = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }];
	$$renderer.push(`<!--[-->`);
	const each_array = $.ensure_array_like(people);
	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let person = each_array[$$index];
		$$renderer.push(`<p>${$.escape(person.name)}</p>`);
	}
	$$renderer.push(`<!--]-->`);
}
