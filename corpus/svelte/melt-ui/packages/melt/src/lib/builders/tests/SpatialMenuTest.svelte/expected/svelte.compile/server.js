import * as $ from 'svelte/internal/server';
import { SpatialMenu } from "../SpatialMenu.svelte.js";

export default function SpatialMenuTest($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let {
			wrap = false,
			items = 8,
			crossAxis = false,
			toleranceCol = 16,
			toleranceRow = 16
		} = $$props;

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
			{ name: "Emerald", color: "#059669" },
			{ name: "Amber", color: "#d97706" },
			{ name: "Lime", color: "#65a30d" },
			{ name: "Sky", color: "#0284c7" },
			{ name: "Violet", color: "#7c3aed" },
			{ name: "Fuchsia", color: "#c026d3" },
			{ name: "Slate", color: "#475569" },
			{ name: "Zinc", color: "#71717a" },
			{ name: "Stone", color: "#78716c" }
		];

		const itemsArray = Array.from({ length: items }, (_, i) => {
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
			crossAxis,
			toleranceCol,
			toleranceRow,
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
			'svelte-iqs62g'
		)}><h2 class="svelte-iqs62g">Spatial Menu Test</h2> <input${$.attributes(
			{
				'data-testid': 'spatial-input',
				placeholder: 'Type to test input navigation',
				...spatialMenu.input
			},
			'svelte-iqs62g',
			void 0,
			void 0,
			4
		)}/> <div class="items-grid svelte-iqs62g"><!--[-->`);

		const each_array = $.ensure_array_like(itemsArray);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			const menuItem = spatialMenu.getItem(item);

			$$renderer.push(`<div${$.attributes(
				{
					'data-testid': 'spatial-item',
					'data-item-id': item.id,
					class: 'item',
					...menuItem.attrs
				},
				'svelte-iqs62g',
				{ highlighted: menuItem.highlighted },
				{ 'background-color': item.color }
			)}><span class="item-name svelte-iqs62g">${$.escape(item.name)}</span> <span class="item-id svelte-iqs62g">#${$.escape(item.id)}</span></div>`);
		}

		$$renderer.push(`<!--]--></div> `);

		if (selectedItem) {
			$$renderer.push(`<!--[0--><div data-testid="selected-item" class="selected-info svelte-iqs62g">Selected: ${$.escape(selectedItem.name)} (#${$.escape(selectedItem.id)})</div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <div data-testid="highlighted-item" class="highlighted-info svelte-iqs62g">Highlighted: ${$.escape(spatialMenu.highlighted?.name ?? "None")}</div> <div data-testid="selection-mode" class="mode-info svelte-iqs62g">Mode: ${$.escape(spatialMenu.selectionMode)}</div></div>`);
	});
}