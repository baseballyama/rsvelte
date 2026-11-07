import * as $ from 'svelte/internal/server';
import { Pagination } from "carbon-components-svelte";

export default function PageWindow($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const formatNumber = (value) => {
			return Intl.NumberFormat("en", { notation: "compact" }).format(value).toLowerCase();
		};

		Pagination($$renderer, {
			totalItems: 100_000,
			pageSizes: [10, 15, 20],
			itemRangeText: (min, max, total) => `${formatNumber(min)}–${formatNumber(max)} of ${formatNumber(total)} items`,
			pageRangeText: (_current, total) => `of ${formatNumber(total)} pages`
		});
	});
}