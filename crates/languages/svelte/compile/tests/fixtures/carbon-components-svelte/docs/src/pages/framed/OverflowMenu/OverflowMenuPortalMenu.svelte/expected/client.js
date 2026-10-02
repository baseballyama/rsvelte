import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { OverflowMenu, OverflowMenuItem, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

var root_1 = $.from_html(
	`<div>This container has hidden overflow. Without <code>portalMenu</code>, the
    menu would be clipped.</div> <!>`,
	1
);

export default function OverflowMenuPortalMenu($$anchor) {
	Stack($$anchor, {
		gap: 4,
		style: 'overflow: hidden; border: 1px dashed var(--cds-border-subtle); padding: 1rem; max-height: 120px;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.sibling($.first_child(fragment_1), 2);

			OverflowMenu(node, {
				portalMenu: true,
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					OverflowMenuItem(node_1, { text: 'Edit' });

					var node_2 = $.sibling(node_1, 2);

					OverflowMenuItem(node_2, { text: 'Duplicate' });

					var node_3 = $.sibling(node_2, 2);

					OverflowMenuItem(node_3, { danger: true, text: 'Delete' });
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}