import * as $ from 'svelte/internal/server';
import { VirtualList, Badge } from "flowbite-svelte";

export default function LargeDataset($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const ITEM_COUNT = 100000;

		const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
			id: i + 1,
			title: `Record ${i + 1}`,
			value: Math.floor(Math.random() * 10000)
		}));

		let renderTime = 0;
		let startTime;

		function measureRenderStart() {
			startTime = performance.now();
		}

		function measureRenderEnd() {
			renderTime = performance.now() - startTime;
		}

		$$renderer.push(`<div class="space-y-4"><div class="flex items-center gap-4 text-sm">`);

		Badge($$renderer, {
			large: true,
			color: 'blue',
			children: ($$renderer) => {
				$$renderer.push(`<!---->${$.escape(ITEM_COUNT.toLocaleString())} items`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		if (renderTime > 0) {
			$$renderer.push(`<!--[0--><span class="text-gray-600 dark:text-gray-400">Rendered in ${$.escape(renderTime.toFixed(2))}ms</span>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		{
			function children($$renderer, item, _index) {
				const record = item;

				$$renderer.push(`<div class="flex items-center justify-between border-b p-3 hover:bg-gray-50 dark:hover:bg-gray-800" style="height:45px"><span class="text-gray-900 dark:text-white">${$.escape(record.title)}</span> <span class="font-mono text-sm text-gray-600 dark:text-gray-400">$${$.escape(record.value.toLocaleString())}</span></div>`);
			}

			VirtualList($$renderer, {
				items,
				minItemHeight: 45,
				height: 500,
				class: 'rounded-lg border',
				children,
				$$slots: { default: true }
			});
		}

		$$renderer.push(`<!----> <p class="text-xs text-gray-500 dark:text-gray-400">💡 Try scrolling through 100,000 items - notice how smooth it remains!</p></div>`);
	});
}