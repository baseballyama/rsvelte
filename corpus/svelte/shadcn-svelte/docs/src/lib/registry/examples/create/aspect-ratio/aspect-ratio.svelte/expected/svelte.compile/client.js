import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import AspectRatio1x1 from "./aspect-ratio-1x1.svelte";
import AspectRatio9x16 from "./aspect-ratio-9x16.svelte";
import AspectRatio16x9 from "./aspect-ratio-16x9.svelte";
import AspectRatio21x9 from "./aspect-ratio-21x9.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function Aspect_ratio($$anchor) {
	ExampleWrapper($$anchor, {
		class: 'max-w-4xl 2xl:max-w-4xl',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			AspectRatio16x9(node, {});

			var node_1 = $.sibling(node, 2);

			AspectRatio21x9(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			AspectRatio1x1(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			AspectRatio9x16(node_3, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}