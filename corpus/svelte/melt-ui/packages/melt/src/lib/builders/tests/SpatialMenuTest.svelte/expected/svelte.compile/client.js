import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpatialMenu } from "../SpatialMenu.svelte.js";

var root = $.from_html(`<div><span class="item-name svelte-iqs62g"> </span> <span class="item-id svelte-iqs62g"> </span></div>`);
var root_1 = $.from_html(`<div data-testid="selected-item" class="selected-info svelte-iqs62g"> </div>`);
var root_2 = $.from_html(`<div><h2 class="svelte-iqs62g">Spatial Menu Test</h2> <input/> <div class="items-grid svelte-iqs62g"></div> <!> <div data-testid="highlighted-item" class="highlighted-info svelte-iqs62g"> </div> <div data-testid="selection-mode" class="mode-info svelte-iqs62g"> </div></div>`);

export default function SpatialMenuTest($$anchor, $$props) {
	$.push($$props, true);

	let wrap = $.prop($$props, 'wrap', 3, false),
		items = $.prop($$props, 'items', 3, 8),
		crossAxis = $.prop($$props, 'crossAxis', 3, false),
		toleranceCol = $.prop($$props, 'toleranceCol', 3, 16),
		toleranceRow = $.prop($$props, 'toleranceRow', 3, 16);

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

	const itemsArray = Array.from({ length: items() }, (_, i) => {
		const colorIndex = i % allColors.length;

		return {
			id: i + 1,
			name: allColors[colorIndex]?.name ?? "Unknown",
			color: allColors[colorIndex]?.color ?? "#ccc"
		};
	});

	let selectedItem = $.state(null);

	const spatialMenu = new SpatialMenu({
		wrap: wrap(),
		crossAxis: crossAxis(),
		toleranceCol: toleranceCol(),
		toleranceRow: toleranceRow(),
		scrollBehavior: "smooth",
		onSelect: (item) => {
			$.set(selectedItem, item, true);
		},

		onHighlightChange: () => {
			// Track highlight changes for testing
		}
	});

	var div = root_2();

	$.attribute_effect(
		div,
		() => ({
			'data-testid': 'spatial-root',
			class: 'test-container',
			...spatialMenu.root
		}),
		void 0,
		void 0,
		void 0,
		'svelte-iqs62g'
	);

	var input = $.sibling($.child(div), 2);

	$.attribute_effect(
		input,
		() => ({
			'data-testid': 'spatial-input',
			placeholder: 'Type to test input navigation',
			...spatialMenu.input
		}),
		void 0,
		void 0,
		void 0,
		'svelte-iqs62g',
		true
	);

	var div_1 = $.sibling(input, 2);

	$.each(div_1, 21, () => itemsArray, $.index, ($$anchor, item) => {
		const menuItem = $.derived(() => spatialMenu.getItem($.get(item)));
		var div_2 = root();

		$.attribute_effect(
			div_2,
			() => ({
				'data-testid': 'spatial-item',
				'data-item-id': $.get(item).id,
				class: 'item',
				...$.get(menuItem).attrs,
				[$.CLASS]: { highlighted: $.get(menuItem).highlighted },
				[$.STYLE]: { 'background-color': $.get(item).color }
			}),
			void 0,
			void 0,
			void 0,
			'svelte-iqs62g'
		);

		var span = $.child(div_2);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1);

		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text, $.get(item).name);
			$.set_text(text_1, `#${$.get(item).id ?? ''}`);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var node = $.sibling(div_1, 2);

	{
		var consequent = ($$anchor) => {
			var div_3 = root_1();
			var text_2 = $.only_child(div_3);

			$.template_effect(() => $.set_text(text_2, `Selected: ${$.get(selectedItem).name ?? ''} (#${$.get(selectedItem).id ?? ''})`));
			$.append($$anchor, div_3);
		};

		$.if(node, ($$render) => {
			if ($.get(selectedItem)) $$render(consequent);
		});
	}

	var div_4 = $.sibling(node, 2);
	var text_3 = $.only_child(div_4);
	var div_5 = $.sibling(div_4, 2);
	var text_4 = $.only_child(div_5);

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_3, `Highlighted: ${spatialMenu.highlighted?.name ?? "None" ?? ''}`);
		$.set_text(text_4, `Mode: ${spatialMenu.selectionMode ?? ''}`);
	});

	$.append($$anchor, div);
	$.pop();
}