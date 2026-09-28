import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import CommandBasic from "./command-basic.svelte";
import CommandInline from "./command-inline.svelte";
import CommandManyItems from "./command-many-items.svelte";
import CommandWithGroups from "./command-with-groups.svelte";
import CommandWithShortcuts from "./command-with-shortcuts.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Command($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			CommandInline(node, {});

			var node_1 = $.sibling(node, 2);

			CommandBasic(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			CommandWithShortcuts(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			CommandWithGroups(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			CommandManyItems(node_4, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}