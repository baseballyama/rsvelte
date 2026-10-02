import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AlertBasic from "./alert-basic.svelte";
import AlertDestructive from "./alert-destructive.svelte";
import AlertWithActions from "./alert-with-actions.svelte";
import AlertWithIcons from "./alert-with-icons.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Alert($$anchor) {
	ExampleWrapper($$anchor, {
		class: 'lg:grid-cols-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AlertBasic(node, {});

			var node_1 = $.sibling(node, 2);

			AlertWithIcons(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			AlertDestructive(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			AlertWithActions(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}