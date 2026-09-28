import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import ResizableControlled from "./resizable-controlled.svelte";
import ResizableHorizontal from "./resizable-horizontal.svelte";
import ResizableNested from "./resizable-nested.svelte";
import ResizableVertical from "./resizable-vertical.svelte";
import ResizableWithHandle from "./resizable-with-handle.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Resizable($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			ResizableHorizontal(node, {});

			var node_1 = $.sibling(node, 2);

			ResizableVertical(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			ResizableWithHandle(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			ResizableNested(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			ResizableControlled(node_4, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}