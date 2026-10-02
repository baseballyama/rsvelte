import * as $ from 'svelte/internal/server';
import { VirtualList, Button } from "flowbite-svelte";

export default function Jump($$renderer) {
	const items = Array.from({ length: 5000 }, (_, i) => `Item ${i + 1}`);
	let scrollToFn;

	function jumpToItem(index) {
		scrollToFn?.(index);
	}

	$$renderer.push(`<div class="space-y-4">`);

	Button($$renderer, {
		onclick: () => jumpToItem(2499),
		children: ($$renderer) => {
			$$renderer.push(`<!---->Jump to item 2500`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		onclick: () => jumpToItem(0),
		children: ($$renderer) => {
			$$renderer.push(`<!---->Jump to top item`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	{
		function children($$renderer, item, index) {
			$$renderer.push(`<div class="h-[40px] border-b p-2 leading-[40px] text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800">${$.escape(index + 1)}: ${$.escape(item)}</div>`);
		}

		VirtualList($$renderer, {
			items,
			minItemHeight: 40,
			height: 400,
			scrollToIndex: (fn) => scrollToFn = fn,
			children,
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!----></div>`);
}