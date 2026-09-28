import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	let { array } = $$props;

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(array);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let number = each_array[$$index];

		$$renderer.push(`<p>${$.escape(number.v)}</p>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(array);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let number = each_array_1[$$index_1];

		$$renderer.push(`<p>${$.escape(number.v)}</p>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(array);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let number = each_array_2[$$index_2];

		$$renderer.push(`<p>${$.escape(number.v)}</p>`);
	}

	$$renderer.push(`<!--]-->`);
}