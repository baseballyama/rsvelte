import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const each_array = $.ensure_array_like(items);

	if (each_array.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];

			$$renderer.push(`<div>${$.escape(item)}</div>`);
		}
	} else {
		$$renderer.push(`<!--[!--><div></div>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(showGroups);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let [key, items] = each_array_1[$$index_1];
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(v);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		$$renderer.push(`<!---->this should be seen as text`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_3 = $.ensure_array_like(v);

	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
		$$renderer.push(`<!---->this should be seen as text`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_4 = $.ensure_array_like(v);

	for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
		$$renderer.push(`<!---->this should be seen as text`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_5 = $.ensure_array_like(v);

	for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
		$$renderer.push(`<!---->this should be seen as text`);
	}

	$$renderer.push(`<!--]-->`);
}