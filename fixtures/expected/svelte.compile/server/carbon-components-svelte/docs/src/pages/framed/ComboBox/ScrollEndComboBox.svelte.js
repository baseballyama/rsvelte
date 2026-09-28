import * as $ from 'svelte/internal/server';
import { ComboBox, InlineLoading, Stack } from "carbon-components-svelte";

export default function ScrollEndComboBox($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const PAGE_SIZE = 40;
		const TOTAL = 200;
		let items = [];
		let loading = false;
		let hasMore = true;

		function makePage(offset) {
			return Array.from({ length: PAGE_SIZE }, (_, i) => {
				const n = offset + i;

				return { id: String(n), text: `Item ${n + 1}` };
			}).filter((item) => Number(item.id) < TOTAL);
		}

		async function loadMore() {
			if (loading || !hasMore) return;

			loading = true;
			await new Promise((resolve) => setTimeout(resolve, 400));

			const next = makePage(items.length);

			items = [...items, ...next];
			hasMore = items.length < TOTAL;
			loading = false;
		}

		loadMore();

		Stack($$renderer, {
			gap: 4,
			children: ($$renderer) => {
				ComboBox($$renderer, {
					labelText: 'Load more on scroll',
					placeholder: 'Open and scroll to the bottom…',
					items,
					shouldFilterItem: () => true,
					virtualize: { containerHeight: 240, threshold: 1 }
				});

				$$renderer.push(`<!----> `);

				if (loading) {
					$$renderer.push('<!--[0-->');
					InlineLoading($$renderer, { description: 'Loading more…' });
				} else if (!hasMore) {
					$$renderer.push(`<!--[1--><p>Loaded all 200 items.</p>`);
				} else {
					$$renderer.push(`<!--[-1--><p>${$.escape(items.length)}
      of 200 loaded. Scroll the menu to fetch the next page.</p>`);
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});
	});
}