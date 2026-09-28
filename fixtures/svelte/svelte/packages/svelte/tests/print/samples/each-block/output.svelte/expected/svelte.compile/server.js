import * as $ from 'svelte/internal/server';

export default function Output($$renderer) {
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

	const each_array_2 = $.ensure_array_like(expression);

	for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
		$$renderer.push(`<!---->...`);
	}

	$$renderer.push(`<!--]--> `);

	const each_array_3 = $.ensure_array_like(todos);

	if (each_array_3.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
			let todo = each_array_3[$$index_3];

			$$renderer.push(`<p>${$.escape(todo.text)}</p>`);
		}
	} else {
		$$renderer.push(`<!--[!--><p>No tasks today!</p>`);
	}

	$$renderer.push(`<!--]-->`);
}