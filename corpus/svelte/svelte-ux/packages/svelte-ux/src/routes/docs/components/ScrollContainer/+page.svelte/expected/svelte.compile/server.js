import * as $ from 'svelte/internal/server';
import { Button, ScrollContainer } from 'svelte-ux';
import Preview from '$lib/components/Preview.svelte';

export default function _page($$renderer) {
	$$renderer.push(`<h1>Examples</h1> <h2>Basic</h2> `);

	Preview($$renderer, {
		children: ($$renderer) => {
			ScrollContainer($$renderer, {
				class: 'scroll-mt-6 scroll-mb-6',
				children: $.invalid_default_snippet,
				$$slots: {
					default: ($$renderer, { scrollIntoView }) => {
						Button($$renderer, {
							variant: 'fill',
							color: 'primary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Scroll to bottom`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like({ length: 100 });

						for (let i = 0, $$length = each_array.length; i < $$length; i++) {
							let _ = each_array[i];

							$$renderer.push(`<div>Item: ${$.escape(i + 1)}</div>`);
						}

						$$renderer.push(`<!--]--> `);

						Button($$renderer, {
							variant: 'fill',
							color: 'primary',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Scroll to top`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!---->`);
					}
				}
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}