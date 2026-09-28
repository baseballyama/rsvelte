import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ContentSwitcher from "carbon-components-svelte/ContentSwitcher/ContentSwitcher.svelte";
import Switch from "carbon-components-svelte/ContentSwitcher/Switch.svelte";
import Dashboard from "carbon-icons-svelte/lib/Dashboard.svelte";
import List from "carbon-icons-svelte/lib/List.svelte";
import TableOfContents from "carbon-icons-svelte/lib/TableOfContents.svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function ContentSwitcher_lowContrastIconOnly_test($$anchor) {
	ContentSwitcher($$anchor, {
		lowContrast: true,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Switch(node, {
				get icon() {
					return TableOfContents;
				},
				text: 'Table of contents'
			});

			var node_1 = $.sibling(node, 2);

			Switch(node_1, {
				get icon() {
					return Dashboard;
				},
				text: 'Dashboard'
			});

			var node_2 = $.sibling(node_1, 2);

			Switch(node_2, {
				get icon() {
					return List;
				},
				text: 'List'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}