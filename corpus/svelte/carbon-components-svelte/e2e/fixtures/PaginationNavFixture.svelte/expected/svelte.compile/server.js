import * as $ from 'svelte/internal/server';
import { PaginationNav } from "carbon-components-svelte";

export default function PaginationNavFixture($$renderer) {
	let page = 1;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		PaginationNav($$renderer, {
			'data-testid': 'pagination-nav',
			total: 10,
			get page() {
				return page;
			},

			set page($$value) {
				page = $$value;
				$$settled = false;
			}
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}