import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GradientButton } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function GradientOutline($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	GradientButton(node, {
		outline: true,
		color: 'purpleToBlue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Purple to Blue');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	GradientButton(node_1, {
		outline: true,
		color: 'cyanToBlue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Cyan to Blue');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	GradientButton(node_2, {
		outline: true,
		color: 'greenToBlue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Green to Blue');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	GradientButton(node_3, {
		outline: true,
		color: 'purpleToPink',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Purple to Pink');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	GradientButton(node_4, {
		outline: true,
		color: 'pinkToOrange',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Pink to Orange');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	GradientButton(node_5, {
		outline: true,
		color: 'tealToLime',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Teal to Lime');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	GradientButton(node_6, {
		outline: true,
		pill: true,
		color: 'redToYellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Red to Yellow');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	GradientButton(node_7, {
		outline: true,
		color: 'redToYellow',
		class: 'w-72',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Red to Yellow');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}