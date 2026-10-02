import * as $ from 'svelte/internal/server';
import { Pagination } from "carbon-components-svelte";

export default function PaginationFixture($$renderer) {
	let page = 1;
	let pageSize = 10;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Pagination($$renderer, {
			'data-testid': 'pagination',
			totalItems: 50,
			pageSizes: [10, 20, 50],
			get page() {
				return page;
			},

			set page($$value) {
				page = $$value;
				$$settled = false;
			},

			get pageSize() {
				return pageSize;
			},

			set pageSize($$value) {
				pageSize = $$value;
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