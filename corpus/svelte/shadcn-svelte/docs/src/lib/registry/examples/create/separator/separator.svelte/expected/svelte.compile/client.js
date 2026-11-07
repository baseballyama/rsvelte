import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SeparatorHorizontal from "./separator-horizontal.svelte";
import SeparatorInList from "./separator-in-list.svelte";
import SeparatorVerticalMenu from "./separator-vertical-menu.svelte";
import SeparatorVertical from "./separator-vertical.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Separator($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SeparatorHorizontal(node, {});

			var node_1 = $.sibling(node, 2);

			SeparatorVertical(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			SeparatorVerticalMenu(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			SeparatorInList(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}