import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ThemeProvider } from "$lib";

var root = $.from_html(`<div class="flex gap-4"><!> <!> <!></div>`);
var root_1 = $.from_html(`<div class="space-y-8 p-8"><section><h2 class="mb-4 text-xl font-bold">Test 1: Without ThemeProvider</h2> <p class="mb-2 text-gray-600">Should render with default theme</p> <!></section> <section><h2 class="mb-4 text-xl font-bold">Test 2: With ThemeProvider</h2> <p class="mb-2 text-gray-600">Should render with custom theme class</p> <!></section> <section><h2 class="mb-4 text-xl font-bold">Test 3: Multiple components in provider</h2> <p class="mb-2 text-gray-600">All should use custom theme</p> <!></section></div>`);

export default function _page($$anchor) {
	// Test 1: Component without ThemeProvider (should use defaults)
	// Test 2: Component with ThemeProvider (should use custom theme)
	const customTheme = { button: { base: "custom-button-class" } };

	var div = root_1();
	var section = $.child(div);
	var node = $.sibling($.child(section), 4);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default Button');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	$.reset(section);

	var section_1 = $.sibling(section, 2);
	var node_1 = $.sibling($.child(section_1), 4);

	ThemeProvider(node_1, {
		get theme() {
			return customTheme;
		},

		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Custom Themed Button');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(section_1);

	var section_2 = $.sibling(section_1, 2);
	var node_2 = $.sibling($.child(section_2), 4);

	ThemeProvider(node_2, {
		get theme() {
			return customTheme;
		},

		children: ($$anchor, $$slotProps) => {
			var div_1 = root();
			var node_3 = $.child(div_1);

			Button(node_3, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Button 1');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				color: 'blue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Button 2');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Button(node_5, {
				outline: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Button 3');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.append($$anchor, div_1);
		},
		$$slots: { default: true }
	});

	$.reset(section_2);
	$.reset(div);
	$.append($$anchor, div);
}