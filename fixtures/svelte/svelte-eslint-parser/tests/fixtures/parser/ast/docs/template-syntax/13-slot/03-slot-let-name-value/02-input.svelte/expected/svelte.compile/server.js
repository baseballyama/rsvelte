import * as $ from 'svelte/internal/server';

export default function _2_input($$renderer, $$props) {
	$$renderer.push(`<ul><!--[-->`);

	const each_array = $.ensure_array_like(items);

	for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
		let item = each_array[$$index];

		$$renderer.push(`<li class="fancy"><!--[-->`);
		$.slot($$renderer, $$props, 'item', { item }, null);
		$$renderer.push(`<!--]--></li>`);
	}

	$$renderer.push(`<!--]--></ul> <!--[-->`);
	$.slot($$renderer, $$props, 'footer', {}, null);
	$$renderer.push(`<!--]--> `);

	FancyList($$renderer, {
		items,
		$$slots: {
			item: ($$renderer, { item }) => {
				$$renderer.push(`<div slot="item">${$.escape(item.text)}</div>`);
			},

			footer: ($$renderer) => {
				$$renderer.push(`<p slot="footer">Copyright (c) 2019 Svelte Industries</p>`);
			}
		}
	});

	$$renderer.push(`<!---->`);
}