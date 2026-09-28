import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SonnerBasic from "./sonner-basic.svelte";
import SonnerWithDescription from "./sonner-with-description.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function Sonner($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			SonnerBasic(node, {});

			var node_1 = $.sibling(node, 2);

			SonnerWithDescription(node_1, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}