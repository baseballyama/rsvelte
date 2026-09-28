import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	Dialog,
	Dropdown,
	OverflowMenu,
	OverflowMenuItem,
	Stack
} from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

var root_1 = $.from_html(
	`<p>Carbon components that portal their floating content (dropdowns, overflow
      menus, tooltips, date pickers, etc.) are automatically mounted into the
      nearest <code>&lt;dialog&gt;</code> ancestor, so they render above the
      modal backdrop in the top layer.</p> <!> <!> <!>`,
	1
);

var root_2 = $.from_html(`<!> <!>`, 1);

export default function FloatingPortalDialog($$anchor) {
	let open = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open dialog');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Dialog(node_1, {
		modal: true,
		'aria-label': 'Region settings',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			Stack($$anchor, {
				gap: 5,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root_1();
					var node_2 = $.sibling($.first_child(fragment_2), 2);

					Dropdown(node_2, {
						portalMenu: true,
						titleText: 'Region',
						selectedId: 'us-south',
						items: [
							{ id: "us-south", text: "Dallas (us-south)" },
							{ id: "us-east", text: "Washington DC (us-east)" },
							{ id: "eu-de", text: "Frankfurt (eu-de)" },
							{ id: "jp-tok", text: "Tokyo (jp-tok)" },
							{ id: "br-sao", text: "São Paulo (br-sao)" },
							{ id: "au-syd", text: "Sydney (au-syd)" },
							{ id: "ca-tor", text: "Toronto (ca-tor)" },
							{ id: "de-fra", text: "Frankfurt (de-fra)" },
							{ id: "es-mad", text: "Madrid (es-mad)" },
							{ id: "fr-par", text: "Paris (fr-par)" },
							{ id: "in-mum", text: "Mumbai (in-mum)" },
							{ id: "it-mil", text: "Milan (it-mil)" },
							{ id: "jp-osa", text: "Osaka (jp-osa)" }
						]
					});

					var node_3 = $.sibling(node_2, 2);

					OverflowMenu(node_3, {
						portalMenu: true,
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root();
							var node_4 = $.first_child(fragment_3);

							OverflowMenuItem(node_4, { text: 'Edit' });

							var node_5 = $.sibling(node_4, 2);

							OverflowMenuItem(node_5, { text: 'Duplicate' });

							var node_6 = $.sibling(node_5, 2);

							OverflowMenuItem(node_6, { danger: true, text: 'Delete' });
							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_3, 2);

					Button(node_7, {
						kind: 'secondary',
						$$events: { click: () => open = false },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Close');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}