import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Dropdown, Stack } from "carbon-components-svelte";

var root = $.from_html(
	`<div>This container has hidden overflow. Without <code>portalMenu</code>, the
    dropdown would be clipped.</div> <!>`,
	1
);

export default function DropdownPortalMenu($$anchor) {
	Stack($$anchor, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 120px;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.sibling($.first_child(fragment_1), 2);

			Dropdown(node, {
				portalMenu: true,
				labelText: 'Preferred channel',
				selectedId: '0',
				items: [
					{ id: "0", text: "Slack" },
					{ id: "1", text: "Email" },
					{ id: "2", text: "Fax" }
				]
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}