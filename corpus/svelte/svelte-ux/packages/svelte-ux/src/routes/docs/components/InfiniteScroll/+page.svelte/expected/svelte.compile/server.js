import * as $ from 'svelte/internal/server';
import { InfiniteScroll, ListItem } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = Array(100).fill(null).map((x, i) => ({ name: `Item: ${i + 1}` }));

		$$renderer.push(`<h1>Examples</h1> <h2>Default</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="h-[400px] p-1 overflow-auto">`);

				InfiniteScroll($$renderer, {
					items,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { visibleItems }) => {
							$$renderer.push(`<!--[-->`);

							const each_array = $.ensure_array_like(visibleItems);

							for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
								let item = each_array[$$index];

								ListItem($$renderer, { title: item.name });
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Per page</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="h-[400px] p-1 overflow-auto">`);

				InfiniteScroll($$renderer, {
					items,
					perPage: 5,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { visibleItems }) => {
							$$renderer.push(`<!--[-->`);

							const each_array_1 = $.ensure_array_like(visibleItems);

							for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
								let item = each_array_1[$$index_1];

								ListItem($$renderer, { title: item.name });
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Viewport root (no overflown parent/ancestor)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				InfiniteScroll($$renderer, {
					items,
					children: $.invalid_default_snippet,
					$$slots: {
						default: ($$renderer, { visibleItems }) => {
							$$renderer.push(`<!--[-->`);

							const each_array_2 = $.ensure_array_like(visibleItems);

							for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
								let item = each_array_2[$$index_2];

								ListItem($$renderer, { title: item.name });
							}

							$$renderer.push(`<!--]-->`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}