import * as $ from 'svelte/internal/server';
import { Button, PaginationNav, Stack } from "carbon-components-svelte";

export default function PaginationNavReactive($$renderer) {
	let page = 2;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Stack($$renderer, {
			gap: 6,
			children: ($$renderer) => {
				PaginationNav($$renderer, {
					get page() {
						return page;
					},

					set page($$value) {
						page = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);

				Stack($$renderer, {
					gap: 4,
					orientation: 'horizontal',
					align: 'center',
					children: ($$renderer) => {
						Button($$renderer, {
							kind: 'tertiary',
							size: 'small',
							disabled: page === 0,
							children: ($$renderer) => {
								$$renderer.push(`<!---->Set page to 1`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <div><strong>Current page:</strong> ${$.escape(page)}</div>`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}