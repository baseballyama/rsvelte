import * as $ from 'svelte/internal/server';
import { Button, Breadcrumb, DividerDot, Icon } from 'svelte-ux';
import { mdiArrowRight } from '@mdi/js';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let items = ['First', 'Second', 'Third'];

		let labeledItems = [
			{ label: 'First', value: 'One' },
			{ label: 'Second', value: 'Two' },
			{ label: 'Third', value: 'Three' }
		];

		$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, { items });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>With gap</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, { items, class: 'gap-1' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom divider</h2> <h3>with prop</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, { items, divider: '/', class: 'gap-2' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom divider</h2> <h3>with slot Icon</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, {
					items,
					class: 'gap-2',
					$$slots: {
						divider: ($$renderer) => {
							Icon($$renderer, {
								slot: 'divider',
								path: mdiArrowRight,
								class: 'text-surface-content/25'
							});
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom item</h2> <h3>with markup</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, {
					items: labeledItems,
					class: 'gap-2',
					$$slots: {
						item: ($$renderer, { item }) => {
							$$renderer.push(`<span slot="item"><div class="text-surface-content/50 text-xs uppercase">${$.escape(item.label)}</div> <div>${$.escape(item.value)}</div></span>`);
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom item</h2> <h3>with Button</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, {
					items: labeledItems,
					$$slots: {
						item: ($$renderer, { item }) => {
							Button($$renderer, {
								slot: 'item',
								children: ($$renderer) => {
									$$renderer.push(`<div><div class="text-surface-content/50 text-xs uppercase">${$.escape(item.label)}</div> <div>${$.escape(item.value)}</div></div>`);
								},
								$$slots: { default: true }
							});
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Custom item and divider</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, {
					items: labeledItems,
					class: 'gap-2',
					$$slots: {
						item: ($$renderer, { item }) => {
							$$renderer.push(`<span slot="item"><span class="text-surface-content/50 text-sm font-extrabold">${$.escape(item.label)}:</span> <span class="text-surface-content/50 text-sm">${$.escape(item.value)}</span></span>`);
						},

						divider: ($$renderer) => {
							DividerDot($$renderer, { slot: 'divider', class: 'text-surface-content/50' });
						}
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Many items</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, {
					items: Array.from({ length: 20 }).map((_, i) => 'Item ' + ++i)
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Null items (not displayed)</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, {
					items: Array.from({ length: 10 }).map((_, i) => i % 2 ? null : 'Item ' + ++i)
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Color</h2> <h3>inherit</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="bg-primary text-primary-content p-2 rounded">`);
				Breadcrumb($$renderer, { items });
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Color</h2> <h3>text class</h3> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				Breadcrumb($$renderer, { items, class: 'text-primary' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h2>Truncate long text</h2> `);

		Preview($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<div class="w-[300px] border">`);

				Breadcrumb($$renderer, {
					items: ['Example', 'of', 'really really really long text'],
					class: 'flex-nowrap',
					$$slots: {
						item: ($$renderer, { item }) => {
							$$renderer.push(`<span slot="item" class="last:truncate"${$.attr('title', item)}>${$.escape(item)}</span>`);
						}
					}
				});

				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	});
}