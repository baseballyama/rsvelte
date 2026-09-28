import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(x);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let { y = 'z' } = each_array[$$index];
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(x);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let { y = '{' } = each_array_1[$$index_1];
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(x);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let { y = ']' } = each_array_2[$$index_2];
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_3 = $.ensure_array_like(x);

	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
		let { y = `${`"`}` } = each_array_3[$$index_3];
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_4 = $.ensure_array_like(x);

	for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
		let { y = `${`John`}` } = each_array_4[$$index_4];
	}

	$$renderer.push(`<!--]-->`);
}