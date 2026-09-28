import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Dropdown, OverflowMenu, OverflowMenuItem, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<p>Floating content auto-mounts into the nearest popover ancestor.</p> <!> <!> <!>`, 1);
var root_2 = $.from_html(`<button type="button" data-testid="open-popover">Open popover</button> <div data-testid="native-popover" popover="manual" style="width: min(100%, 28rem); padding: 1rem;"><!></div>`, 1);

export default function FloatingPortalPopoverFixture($$anchor) {
	let popover = null;
	var fragment = root_2();
	var button = $.first_child(fragment);
	var div = $.sibling(button, 2);
	var node = $.child(div);

	Stack(node, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.sibling($.first_child(fragment_1), 2);

			Dropdown(node_1, {
				portalMenu: true,
				labelText: 'Region',
				selectedId: 'us-south',
				items: [
					{ id: "us-south", text: "Dallas" },
					{ id: "us-east", text: "Washington DC" },
					{ id: "eu-de", text: "Frankfurt" },
					{ id: "jp-tok", text: "Tokyo" }
				]
			});

			var node_2 = $.sibling(node_1, 2);

			OverflowMenu(node_2, {
				portalMenu: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_3 = $.first_child(fragment_2);

					OverflowMenuItem(node_3, { text: 'Edit' });

					var node_4 = $.sibling(node_3, 2);

					OverflowMenuItem(node_4, { text: 'Duplicate' });

					var node_5 = $.sibling(node_4, 2);

					OverflowMenuItem(node_5, { danger: true, text: 'Delete' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_2, 2);

			Button(node_6, {
				kind: 'secondary',
				type: 'button',
				$$events: { click: () => popover?.hidePopover() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Close');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.bind_this(div, ($$value) => popover = $$value, () => popover);
	$.event('click', button, () => popover?.showPopover());
	$.append($$anchor, fragment);
}