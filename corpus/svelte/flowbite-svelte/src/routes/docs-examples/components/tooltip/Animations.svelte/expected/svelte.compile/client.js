import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Tooltip, Button } from "flowbite-svelte";
import { slide, scale, blur } from "svelte/transition";

var root = $.from_html(`<!> <!> <!> <!> <!> <!>`, 1);

export default function Animations($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Blur');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Tooltip(node_1, {
		get transition() {
			return blur;
		},
		transitionParams: { duration: 300 },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Tooltip content');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Slide');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Tooltip(node_3, {
		get transition() {
			return slide;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Tooltip content');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Button(node_4, {
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Scale');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Tooltip(node_5, {
		get transition() {
			return scale;
		},

		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Tooltip content');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}