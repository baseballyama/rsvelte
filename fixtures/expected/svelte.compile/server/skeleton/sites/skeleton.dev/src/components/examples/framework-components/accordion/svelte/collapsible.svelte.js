import * as $ from 'svelte/internal/server';
import { Accordion } from '@skeletonlabs/skeleton-svelte';

export default function Collapsible($$renderer) {
	Accordion($$renderer, {
		collapsible: true,
		children: ($$renderer) => {
			$$renderer.push(`<!--[-->`);

			const each_array = $.ensure_array_like(['1', '2', '3']);

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let item = each_array[$$index];

				if (Accordion.Item) {
					$$renderer.push('<!--[-->');

					Accordion.Item($$renderer, {
						value: item,
						children: ($$renderer) => {
							$$renderer.push(`<h3>`);

							if (Accordion.ItemTrigger) {
								$$renderer.push('<!--[-->');

								Accordion.ItemTrigger($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Item ${$.escape(item)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(`</h3> `);

							if (Accordion.ItemContent) {
								$$renderer.push('<!--[-->');

								Accordion.ItemContent($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<!---->Content for item ${$.escape(item)}`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			}

			$$renderer.push(`<!--]-->`);
		},
		$$slots: { default: true }
	});
}