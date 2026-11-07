import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SpatialMenu } from "../SpatialMenu.svelte.js";

var root = $.from_html(`<span class="disabled-label svelte-1ir5fmg">DISABLED</span>`);
var root_1 = $.from_html(`<div><span class="item-name svelte-1ir5fmg"> </span> <span class="item-id svelte-1ir5fmg"> </span> <!></div>`);
var root_2 = $.from_html(`<div data-testid="selected-item" class="selected-info svelte-1ir5fmg"> </div>`);
var root_3 = $.from_html(`<div><h2 class="svelte-1ir5fmg">Spatial Menu Disabled Test</h2> <input/> <div class="items-grid svelte-1ir5fmg"></div> <!> <div data-testid="highlighted-item" class="highlighted-info svelte-1ir5fmg"> </div> <div data-testid="selection-mode" class="mode-info svelte-1ir5fmg"> </div></div>`);

export default function SpatialMenuDisabledTest($$anchor, $$props) {
	$.push($$props, true);

	let wrap = $.prop($$props, 'wrap', 3, false),
		disabledPattern = $.prop($$props, 'disabledPattern', 19, () => []);

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

	let selectedItem = $.state(null);

	const spatialMenu = new SpatialMenu({
		wrap: wrap(),
		scrollBehavior: "smooth",
		onSelect: (item) => {
			$.set(selectedItem, item, true);
		},

		onHighlightChange: () => {
			// Track highlight changes for testing
		}
	});

	var div = root_3();

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
		'svelte-1ir5fmg'
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
		'svelte-1ir5fmg',
		true
	);

	var div_1 = $.sibling(input, 2);

	$.each(div_1, 21, () => itemsArray, $.index, ($$anchor, item, index) => {
		const isDisabled = $.derived(() => disabledPattern()[index] ?? false);
		const menuItem = $.derived(() => spatialMenu.getItem($.get(item), { disabled: $.get(isDisabled) }));
		var div_2 = root_1();

		$.attribute_effect(
			div_2,
			() => ({
				'data-testid': 'spatial-item',
				'data-item-id': $.get(item).id,
				'data-disabled': $.get(isDisabled),
				class: 'item',
				...$.get(menuItem).attrs,
				[$.CLASS]: {
					highlighted: $.get(menuItem).highlighted,
					disabled: $.get(isDisabled)
				},
				[$.STYLE]: { 'background-color': $.get(item).color }
			}),
			void 0,
			void 0,
			void 0,
			'svelte-1ir5fmg'
		);

		var span = $.child(div_2);
		var text = $.only_child(span, true);
		var span_1 = $.sibling(span, 2);
		var text_1 = $.only_child(span_1);
		var node = $.sibling(span_1, 2);

		{
			var consequent = ($$anchor) => {
				var span_2 = root();

				$.append($$anchor, span_2);
			};

			$.if(node, ($$render) => {
				if ($.get(isDisabled)) $$render(consequent);
			});
		}

		$.reset(div_2);

		$.template_effect(() => {
			$.set_text(text, $.get(item).name);
			$.set_text(text_1, `#${$.get(item).id ?? ''}`);
		});

		$.append($$anchor, div_2);
	});

	$.reset(div_1);

	var node_1 = $.sibling(div_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var div_3 = root_2();
			var text_2 = $.only_child(div_3);

			$.template_effect(() => $.set_text(text_2, `Selected: ${$.get(selectedItem).name ?? ''} (#${$.get(selectedItem).id ?? ''})`));
			$.append($$anchor, div_3);
		};

		$.if(node_1, ($$render) => {
			if ($.get(selectedItem)) $$render(consequent_1);
		});
	}

	var div_4 = $.sibling(node_1, 2);
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