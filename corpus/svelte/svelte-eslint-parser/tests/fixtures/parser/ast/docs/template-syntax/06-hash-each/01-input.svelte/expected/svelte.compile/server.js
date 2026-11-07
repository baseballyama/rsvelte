import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(expression);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let name = each_array[$$index];

		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(expression);

	for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
		let name = each_array_1[index];

		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(expression);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let name = each_array_2[$$index_2];

		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_3 = $.ensure_array_like(expression);

	for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
		let name = each_array_3[index];

		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> `);

	const each_array_4 = $.ensure_array_like(expression);

	if (each_array_4.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
			let name = each_array_4[$$index_4];

			$$renderer.push(`<!---->...`);
		}
	} else {
		$$renderer.push(`<!--[!--><!---->...`);
	}

	$$renderer.push(`<!--]-->`);
}