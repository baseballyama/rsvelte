import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";

var root = $.from_html(`<span data-testid="nested-tab" role="tab">Nested tab</span>`);
var root_1 = $.from_html(`<!> <!> <!>`, 1);

export default function ContentSwitcher_nested_test($$anchor) {
	ContentSwitcher($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Switch(node, { text: 'Outer 1' });

			var node_1 = $.sibling(node, 2);

			Switch(node_1, {
				children: ($$anchor, $$slotProps) => {
					var span = root();

					$.append($$anchor, span);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Switch(node_2, { text: 'Outer 3' });
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}