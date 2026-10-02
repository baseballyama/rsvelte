import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toolbar, ToolbarButton } from "flowbite-svelte";
import { HomeOutline, EnvelopeOutline, ImageOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Colored($$anchor) {
	var fragment = root_1();
	var node = $.first_child(fragment);

	Toolbar(node, {
		color: 'red',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			ToolbarButton(node_1, {
				color: 'red',
				children: ($$anchor, $$slotProps) => {
					HomeOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			ToolbarButton(node_2, {
				color: 'red',
				children: ($$anchor, $$slotProps) => {
					EnvelopeOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			ToolbarButton(node_3, {
				color: 'red',
				children: ($$anchor, $$slotProps) => {
					ImageOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 2);

	Toolbar(node_4, {
		color: 'blue',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_5 = $.first_child(fragment_5);

			ToolbarButton(node_5, {
				color: 'blue',
				children: ($$anchor, $$slotProps) => {
					HomeOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			ToolbarButton(node_6, {
				color: 'blue',
				children: ($$anchor, $$slotProps) => {
					EnvelopeOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			ToolbarButton(node_7, {
				color: 'blue',
				children: ($$anchor, $$slotProps) => {
					ImageOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}