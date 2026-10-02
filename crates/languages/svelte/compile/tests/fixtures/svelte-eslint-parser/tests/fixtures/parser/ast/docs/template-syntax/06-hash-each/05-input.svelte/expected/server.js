import * as $ from 'svelte/internal/server';

export default function _5_input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let i = 0, $$length = each_array.length; i < $$length; i++) {
		let { id, name, qty } = each_array[i];

		$$renderer.push(`<li>${$.escape(i + 1)}: ${$.escape(name)} x ${$.escape(qty)}</li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(objects);

	for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
		let { id, ...rest } = each_array_1[$$index_1];

		$$renderer.push(`<li><span>${$.escape(id)}</span>`);
		MyComponent($$renderer, $.spread_props([rest]));
		$$renderer.push(`<!----></li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(items);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		let [id, ...rest] = each_array_2[$$index_2];

		$$renderer.push(`<li><span>${$.escape(id)}</span>`);
		MyComponent($$renderer, { values: rest });
		$$renderer.push(`<!----></li>`);
	}

	$$renderer.push(`<!--]-->`);
}