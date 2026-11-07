import * as $ from 'svelte/internal/server';

export default function _1_input($$renderer, $$props) {
	$$renderer.push(`<ul><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li class="fancy"><!--[-->`);
		$.slot($$renderer, $$props, 'default', { prop: item }, null);
		$$renderer.push(`<!--]--></li>`);
	}

	$$renderer.push(`<!--]--></ul> `);

	FancyList($$renderer, {
		items,
		children: $.invalid_default_snippet,
		$$slots: {
			default: ($$renderer, { prop: thing }) => {
				$$renderer.push(`<div>${$.escape(thing.text)}</div>`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}