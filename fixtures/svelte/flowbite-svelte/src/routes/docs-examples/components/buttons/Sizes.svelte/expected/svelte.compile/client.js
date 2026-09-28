import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "flowbite-svelte";
import { EnvelopeSolid } from "flowbite-svelte-icons";

var root = $.from_html(`<!>Extra small`, 1);
var root_1 = $.from_html(`<!>Small`, 1);
var root_2 = $.from_html(`<!>Base`, 1);
var root_3 = $.from_html(`<!>Large`, 1);
var root_4 = $.from_html(`<!>Extra large`, 1);
var root_5 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Sizes($$anchor) {
	var fragment = root_5();
	var node = $.first_child(fragment);

	Button(node, {
		size: 'xs',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			EnvelopeSolid(node_1, { class: 'me-2 h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	Button(node_2, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_1();
			var node_3 = $.first_child(fragment_2);

			EnvelopeSolid(node_3, { class: 'me-2 h-4 w-4' });
			$.next();
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Button(node_4, {
		size: 'md',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_2();
			var node_5 = $.first_child(fragment_3);

			EnvelopeSolid(node_5, { class: 'me-2 h-5 w-5' });
			$.next();
			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_4, 2);

	Button(node_6, {
		size: 'lg',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_3();
			var node_7 = $.first_child(fragment_4);

			EnvelopeSolid(node_7, { class: 'me-2 h-5 w-5' });
			$.next();
			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_6, 2);

	Button(node_8, {
		size: 'xl',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_4();
			var node_9 = $.first_child(fragment_5);

			EnvelopeSolid(node_9, { class: 'me-2 h-6 w-6' });
			$.next();
			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}