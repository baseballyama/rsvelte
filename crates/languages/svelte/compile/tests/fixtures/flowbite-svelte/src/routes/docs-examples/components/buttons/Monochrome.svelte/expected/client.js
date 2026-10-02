import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { GradientButton } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Monochrome($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	GradientButton(node, {
		color: 'blue',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Blue');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	GradientButton(node_1, {
		color: 'green',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Green');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	GradientButton(node_2, {
		color: 'cyan',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Cyan');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	GradientButton(node_3, {
		color: 'teal',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Teal');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	GradientButton(node_4, {
		color: 'lime',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Lime');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	GradientButton(node_5, {
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Red');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	GradientButton(node_6, {
		color: 'pink',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Pink');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	GradientButton(node_7, {
		color: 'purple',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Purple');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}