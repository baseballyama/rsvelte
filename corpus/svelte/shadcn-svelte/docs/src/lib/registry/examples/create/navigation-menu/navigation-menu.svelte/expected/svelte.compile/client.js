import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import NavigationMenuWithViewport from "./navigation-menu-with-viewport.svelte";
import NavigationMenuWithoutViewport from "./navigation-menu-without-viewport.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Navigation_menu($$anchor) {
	ExampleWrapper($$anchor, {
		class: 'lg:grid-cols-1',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			NavigationMenuWithViewport(node, {});

			var node_1 = $.sibling(node, 2);

			NavigationMenuWithoutViewport(node_1, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}