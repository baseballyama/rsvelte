import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, OverflowMenu, OverflowMenuItem, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p>With the same default <code>target</code> resolution as inside a <code>&lt;dialog&gt;</code>, portalled menus mount into this <code>[popover]</code> element so they stay in the popover top layer.</p> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <div popover="manual" style="width: min(100%, 28rem); padding: 1rem; border: 1px dashed var(--cds-border-subtle);"><!></div>`, 1);

export default function FloatingPortalPopover($$anchor) {
	let popover = null;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		type: 'button',
		$$events: { click: () => popover?.showPopover() },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Open popover');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Stack(node_1, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_2 = $.sibling($.first_child(fragment_1), 2);

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
					var fragment_2 = root();
					var node_4 = $.first_child(fragment_2);

					OverflowMenuItem(node_4, { text: 'Edit' });

					var node_5 = $.sibling(node_4, 2);

					OverflowMenuItem(node_5, { text: 'Duplicate' });

					var node_6 = $.sibling(node_5, 2);

					OverflowMenuItem(node_6, { danger: true, text: 'Delete' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_3, 2);

			Button(node_7, {
				kind: 'secondary',
				type: 'button',
				$$events: { click: () => popover?.hidePopover() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Close');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => popover = $$value, () => popover);
	$.append($$anchor, fragment);
}