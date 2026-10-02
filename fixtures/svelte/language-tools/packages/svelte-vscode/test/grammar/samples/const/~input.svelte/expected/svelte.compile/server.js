import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];
		const _item = item;
		const { a } = abc;
		const [e] = abc;

		$$renderer.push(`<!---->${$.escape(item)}`);
	}

	$$renderer.push(`<!--]-->`);
}