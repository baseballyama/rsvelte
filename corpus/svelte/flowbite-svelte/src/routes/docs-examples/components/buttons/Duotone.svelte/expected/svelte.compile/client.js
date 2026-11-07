import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GradientButton } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Duotone($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	GradientButton(node, {
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
		color: 'redToYellow',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Red to Yellow');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}