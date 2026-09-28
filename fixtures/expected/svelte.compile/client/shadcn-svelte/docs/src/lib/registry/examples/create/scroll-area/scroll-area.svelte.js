import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ScrollAreaHorizontal from "./scroll-area-horizontal.svelte";
import ScrollAreaVertical from "./scroll-area-vertical.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Scroll_area($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ScrollAreaVertical(node, {});

			var node_1 = $.sibling(node, 2);

			ScrollAreaHorizontal(node_1, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}