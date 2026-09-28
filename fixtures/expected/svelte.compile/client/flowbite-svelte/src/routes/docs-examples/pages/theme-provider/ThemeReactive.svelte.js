import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ThemeProvider, Button, Card, Alert } from "flowbite-svelte";

var root = $.from_html(`<span class="font-medium">Testing Instructions:</span> <ul class="mt-2 list-inside list-disc"><li>Click different color buttons to change the theme</li> <li>Toggle button width to see reactive updates</li> <li>Both button and card should update immediately</li></ul>`, 1);
var root_1 = $.from_html(`<button> </button>`);
var root_2 = $.from_html(`<h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Reactive Theme Card</h5> <p class="leading-tight font-normal text-gray-700 dark:text-gray-400">This card's background should change reactively when you select different color themes above. The button should also update its color and width based on your selections.</p> <p class="mt-4 text-sm text-gray-600">If you see the colors and sizes changing instantly, the ThemeProvider reactivity is working correctly! 🎉</p>`, 1);
var root_3 = $.from_html(`<div class="space-y-6"><div><h3 class="mb-2 text-lg font-semibold">Themed Button:</h3> <!></div> <div><h3 class="mb-2 text-lg font-semibold">Themed Card:</h3> <!></div></div>`);
var root_4 = $.from_html(`<div class="mx-auto max-w-4xl p-8"><h1 class="mb-6 text-3xl font-bold">ThemeProvider Reactivity Test</h1> <!> <div class="mb-6 space-y-4"><div><p class="mb-2 text-sm font-semibold">Color Theme:</p> <div class="flex flex-wrap gap-2"></div></div> <div><p class="mb-2 text-sm font-semibold">Button Width:</p> <div class="flex gap-2"></div></div></div> <div class="mb-4 rounded border bg-gray-50 p-4"><p class="text-sm"><strong>Current State:</strong> <br/> Color: <span class="font-mono text-blue-600"> </span> <br/> Button Width: <span class="font-mono text-blue-600"> </span></p></div> <!></div>`);

export default function ThemeReactive($$anchor) {
	let selectedColor = $.state("purple");
	let buttonWidth = $.state("w-48");

	// Make themes a derived value so it reacts to buttonWidth changes
	const themes = $.derived(() => ({
		purple: {
			button: {
				base: `${$.get(buttonWidth)} bg-purple-500 hover:bg-purple-600`
			},
			card: { base: "bg-purple-100 w-72" }
		},
		green: {
			button: {
				base: `${$.get(buttonWidth)} bg-green-500 hover:bg-green-600`
			},
			card: { base: "bg-green-100 w-72" }
		},
		blue: {
			button: { base: `${$.get(buttonWidth)} bg-blue-500 hover:bg-blue-600` },
			card: { base: "bg-blue-100 w-72" }
		},
		red: {
			button: { base: `${$.get(buttonWidth)} bg-red-500 hover:bg-red-600` },
			card: { base: "bg-red-100 w-72" }
		}
	}));

	const currentTheme = $.derived(() => $.get(themes)[$.get(selectedColor)]);
	const colors = ["purple", "green", "blue", "red"];

	const colorClasses = {
		purple: "bg-purple-700",
		green: "bg-green-700",
		blue: "bg-blue-700",
		red: "bg-red-700"
	};

	const widthOptions = ["w-32", "w-48", "w-64"];

	const widthLabels = {
		"w-32": "Small (w-32)",
		"w-48": "Medium (w-48)",
		"w-64": "Large (w-64)"
	};

	var div = root_4();
	var node = $.sibling($.child(div), 2);

	Alert(node, {
		class: 'mb-6',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();

			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var div_1 = $.sibling(node, 2);
	var div_2 = $.child(div_1);
	var div_3 = $.sibling($.child(div_2), 2);

	$.each(div_3, 21, () => colors, $.index, ($$anchor, color) => {
		var button = root_1();
		var text = $.only_child(button, true);

		$.template_effect(() => {
			$.set_class(button, 1, `rounded px-4 py-2 capitalize transition-colors ${$.get(selectedColor) === $.get(color)
				? `${colorClasses[$.get(color)]} text-white`
				: 'bg-gray-200 hover:bg-gray-300'}`);

			$.set_text(text, $.get(color));
		});

		$.delegated('click', button, () => $.set(selectedColor, $.get(color), true));
		$.append($$anchor, button);
	});

	$.reset(div_3);
	$.reset(div_2);

	var div_4 = $.sibling(div_2, 2);
	var div_5 = $.sibling($.child(div_4), 2);

	$.each(div_5, 21, () => widthOptions, $.index, ($$anchor, width) => {
		var button_1 = root_1();
		var text_1 = $.only_child(button_1, true);

		$.template_effect(() => {
			$.set_class(button_1, 1, `rounded px-4 py-2 ${$.get(buttonWidth) === $.get(width)
				? 'bg-gray-700 text-white'
				: 'bg-gray-200 hover:bg-gray-300'}`);

			$.set_text(text_1, widthLabels[$.get(width)]);
		});

		$.delegated('click', button_1, () => $.set(buttonWidth, $.get(width), true));
		$.append($$anchor, button_1);
	});

	$.reset(div_5);
	$.reset(div_4);
	$.reset(div_1);

	var div_6 = $.sibling(div_1, 2);
	var p = $.child(div_6);
	var span = $.sibling($.child(p), 4);
	var text_2 = $.only_child(span, true);
	var span_1 = $.sibling(span, 4);
	var text_3 = $.only_child(span_1, true);

	$.reset(p);
	$.reset(div_6);

	var node_1 = $.sibling(div_6, 2);

	ThemeProvider(node_1, {
		get theme() {
			return $.get(currentTheme);
		},

		children: ($$anchor, $$slotProps) => {
			var div_7 = root_3();
			var div_8 = $.child(div_7);
			var node_2 = $.sibling($.child(div_8), 2);

			Button(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Click Me!');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_8);

			var div_9 = $.sibling(div_8, 2);
			var node_3 = $.sibling($.child(div_9), 2);

			Card(node_3, {
				class: 'p-6',
				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_2();

					$.next(4);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});

			$.reset(div_9);
			$.reset(div_7);
			$.append($$anchor, div_7);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	$.template_effect(() => {
		$.set_text(text_2, $.get(selectedColor));
		$.set_text(text_3, $.get(buttonWidth));
	});

	$.append($$anchor, div);
}

$.delegate(['click']);