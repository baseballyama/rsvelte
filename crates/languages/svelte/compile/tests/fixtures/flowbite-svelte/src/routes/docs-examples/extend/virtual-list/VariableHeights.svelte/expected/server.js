import * as $ from 'svelte/internal/server';
import { VirtualList } from "flowbite-svelte";

export default function VariableHeights($$renderer) {
	const items = Array.from({ length: 1000 }, (_, i) => {
		const types = ["small", "medium", "large"];
		const type = types[i % 3];

		return {
			title: `Item ${i + 1}`,
			description: type === "small"
				? "Short description"
				: type === "medium"
					? "Medium length description with more details about this item"
					: "Large description with lots of content. Lorem ipsum dolor sit amet, consectetur adipiscing elit. This item has much more information to display and takes up more vertical space.",
			type
		};
	});

	function getItemHeight(item) {
		const typedItem = item;

		return typedItem.type === "small" ? 100 : typedItem.type === "medium" ? 90 : 130;
	}

	{
		function children($$renderer, item, _index) {
			const typedItem = item;

			$$renderer.push(`<div class="border-b p-3 hover:bg-gray-50 dark:hover:bg-gray-800"${$.attr_style(`height:${$.stringify(getItemHeight(typedItem))}px`)}><div class="font-semibold text-gray-900 dark:text-white">${$.escape(typedItem.title)}</div> <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">${$.escape(typedItem.description)}</div> <div class="mt-1 text-xs text-gray-500">Height: ${$.escape(getItemHeight(typedItem))}px</div></div>`);
		}

		VirtualList($$renderer, {
			items,
			minItemHeight: 100,
			getItemHeight,
			height: 400,
			children,
			$$slots: { default: true }
		});
	}
}