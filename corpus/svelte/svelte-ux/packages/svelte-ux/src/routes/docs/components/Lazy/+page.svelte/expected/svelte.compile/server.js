import * as $ from 'svelte/internal/server';
import { Lazy, ListItem } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = Array(100).fill(null).map((x, i) => ({ name: `Item: ${i + 1}` }));

		$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="h-[400px] p-1 overflow-auto"><!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					Lazy($$renderer, {
						height: '40px',
						class: 'group',
						children: ($$renderer) => {
							ListItem($$renderer, { title: item.name, list: 'group' });
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Unmount</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="h-[400px] p-1 overflow-auto"><!--[-->`);

				const each_array_1 = $.ensure_array_like(items);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let item = each_array_1[$$index_1];

					Lazy($$renderer, {
						height: '40px',
						class: 'group',
						unmount: true,
						children: ($$renderer) => {
							ListItem($$renderer, { title: item.name, list: 'group' });
						},
						$$slots: { default: true }
					});
				}

				$$renderer.push(`<!--]--></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}