import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li>${$.escape(item.name)} x ${$.escape(item.qty)}</li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_1 = $.ensure_array_like(items);

	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
		let item = each_array_1[i];

		$$renderer.push(`<li>${$.escape(i + 1)}: ${$.escape(item.name)} x ${$.escape(item.qty)}</li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_2 = $.ensure_array_like(items);

	for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
		let { id, name, qty } = each_array_2[i];

		$$renderer.push(`<li>${$.escape(i + 1)}: ${$.escape(name)} x ${$.escape(qty)}</li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_3 = $.ensure_array_like(objects);

	for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
		let { id, ...rest } = each_array_3[$$index_3];

		$$renderer.push(`<li><span>${$.escape(id)}</span>`);
		MyComponent($$renderer, $.spread_props([rest]));
		$$renderer.push(`<!----></li>`);
	}

	$$renderer.push(`<!--]--> <!--[-->`);

	const each_array_4 = $.ensure_array_like(items);

	for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
		let [id, ...rest] = each_array_4[$$index_4];

		$$renderer.push(`<li><span>${$.escape(id)}</span>`);
		MyComponent($$renderer, { values: rest });
		$$renderer.push(`<!----></li>`);
	}

	$$renderer.push(`<!--]--> `);

	const each_array_5 = $.ensure_array_like(todos);

	if (each_array_5.length !== 0) {
		$$renderer.push('<!--[-->');

		for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
			let todo = each_array_5[$$index_5];

			$$renderer.push(`<p>${$.escape(todo.text)}</p>`);
		}
	} else {
		$$renderer.push(`<!--[!--><p>No tasks today!</p>`);
	}

	$$renderer.push(`<!--]-->`);
}