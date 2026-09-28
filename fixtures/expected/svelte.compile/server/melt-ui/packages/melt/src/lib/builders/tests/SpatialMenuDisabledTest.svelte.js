import * as $ from 'svelte/internal/server';
import { SpatialMenu } from "../SpatialMenu.svelte.js";

export default function SpatialMenuDisabledTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { wrap = false, disabledPattern = [] } = $$props;

		const allColors = [
			{ name: "Red", color: "#ef4444" },
			{ name: "Blue", color: "#3b82f6" },
			{ name: "Green", color: "#10b981" },
			{ name: "Yellow", color: "#f59e0b" },
			{ name: "Purple", color: "#8b5cf6" },
			{ name: "Pink", color: "#ec4899" },
			{ name: "Orange", color: "#f97316" },
			{ name: "Cyan", color: "#06b6d4" },
			{ name: "Indigo", color: "#6366f1" },
			{ name: "Teal", color: "#14b8a6" },
			{ name: "Rose", color: "#f43f5e" },
			{ name: "Emerald", color: "#059669" }
		];

		// Create a 3x4 grid (12 items)
		const itemsArray = Array.from({ length: 12 }, (_, i) => {
			const colorIndex = i % allColors.length;

			return {
				id: i + 1,
				name: allColors[colorIndex]?.name ?? "Unknown",
				color: allColors[colorIndex]?.color ?? "#ccc"
			};
		});

		let selectedItem = null;

		const spatialMenu = new SpatialMenu({
			wrap,
			scrollBehavior: "smooth",
			onSelect: (item) => {
				selectedItem = item;
			},

			onHighlightChange: () => {
				// Track highlight changes for testing
			}
		});

		$$renderer.push(`<div${$.attributes(
			{
				'data-testid': 'spatial-root',
				class: 'test-container',
				...spatialMenu.root
			},
			'svelte-1ir5fmg'
		)}><h2 class="svelte-1ir5fmg">Spatial Menu Disabled Test</h2> <input${$.attributes(
			{
				'data-testid': 'spatial-input',
				placeholder: 'Type to test input navigation',
				...spatialMenu.input
			},
			'svelte-1ir5fmg',
			void 0,
			void 0,
			4
		)}/> <div class="items-grid svelte-1ir5fmg"><!--[-->`);

		const each_array = $.ensure_array_like(itemsArray);

		for (let index = 0, $$length = each_array.length; index < $$length; index++) {
			let item = each_array[index];
			const isDisabled = disabledPattern[index] ?? false;
			const menuItem = spatialMenu.getItem(item, { disabled: isDisabled });

			$$renderer.push(`<div${$.attributes(
				{
					'data-testid': 'spatial-item',
					'data-item-id': item.id,
					'data-disabled': isDisabled,
					class: 'item',
					...menuItem.attrs
				},
				'svelte-1ir5fmg',
				{ highlighted: menuItem.highlighted, disabled: isDisabled },
				{ 'background-color': item.color }
			)}><span class="item-name svelte-1ir5fmg">${$.escape(item.name)}</span> <span class="item-id svelte-1ir5fmg">#${$.escape(item.id)}</span> `);

			if (isDisabled) {
				$$renderer.push(`<!--[0--><span class="disabled-label svelte-1ir5fmg">DISABLED</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (selectedItem) {
			$$renderer.push(`<!--[0--><div data-testid="selected-item" class="selected-info svelte-1ir5fmg">Selected: ${$.escape(selectedItem.name)} (#${$.escape(selectedItem.id)})</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div data-testid="highlighted-item" class="highlighted-info svelte-1ir5fmg">Highlighted: ${$.escape(spatialMenu.highlighted?.name ?? "None")}</div> <div data-testid="selection-mode" class="mode-info svelte-1ir5fmg">Mode: ${$.escape(spatialMenu.selectionMode)}</div></div>`);
	});
}