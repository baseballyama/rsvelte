import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CollapsibleFileTree from "./collapsible-file-tree.svelte";
import CollapsibleSettings from "./collapsible-settings.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Collapsible($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CollapsibleFileTree(node, {});

			var node_1 = $.sibling(node, 2);

			CollapsibleSettings(node_1, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}