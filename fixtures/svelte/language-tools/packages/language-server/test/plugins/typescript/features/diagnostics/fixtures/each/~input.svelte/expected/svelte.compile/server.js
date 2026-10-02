import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	const simpleOptions = [];
	const complexOptions = [];
	const maybeUndefined = null;
	const badOptions = { object: {}, number: 1 };

	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(simpleOptions);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let option = each_array[i];

		$$renderer.push(`<div>${$.escape(option)}, ${$.escape(i)}</div>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(simpleOptions);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let option = each_array_1[i];

		$$renderer.push(`<div>${$.escape(option)}, ${$.escape(i)}</div>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(complexOptions);

	for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
		let option = each_array_2[i];

		$$renderer.push(`<div>${$.escape(typeof option === "string" ? option : option.label)}, ${$.escape(i)}</div>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_3 = $.ensure_array_like(badOptions.object);

	for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
		let option = each_array_3[i];

		$$renderer.push(`<div>${$.escape(option)} ${$.escape(i)}</div>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_4 = $.ensure_array_like(badOptions.number);

	for (let i = 0, $$length = each_array_4.length; i < $$length; i++) {
		let option = each_array_4[i];

		$$renderer.push(`<div>${$.escape(option)} ${$.escape(i)}</div>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_5 = $.ensure_array_like(maybeUndefined);

	for (let i = 0, $$length = each_array_5.length; i < $$length; i++) {
		let option = each_array_5[i];

		$$renderer.push(`<div>${$.escape(option)}, ${$.escape(i)}</div>`);
	}

	$$renderer.push(`<!--]-->`);
}