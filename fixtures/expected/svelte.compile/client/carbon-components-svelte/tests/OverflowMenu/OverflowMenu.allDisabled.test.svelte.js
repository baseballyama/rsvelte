import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function OverflowMenu_allDisabled_test($$anchor) {
	OverflowMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			OverflowMenuItem(node, { disabled: true, text: 'Manage credentials' });

			var node_1 = $.sibling(node, 2);

			OverflowMenuItem(node_1, { disabled: true, text: 'API documentation' });

			var node_2 = $.sibling(node_1, 2);

			OverflowMenuItem(node_2, { disabled: true, text: 'Delete service' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}