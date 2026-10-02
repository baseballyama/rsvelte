import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function ContentSwitcher_disabled_test($$anchor) {
	ContentSwitcher($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Switch(node, { text: 'Enabled' });

			var node_1 = $.sibling(node, 2);

			Switch(node_1, { text: 'Disabled', disabled: true });

			var node_2 = $.sibling(node_1, 2);

			Switch(node_2, { text: 'Also Enabled' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}