import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toolbar, ToolbarButton } from "flowbite-svelte";
import { HomeOutline, EnvelopeOutline, ImageOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Default($$anchor) {
	Toolbar($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ToolbarButton(node, {
				children: ($$anchor, $$slotProps) => {
					HomeOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			ToolbarButton(node_1, {
				children: ($$anchor, $$slotProps) => {
					EnvelopeOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			ToolbarButton(node_2, {
				children: ($$anchor, $$slotProps) => {
					ImageOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}