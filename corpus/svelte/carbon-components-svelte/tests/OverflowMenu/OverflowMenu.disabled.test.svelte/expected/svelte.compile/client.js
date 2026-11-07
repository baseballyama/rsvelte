import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import OverflowMenu from "carbon-components-svelte/OverflowMenu/OverflowMenu.svelte";
import OverflowMenuItem from "carbon-components-svelte/OverflowMenu/OverflowMenuItem.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function OverflowMenu_disabled_test($$anchor) {
	OverflowMenu($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			OverflowMenuItem(node, { text: 'First' });

			var node_1 = $.sibling(node, 2);

			OverflowMenuItem(node_1, { disabled: true, text: 'Second (disabled)' });

			var node_2 = $.sibling(node_1, 2);

			OverflowMenuItem(node_2, { text: 'Third' });

			var node_3 = $.sibling(node_2, 2);

			OverflowMenuItem(node_3, { disabled: true, text: 'Fourth (disabled)' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}