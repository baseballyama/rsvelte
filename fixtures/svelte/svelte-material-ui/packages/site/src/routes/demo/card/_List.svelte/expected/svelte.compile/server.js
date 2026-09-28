import * as $ from 'svelte/internal/server';
import Card, { Content } from '@smui/card';
import List, { Item, Text } from '@smui/list';

export default function _List($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let clicked = 0;

		$$renderer.push(`<div class="card-display"><div class="card-container">`);

		Card($$renderer, {
			children: ($$renderer) => {
				Content($$renderer, {
					component: List,
					children: ($$renderer) => {
						Item($$renderer, {
							onclick: () => clicked++,
							children: ($$renderer) => {
								Text($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->A card with a list as content.`);
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like([...Array(5)].map((_v, i) => i + 1));

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let item = each_array[$$index];

							Item($$renderer, {
								onclick: () => clicked++,
								children: ($$renderer) => {
									Text($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Item #${$.escape(item)}`);
										},
										$$slots: { default: true }
									});
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div></div> <pre class="status">Clicked: ${$.escape(clicked)}</pre>`);
	});
}