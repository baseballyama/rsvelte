import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ContentSwitcher_size_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	ContentSwitcher(node, {
		size: 'sm',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Switch(node_1, { text: 'Small 1' });

			var node_2 = $.sibling(node_1, 2);

			Switch(node_2, { text: 'Small 2' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	ContentSwitcher(node_3, {
		size: 'xl',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			Switch(node_4, { text: 'XL 1' });

			var node_5 = $.sibling(node_4, 2);

			Switch(node_5, { text: 'XL 2' });
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}