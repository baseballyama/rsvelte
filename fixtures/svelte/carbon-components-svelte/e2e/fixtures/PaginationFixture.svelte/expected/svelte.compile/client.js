import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Pagination } from "carbon-components-svelte";

export default function PaginationFixture($$anchor) {
	let page = 1;
	let pageSize = 10;

	Pagination($$anchor, {
		'data-testid': 'pagination',
		totalItems: 50,
		pageSizes: [10, 20, 50],
		get page() {
			return page;
		},

		set page($$value) {
			page = $$value;
		},

		get pageSize() {
			return pageSize;
		},

		set pageSize($$value) {
			pageSize = $$value;
		}
	});
}