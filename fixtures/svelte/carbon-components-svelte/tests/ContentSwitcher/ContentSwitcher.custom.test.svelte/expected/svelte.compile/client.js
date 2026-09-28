import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

var root = $.from_html(`<div data-testid="custom-content">Custom Content</div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ContentSwitcher_custom_test($$anchor) {
	ContentSwitcher($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Switch(node, {
				children: ($$anchor, $$slotProps) => {
					var div = root();

					$.append($$anchor, div);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Switch(node_1, { text: 'Regular Text' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}