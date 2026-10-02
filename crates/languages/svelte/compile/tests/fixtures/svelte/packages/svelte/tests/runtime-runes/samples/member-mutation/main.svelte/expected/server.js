import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let people = [{ name: { first: 'rob' } }];

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(people);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let person = each_array[$$index];

		$$renderer.push(`<button>person.name.first = "dave"</button>`);
	}

	$$renderer.push(`<!--]--> <h3>JSON output</h3> <!--[-->`);

	const each_array_1 = $.ensure_array_like(people);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let person = each_array_1[$$index_1];

		$$renderer.push(`<div>${$.escape(JSON.stringify(people))}</div>`);
	}

	$$renderer.push(`<!--]-->`);
}