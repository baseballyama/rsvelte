import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import TextareaBasic from "./textarea-basic.svelte";
import TextareaDisabled from "./textarea-disabled.svelte";
import TextareaInvalid from "./textarea-invalid.svelte";
import TextareaWithDescription from "./textarea-with-description.svelte";
import TextareaWithLabel from "./textarea-with-label.svelte";
import ExampleWrapper from "../../../../../routes/(app)/(layout)/(create)/components/example-wrapper.svelte";

var root = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function Textarea($$anchor) {
	ExampleWrapper($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			TextareaBasic(node, {});

			var node_1 = $.sibling(node, 2);

			TextareaInvalid(node_1, {});

			var node_2 = $.sibling(node_1, 2);

			TextareaWithLabel(node_2, {});

			var node_3 = $.sibling(node_2, 2);

			TextareaWithDescription(node_3, {});

			var node_4 = $.sibling(node_3, 2);

			TextareaDisabled(node_4, {});
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}