import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toolbar, ToolbarButton, ToolbarGroup } from "flowbite-svelte";
import { HomeOutline, EnvelopeOutline, ImageOutline, CogOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Groups($$anchor) {
	{
		const end = ($$anchor) => {
			ToolbarButton($$anchor, {
				color: 'green',
				children: ($$anchor, $$slotProps) => {
					CogOutline($$anchor, { class: 'h-6 w-6' });
				},
				$$slots: { default: true }
			});
		};

		Toolbar($$anchor, {
			color: 'green',
			end,
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_1();
				var node = $.first_child(fragment_3);

				ToolbarGroup(node, {
					children: ($$anchor, $$slotProps) => {
						var fragment_4 = root();
						var node_1 = $.first_child(fragment_4);

						ToolbarButton(node_1, {
							color: 'green',
							children: ($$anchor, $$slotProps) => {
								HomeOutline($$anchor, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						var node_2 = $.sibling(node_1, 2);

						ToolbarButton(node_2, {
							color: 'green',
							children: ($$anchor, $$slotProps) => {
								EnvelopeOutline($$anchor, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						var node_3 = $.sibling(node_2, 2);

						ToolbarButton(node_3, {
							color: 'green',
							children: ($$anchor, $$slotProps) => {
								ImageOutline($$anchor, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_4);
					},
					$$slots: { default: true }
				});

				var node_4 = $.sibling(node, 2);

				ToolbarGroup(node_4, {
					children: ($$anchor, $$slotProps) => {
						var fragment_8 = root();
						var node_5 = $.first_child(fragment_8);

						ToolbarButton(node_5, {
							color: 'green',
							children: ($$anchor, $$slotProps) => {
								HomeOutline($$anchor, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						var node_6 = $.sibling(node_5, 2);

						ToolbarButton(node_6, {
							color: 'green',
							children: ($$anchor, $$slotProps) => {
								EnvelopeOutline($$anchor, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						var node_7 = $.sibling(node_6, 2);

						ToolbarButton(node_7, {
							color: 'green',
							children: ($$anchor, $$slotProps) => {
								ImageOutline($$anchor, { class: 'h-6 w-6' });
							},
							$$slots: { default: true }
						});

						$.append($$anchor, fragment_8);
					},
					$$slots: { default: true }
				});

				$.append($$anchor, fragment_3);
			},
			$$slots: { end: true, default: true }
		});
	}
}