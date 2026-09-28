import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import DrawerScrollableContent from "./drawer-scrollable-content.svelte";
import DrawerWithSides from "./drawer-with-sides.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Drawer($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			DrawerScrollableContent(node, {});

			var node_1 = $.sibling(node, 2);

			DrawerWithSides(node_1, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}