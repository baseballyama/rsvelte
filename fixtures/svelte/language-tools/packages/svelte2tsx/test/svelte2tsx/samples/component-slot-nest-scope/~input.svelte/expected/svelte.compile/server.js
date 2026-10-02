import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.push(`<!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
		let item = each_array[$$index_1];

		$$renderer.push(`<!--[-->`);

		const each_array_1 = $.ensure_array_like(item);

		for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
			let { a } = each_array_1[$$index];

			$$renderer.push(`<!--[-->`);

			$.slot($$renderer, $$props, 'default', { a }, () => {
				$$renderer.push(`Hello`);
			});

			$$renderer.push(`<!--]-->`);
		}

		$$renderer.push(`<!--]--> <!--[-->`);
		$.slot($$renderer, $$props, 'second', { a }, null);
		$$renderer.push(`<!--]-->`);
	}

	$$renderer.push(`<!--]--> `);

	Component($$renderer, {
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { c }) => {
				$$renderer.push(`<!---->${$.escape(c)}`);
			}
		}
	});

	$$renderer.push(`<!----> `);

	$.await($$renderer, promise, () => {}, (d) => {
		$$renderer.push(`${$.escape(d)}`);
	});

	$$renderer.push(`<!--]--> <!--[-->`);
	$.slot($$renderer, $$props, 'third', { d, c }, null);
	$$renderer.push(`<!--]-->`);
}