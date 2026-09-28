import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { PaginationNav } from "carbon-components-svelte";

export default function PaginationNavFixture($$anchor) {
	let page = 1;

	PaginationNav($$anchor, {
		'data-testid': 'pagination-nav',
		total: 10,
		get page() {
			return page;
		},

		set page($$value) {
			page = $$value;
		}
	});
}